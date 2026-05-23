-- ============================================================================
-- Supabase PostgreSQL DDL Schema Migration File
-- AI-Powered Smart Wardrobe Assistant (Google Hackathon Edition)
-- Execute this file in your Supabase SQL Editor to provision all tables.
-- ============================================================================

-- 1. Enable the pgvector extension for style matching and search
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the Profiles table (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  location_city TEXT DEFAULT 'New York',
  temperature_unit VARCHAR(1) DEFAULT 'F', -- 'F' or 'C'
  daily_ootd_time TIME DEFAULT '07:00:00',
  budget_cap_usd NUMERIC(10, 2) DEFAULT 100.00,
  style_preference_vector VECTOR(1536), -- Running average of style embeddings (from text-embedding-004)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS) on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and edit their own profiles"
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

-- 3. Create the Wardrobe Items table
CREATE TABLE IF NOT EXISTS public.wardrobe_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL, -- Public link to the storage bucket
  category VARCHAR(50) NOT NULL, -- Top, Bottom, Outerwear, Footwear, Accessory, One-piece
  sub_category VARCHAR(100), -- Blazer, Knit Sweater, Chinos, Chelsea Boots, T-shirt
  color_family VARCHAR(50), -- Navy Blue, Beige, Charcoal Gray, etc.
  pattern VARCHAR(50), -- Solid, Striped, Plaid, Floral, etc.
  fabric VARCHAR(50), -- Linen, Heavy Denim, Merino Wool, etc.
  formality VARCHAR(50), -- Formal, Smart Casual, Casual, Athletic, Loungewear
  min_temp INT DEFAULT 32, -- Minimum suitable Fahrenheit temperature
  max_temp INT DEFAULT 85, -- Maximum suitable Fahrenheit temperature
  precipitation_resistant BOOLEAN DEFAULT false,
  style_embedding VECTOR(1536), -- Embedded text representation of the item tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on Wardrobe Items
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own wardrobe items"
  ON public.wardrobe_items FOR ALL
  USING (auth.uid() = user_id);

-- 4. Create the User Feedbacks table for reinforcement learning
CREATE TABLE IF NOT EXISTS public.user_feedbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  outfit_item_ids UUID[] NOT NULL, -- Array of item UUIDs used in the pairing
  liked BOOLEAN NOT NULL, -- true = Like, false = Dislike
  dislike_reason TEXT, -- Optional, e.g., "Too warm", "Color clash", "Too formal"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on User Feedbacks
ALTER TABLE public.user_feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own feedbacks"
  ON public.user_feedbacks FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. Vector Search Cosine Similarity Matching Function
-- Runs cosine similarity calculations directly in-database over style_embeddings.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.match_wardrobe_items (
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  filter_user_id UUID
)
RETURNS TABLE (
  id UUID,
  image_url TEXT,
  category VARCHAR,
  sub_category VARCHAR,
  color_family VARCHAR,
  pattern VARCHAR,
  fabric VARCHAR,
  formality VARCHAR,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    wi.id,
    wi.image_url,
    wi.category,
    wi.sub_category,
    wi.color_family,
    wi.pattern,
    wi.fabric,
    wi.formality,
    1 - (wi.style_embedding <=> query_embedding) AS similarity
  FROM public.wardrobe_items wi
  WHERE wi.user_id = filter_user_id
    AND 1 - (wi.style_embedding <=> query_embedding) > match_threshold
  ORDER BY wi.style_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================================
-- 6. Trigger to automatically provision a profile row when a user signs up
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, location_city, temperature_unit)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Wardrobe User'),
    'New York',
    'F'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution link
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
