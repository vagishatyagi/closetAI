# Design Specification: AI Smart Wardrobe (Google Hackathon Edition)

Welcome to the **AI Smart Wardrobe** design specification. This application is a heavily supercharged wardrobe assistant combining multi-modal Gemini analysis, contextual weather/schedule integration, budget catalog monitoring, and virtual try-ons via Google Imagen. 

---

## 1. Application Features

1. **Digital Closet Dashboard**: A sleek, glassmorphic grid displaying the user's uploaded wardrobe catalog sorted by category, sub-category, color, and fabric.
2. **Multi-Modal Auto-Tagger**: Fully automates closet tagging by prompting Gemini to parse raw clothing photo uploads and extract detailed structural/stylistic tags.
3. **Daily OOTD Planner**: A scheduled worker that queries the local weather and upcoming calendar events, matching them with the user's closet and previous fashion preferences to suggest the perfect outfits.
4. **Smart Wardrobe Recommender**: Scrapes target store catalogs under a set budget, evaluates compatibility with existing items, and serves hot recommendations.
5. **Virtual Mannequin (Try-on)**: Allows users to virtually try on new catalog items superimposed onto their profile photo using Google Imagen 3 Inpainting.
6. **Like/Dislike Preference Engine**: Learns user aesthetics over time using implicit vector alignment (`pgvector` cosine similarity) and explicit feed-in prompt engineering.

---

## 2. Centralized Configuration (`src/config/aiConfig.ts`)

All Gemini models and system guidelines are managed globally to make swap-outs trivial during the hackathon:

- **Wardrobe Tagger Model**: `gemini-1.5-flash` (Optimized for speed and multi-modal image classification)
- **OOTD Synthesis Brain**: `gemini-3.1-pro` (Optimized for complex reasoning, multi-context instruction following, and high rate limits)
- **Virtual Try-On Engine**: `Google Imagen 3 (Vertex AI Edit API)` (Optimized for high-fidelity image editing and mask inpainting)

---

## 3. Database Schema (Supabase PostgreSQL)

### A. Table: `profiles`
Tracks user settings, locations, calendars, and overall budget preferences.
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  location_city TEXT DEFAULT 'New York',
  temperature_unit VARCHAR(1) DEFAULT 'F', -- 'F' or 'C'
  daily_ootd_time TIME DEFAULT '07:00:00',
  budget_cap_usd NUMERIC(10, 2) DEFAULT 100.00,
  style_preference_vector VECTOR(1536), -- Running averaged style preference embedding
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### B. Table: `wardrobe_items`
Stores structural clothing metadata and the computed aesthetic embeddings.
```sql
CREATE TABLE wardrobe_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL, -- GCS/Supabase storage url
  category VARCHAR(50) NOT NULL, -- Top, Bottom, Outerwear, Footwear, etc.
  sub_category VARCHAR(100), -- Blazer, Chinos, Chelsea Boots, etc.
  color_family VARCHAR(50),
  pattern VARCHAR(50),
  fabric VARCHAR(50),
  formality VARCHAR(50), -- Formal, Casual, Smart Casual, Athletic
  min_temp INT,
  max_temp INT,
  precipitation_resistant BOOLEAN DEFAULT false,
  style_embedding VECTOR(1536), -- Generated via text-embedding-004
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### C. Table: `user_feedbacks`
Logs likes, dislikes, and explicit reasons to close the style reinforcement loop.
```sql
CREATE TABLE user_feedbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  outfit_item_ids UUID[] NOT NULL, -- Array of wardrobe item IDs in the outfit
  liked BOOLEAN NOT NULL, -- true for like, false for dislike
  dislike_reason TEXT, -- "too formal", "color clash", etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

---

## 4. API Endpoints Reference

| Route | Method | Description | Payloads |
| :--- | :--- | :--- | :--- |
| `/api/wardrobe/upload` | `POST` | Uploads binary image file to Supabase storage. | Form-data: `file` |
| `/api/wardrobe/tag` | `POST` | Multi-modal auto-tagger. Triggered after upload. | JSON: `{ imageUrl: string }` |
| `/api/ootd/generate` | `GET` | Compiles the OOTD. Fetches weather + calendar + closet, and calls Gemini. | None (Uses user session) |
| `/api/ootd/cron` | `POST` | Cron worker triggered daily by Vercel to dispatch email newsletters. | Header: `Authorization: Bearer CRON_SECRET` |
| `/api/catalog/recommend` | `GET` | Evaluates scraped stores against closet vector embeddings under budget limits. | JSON: `{ budget: number }` |
| `/api/tryon/generate` | `POST` | Processes segmentation and runs Imagen 3 to try on clothing. | JSON: `{ baseImage: string, shopImage: string }` |
| `/api/ootd/feedback` | `POST` | Captures likes/dislikes and updates the user style vector. | JSON: `{ combinationIds: string[], liked: boolean }` |

---

## 5. Structured Logging & Security Standards

- **Strict Key Governance**: No API keys are written directly into code. Environment variables `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, and `WEATHER_API_KEY` are read exclusively at server runtime.
- **Log Sanitation**: 
  - Every function logs its entry and parameter types.
  - LLM completion events log: `{ model: string, tokenCount: number, promptSnippet: string }`.
  - Base64 images and binaries are stripped from log streams to maintain high-performance logging speeds.
