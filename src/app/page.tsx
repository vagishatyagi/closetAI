"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, Cloud, Sparkles, Filter, CheckCircle2, Loader2, 
  Trash2, Sun, Calendar, Mail, Heart, RefreshCw, ShoppingBag,
  ArrowRight, Sparkle, LogIn, Compass, ShieldCheck, MapPin, DollarSign,
  User, Check
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// FEMININE MOCK WARDROBE
const FEMALE_WARDROBE = [
  {
    id: "f1",
    category: "Outerwear",
    sub_category: "Trench Coat",
    color_family: "Beige",
    pattern: "Solid",
    fabric: "Gabardine / Cotton Blend",
    formality: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop&q=60",
    min_temp: 35,
    max_temp: 60,
    precipitation_resistant: true,
    aesthetic: "Classic Minimalist"
  },
  {
    id: "f2",
    category: "Top",
    sub_category: "Knit Cardigan",
    color_family: "Cream White",
    pattern: "Textured",
    fabric: "Merino Wool",
    formality: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=60",
    min_temp: 40,
    max_temp: 65,
    precipitation_resistant: false,
    aesthetic: "Academia"
  },
  {
    id: "f3",
    category: "One-piece",
    sub_category: "Floral Sun Dress",
    color_family: "Soft Pink",
    pattern: "Floral",
    fabric: "Silk Blend",
    formality: "Casual",
    image_url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=60",
    min_temp: 65,
    max_temp: 85,
    precipitation_resistant: false,
    aesthetic: "Boho"
  },
  {
    id: "f4",
    category: "Bottom",
    sub_category: "Pleated Midi Skirt",
    color_family: "Charcoal Gray",
    pattern: "Solid",
    fabric: "Wool Crepe",
    formality: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&auto=format&fit=crop&q=60",
    min_temp: 45,
    max_temp: 70,
    precipitation_resistant: false,
    aesthetic: "Classic Minimalist"
  },
  {
    id: "f5",
    category: "Footwear",
    sub_category: "Leather Ankle Boots",
    color_family: "Tan Brown",
    pattern: "Solid",
    fabric: "Suede",
    formality: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&auto=format&fit=crop&q=60",
    min_temp: 30,
    max_temp: 65,
    precipitation_resistant: true,
    aesthetic: "Classic Minimalist"
  },
  {
    id: "f6",
    category: "Top",
    sub_category: "Satin Blouse",
    color_family: "Emerald Green",
    pattern: "Solid",
    fabric: "Silk",
    formality: "Formal",
    image_url: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=500&auto=format&fit=crop&q=60",
    min_temp: 55,
    max_temp: 80,
    precipitation_resistant: false,
    aesthetic: "Classic Minimalist"
  }
];

// MASCULINE MOCK WARDROBE
const MALE_WARDROBE = [
  {
    id: "m1",
    category: "Outerwear",
    sub_category: "Trench Coat",
    color_family: "Beige",
    pattern: "Solid",
    fabric: "Gabardine / Cotton Blend",
    formality: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop&q=60",
    min_temp: 35,
    max_temp: 60,
    precipitation_resistant: true,
    aesthetic: "Classic Minimalist"
  },
  {
    id: "m2",
    category: "Top",
    sub_category: "Knit Sweater",
    color_family: "Charcoal Gray",
    pattern: "Textured",
    fabric: "Merino Wool",
    formality: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?w=500&auto=format&fit=crop&q=60",
    min_temp: 20,
    max_temp: 50,
    precipitation_resistant: false,
    aesthetic: "Academia"
  },
  {
    id: "m3",
    category: "Bottom",
    sub_category: "Chinos",
    color_family: "Navy Blue",
    pattern: "Solid",
    fabric: "Cotton Twill",
    formality: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500&auto=format&fit=crop&q=60",
    min_temp: 45,
    max_temp: 75,
    precipitation_resistant: false,
    aesthetic: "Preppy"
  },
  {
    id: "m4",
    category: "Footwear",
    sub_category: "Chelsea Boots",
    color_family: "Tan Brown",
    pattern: "Solid",
    fabric: "Suede Leather",
    formality: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&auto=format&fit=crop&q=60",
    min_temp: 30,
    max_temp: 65,
    precipitation_resistant: false,
    aesthetic: "Classic Minimalist"
  },
  {
    id: "m5",
    category: "Top",
    sub_category: "Linen Shirt",
    color_family: "White",
    pattern: "Solid",
    fabric: "Linen",
    formality: "Casual",
    image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=60",
    min_temp: 65,
    max_temp: 85,
    precipitation_resistant: false,
    aesthetic: "Old Money Coastal"
  },
  {
    id: "m6",
    category: "Outerwear",
    sub_category: "Double-Breasted Blazer",
    color_family: "Forest Green",
    pattern: "Solid",
    fabric: "Wool Tweed",
    formality: "Formal",
    image_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&auto=format&fit=crop&q=60",
    min_temp: 40,
    max_temp: 65,
    precipitation_resistant: false,
    aesthetic: "English Countryside"
  }
];

// FEMININE SHOP RECOMMENDATIONS
const FEMALE_SHOP_RECOMMENDATIONS = [
  {
    id: "s_f1",
    store: "Everlane",
    title: "Linen Midi Dress",
    price: "$88.00",
    originalPrice: "$118.00",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200&auto=format&fit=crop&q=60",
    score: "96%"
  },
  {
    id: "s_f2",
    store: "Zara",
    title: "Satin Double-Breasted Blazer",
    price: "$69.90",
    originalPrice: "$89.90",
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=200&auto=format&fit=crop&q=60",
    score: "92%"
  }
];

// MASCULINE SHOP RECOMMENDATIONS
const MALE_SHOP_RECOMMENDATIONS = [
  {
    id: "s_m1",
    store: "Zara",
    title: "Textured Linen Trousers",
    price: "$49.90",
    originalPrice: "$69.90",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=200&auto=format&fit=crop&q=60",
    score: "94%"
  },
  {
    id: "s_m2",
    store: "Uniqlo",
    title: "Ultra Light Quilted Parka",
    price: "$79.90",
    originalPrice: "$99.90",
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=200&auto=format&fit=crop&q=60",
    score: "89%"
  }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isOnboarding, setIsOnboarding] = useState<boolean>(false);
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  
  // User profile settings
  const [userProfile, setUserProfile] = useState({
    fullName: "",
    email: "",
    gender: "female", // "female" | "male"
    locationCity: "New York",
    budgetLimit: 100,
    preferredAesthetics: [] as string[]
  });

  const [items, setItems] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [uploadStatus, setUploadStatus] = useState<string>(""); 
  const [taggingResult, setTaggingResult] = useState<any>(null);
  
  // Interactive Daily OOTD Pitch Simulator States
  const [ootdScenario, setOotdScenario] = useState<string>("business-rain");
  const [ootdResult, setOotdResult] = useState<any>(null);
  const [isGeneratingOOTD, setIsGeneratingOOTD] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [likedOOTD, setLikedOOTD] = useState<boolean | null>(null);

  // Initialize closet depending on selected gender
  useEffect(() => {
    if (isAuthenticated) {
      if (userProfile.gender === "female") {
        setItems(FEMALE_WARDROBE);
      } else {
        setItems(MALE_WARDROBE);
      }
    }
  }, [isAuthenticated, userProfile.gender]);

  // Fetch real Supabase closet items fallback
  useEffect(() => {
    if (isAuthenticated) {
      fetchClosetItems();
    }
  }, [isAuthenticated]);

  const fetchClosetItems = async () => {
    try {
      const { data, error } = await supabase
        .from("wardrobe_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setItems(data);
      } else {
        setItems(userProfile.gender === "female" ? FEMALE_WARDROBE : MALE_WARDROBE);
      }
    } catch (err) {
      console.error("Failed to fetch wardrobe:", err);
      setItems(userProfile.gender === "female" ? FEMALE_WARDROBE : MALE_WARDROBE);
    }
  };

  // Auto-Tagging Ingestion
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setTaggingResult(null);
      setUploadStatus("uploading");

      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/wardrobe/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Failed uploading file.");
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.publicUrl;

      setUploadStatus("tagging");

      const tagResponse = await fetch("/api/wardrobe/tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      if (!tagResponse.ok) {
        const errorData = await tagResponse.json();
        throw new Error(errorData.error || "Tagging failed.");
      }

      const tagData = await tagResponse.json();
      setTaggingResult(tagData.tags);
      setUploadStatus("complete");

      setItems(prev => [tagData.item, ...prev]);

      setTimeout(() => setUploadStatus(""), 4000);
    } catch (err: any) {
      console.error("Ingestion failed:", err);
      setUploadStatus("");
      alert(err.message || "An error occurred during AI analysis.");
    }
  };

  // OOTD simulation loader
  const simulateOOTD = () => {
    setIsGeneratingOOTD(true);
    setLikedOOTD(null);

    setTimeout(() => {
      let result = null;
      if (userProfile.gender === "female") {
        if (ootdScenario === "business-rain") {
          result = {
            scenario: "Professional Boardroom & Heavy Rain",
            weather: `50°F • Rain (85% risk) • Winds in ${userProfile.locationCity}`,
            schedule: "09:30 AM - Executive Client Briefing",
            items: ["f6", "f4", "f1"], // Satin Blouse, Pleated Skirt, Trench Coat
            reasoning: `To dominate your Executive Briefing in wet 50°F weather, we selected your rich Emerald Green Satin Blouse paired with the Pleated Skirt. Over that, the beige Gabardine Trench Coat provides excellent wind and rain resistance, ensuring you enter the boardroom dry, warm, and highly polished.`
          };
        } else if (ootdScenario === "casual-sunny") {
          result = {
            scenario: "Sunday Brunch Celebration",
            weather: `72°F • Bright Sun (0% rain) • Clear Skies in ${userProfile.locationCity}`,
            schedule: "11:30 AM - Outdoor Team Brunch Social",
            items: ["f3", "f5"], // Floral Sun Dress, Suede Chelsea boots
            reasoning: "For a warm, sun-kissed 72°F afternoon, we styled your Soft Pink Floral Sun Dress. Its lightweight silk-blend fabric offers superb breathability, while the Tan Suede Chelsea Boots keep the look highly curated, comfortable, and transition-ready."
          };
        } else {
          result = {
            scenario: "Evening Technical Design Sync",
            weather: `38°F • Chilly Dusk • Clear UV in ${userProfile.locationCity}`,
            schedule: "6:00 PM - Research Sync at Coffee Lounge",
            items: ["f2", "f4", "f5"], // Knit Cardigan, Pleated Midi, Suede Chelsea Boots
            reasoning: "To keep you insulated for a chilly 38°F dusk session, we matched the heavy Cream Knit Cardigan with your Crepe Midi Skirt. Complete the combination with your Tan Chelsea boots to maintain a smart-academic aesthetic while feeling thoroughly warm."
          };
        }
      } else {
        // Masculine
        if (ootdScenario === "business-rain") {
          result = {
            scenario: "Corporate Pitch & Heavy Rain",
            weather: `50°F • Rain (85% risk) • Active Storm in ${userProfile.locationCity}`,
            schedule: "10:00 AM - Venture Showcase Pitch",
            items: ["m6", "m3", "m1"], // Blazer, Chinos, Trench Coat
            reasoning: `To represent absolute confidence in damp 50°F weather, we styled your structured Forest Green Tweed Blazer over Navy Cotton Chinos. Layering with your beige Gabardine Trench Coat provides robust waterproofing to ensure a clean, dry arrival.`
          };
        } else if (ootdScenario === "casual-sunny") {
          result = {
            scenario: "Outdoor Team Brunch Celebration",
            weather: `72°F • Sunny • Light Breeze in ${userProfile.locationCity}`,
            schedule: "11:30 AM - Open-Air Team Lunch",
            items: ["m5", "m3"], // Linen Shirt, Chinos
            reasoning: "Under clear blue skies and a high of 72°F, we combined the breathable White Linen Shirt with Navy Chinos. It creates a classic, effortlessly tailored summer silhouette that is breathable and sophisticated for outdoor dining."
          };
        } else {
          result = {
            scenario: "Evening Technical Review",
            weather: `38°F • Cold Breeze • Clear Sky in ${userProfile.locationCity}`,
            schedule: "5:00 PM - Late Technical Writing Sync",
            items: ["m2", "m3", "m4"], // Knit Sweater, Chinos, Chelsea Boots
            reasoning: "For a freezing 38°F evening session, the Merino Wool Charcoal Sweater provides dense heat insulation. Combining it with Navy Cotton Chinos and Leather Chelsea Boots guarantees you stay thoroughly warm, structured, and focused."
          };
        }
      }

      setOotdResult(result);
      setSelectedItems(result.items);
      setIsGeneratingOOTD(false);
    }, 1200);
  };

  useEffect(() => {
    if (isAuthenticated) {
      simulateOOTD();
    }
  }, [ootdScenario, isAuthenticated]);

  const handleDeleteItem = async (id: string) => {
    if (id.startsWith("m") || id.startsWith("f")) {
      setItems(prev => prev.filter(item => item.id !== id));
      return;
    }

    try {
      const { error } = await supabase.from("wardrobe_items").delete().eq("id", id);
      if (error) throw error;
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const filteredItems = activeCategory === "All"
    ? items
    : items.filter(item => item.category.toLowerCase() === activeCategory.toLowerCase());

  // Handle onboarding submission
  const handleOnboardingSubmit = async () => {
    try {
      setIsOnboarding(false);
      setIsAuthenticated(true);
      
      // Proactively provision user profile row in database
      await supabase
        .from("profiles")
        .upsert({
          id: "00000000-0000-0000-0000-000000000000",
          full_name: userProfile.fullName || "Elegant Style Partner",
          location_city: userProfile.locationCity,
          temperature_unit: "F",
          budget_cap_usd: userProfile.budgetLimit
        });
    } catch (err) {
      console.error("Failed to sync profile to database", err);
    }
  };

  // Handle simulated login
  const handleMockLogin = () => {
    setUserProfile({
      fullName: "Elegant Partner",
      email: "partner@example.com",
      gender: "female",
      locationCity: "New York",
      budgetLimit: 120,
      preferredAesthetics: ["Classic Minimalist", "Academia"]
    });
    setIsAuthenticated(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white relative overflow-x-hidden">
      {/* Premium Ambient Background Blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-purple-900/15 via-indigo-950/5 to-transparent pointer-events-none blur-3xl z-0" />
      <div className="absolute top-[30%] -right-[10%] w-[400px] h-[400px] bg-purple-500/5 rounded-full pointer-events-none blur-3xl z-0" />
      <div className="absolute bottom-[20%] -left-[10%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full pointer-events-none blur-3xl z-0" />

      {/* 1. BRAND NEW ATTRACTIVE LANDING PAGE (SIGNED OUT) */}
      <AnimatePresence mode="wait">
        {!isAuthenticated && !isOnboarding && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-6 py-20 text-center z-10"
          >
            {/* Elegant Badge */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/30 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-8 shadow-inner shadow-purple-500/10"
            >
              <Sparkle className="h-3.5 w-3.5 animate-pulse text-purple-400" />
              Intelligent Fashion Synthesis
            </motion.div>

            {/* Mindfulreset Hero Header */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-none max-w-3xl"
            >
              A mindful reset <br />
              <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-indigo-300 bg-clip-text">to your closet.</span>
            </motion.h1>

            {/* Hero Subtitle */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-base md:text-xl text-slate-400 mt-6 max-w-2xl leading-relaxed"
            >
              Your closet at your fingertips. Align your wardrobe seamlessly with daily weather, calendar requirements, and personal aesthetics.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 mt-12 w-full sm:w-auto"
            >
              <button
                onClick={() => {
                  setOnboardingStep(1);
                  setIsOnboarding(true);
                }}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-bold text-sm shadow-xl shadow-purple-600/20 hover:shadow-purple-600/30 hover:scale-[1.02] transform transition-all cursor-pointer"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>
              
              <button
                onClick={handleMockLogin}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900 transition-all font-bold text-sm text-slate-300 hover:text-white"
              >
                <LogIn className="h-4 w-4 text-purple-400" />
                Sign In
              </button>
            </motion.div>

            {/* Feature Trust Metrics */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl border-t border-slate-900/60 mt-20 pt-10 text-left"
            >
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400 shrink-0">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Contextual Pairing</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">Evaluates weather indices and calendar meetings instantly.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400 shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Gemini Tagger</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">Multi-modal AI extracts color family, fabrics, and formality.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400 shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Vector Learning</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">Likes & dislikes optimize your 1536-dimensional style preference.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 2. FIRST-TIME SIGN UP ONBOARDING FLOW */}
        {!isAuthenticated && isOnboarding && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex-1 flex items-center justify-center p-6 z-10"
          >
            <div className="w-full max-w-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-2xl rounded-2xl p-8 shadow-2xl shadow-black/50 relative overflow-hidden">
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-indigo-500 to-indigo-300" />

              {/* Progress Indicator */}
              <div className="flex gap-1.5 mb-8">
                {[1, 2, 3, 4].map(idx => (
                  <div 
                    key={idx} 
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      onboardingStep >= idx ? "bg-purple-500" : "bg-slate-800"
                    }`}
                  />
                ))}
              </div>

              {/* Step 1: Profile & Credentials */}
              {onboardingStep === 1 && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1.5">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Create your Profile</h2>
                    <p className="text-xs text-slate-400">Let's start your personalized wardrobe integration.</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        value={userProfile.fullName}
                        onChange={(e) => setUserProfile({ ...userProfile, fullName: e.target.value })}
                        placeholder="Vagisha Tyagi"
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</label>
                      <input 
                        type="email" 
                        value={userProfile.email}
                        onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                        placeholder="vagisha.tyagi001@gmail.com"
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!userProfile.fullName || !userProfile.email) {
                        alert("Please fill in your name and email to proceed.");
                        return;
                      }
                      setOnboardingStep(2);
                    }}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/10 hover:shadow-purple-600/20 hover:scale-[1.01] transition-all cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* Step 2: Gender-Specific Preference */}
              {onboardingStep === 2 && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1.5">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Your Wardrobe Direction</h2>
                    <p className="text-xs text-slate-400">Choose the type of garments to populate and recommend. This ensures highly relevant selections.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <button
                      onClick={() => setUserProfile({ ...userProfile, gender: "female" })}
                      className={`flex flex-col items-center justify-center p-6 rounded-2xl border text-center transition-all ${
                        userProfile.gender === "female"
                          ? "bg-purple-600/10 border-purple-500 text-white shadow-lg shadow-purple-500/5"
                          : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800"
                      }`}
                    >
                      <div className="h-10 w-10 rounded-full bg-purple-950/40 border border-purple-900/20 flex items-center justify-center text-purple-400 mb-3 text-lg font-bold">♀</div>
                      <span className="text-xs font-bold">Feminine Aesthetic</span>
                      <span className="text-[10px] text-slate-500 mt-1">Dresses, skirts, light tops & cardigans</span>
                    </button>
                    <button
                      onClick={() => setUserProfile({ ...userProfile, gender: "male" })}
                      className={`flex flex-col items-center justify-center p-6 rounded-2xl border text-center transition-all ${
                        userProfile.gender === "male"
                          ? "bg-purple-600/10 border-purple-500 text-white shadow-lg shadow-purple-500/5"
                          : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800"
                      }`}
                    >
                      <div className="h-10 w-10 rounded-full bg-purple-950/40 border border-purple-900/20 flex items-center justify-center text-purple-400 mb-3 text-lg font-bold">♂</div>
                      <span className="text-xs font-bold">Masculine Aesthetic</span>
                      <span className="text-[10px] text-slate-500 mt-1">Trousers, blazers, knitwear & boots</span>
                    </button>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setOnboardingStep(1)}
                      className="flex-1 py-3 rounded-xl border border-slate-800 hover:bg-slate-900 text-xs font-bold text-slate-400"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setOnboardingStep(3)}
                      className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-bold text-xs"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Location & Budget Preferences */}
              {onboardingStep === 3 && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1.5">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Weather & Budget Integrations</h2>
                    <p className="text-xs text-slate-400">Configure parameters to customize local temperature adjustments and store filters.</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-purple-400" /> Current City</label>
                      <input 
                        type="text" 
                        value={userProfile.locationCity}
                        onChange={(e) => setUserProfile({ ...userProfile, locationCity: e.target.value })}
                        placeholder="e.g. San Francisco or London"
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-purple-400" /> Catalog Budget Limit (USD)</label>
                      <input 
                        type="number" 
                        value={userProfile.budgetLimit}
                        onChange={(e) => setUserProfile({ ...userProfile, budgetLimit: parseInt(e.target.value) || 100 })}
                        placeholder="e.g. 100"
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-purple-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setOnboardingStep(2)}
                      className="flex-1 py-3 rounded-xl border border-slate-800 hover:bg-slate-900 text-xs font-bold text-slate-400"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setOnboardingStep(4)}
                      className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-bold text-xs"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Core Style Aesthetics */}
              {onboardingStep === 4 && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1.5">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Your Personal Aesthetic</h2>
                    <p className="text-xs text-slate-400">Select at least two style aesthetics to guide Gemini's pairing logic. You can change these anytime.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-[180px] overflow-y-auto pr-1">
                    {[
                      "Classic Minimalist",
                      "Academia",
                      "Streetwear",
                      "Preppy",
                      "Grunge",
                      "Boho Chic",
                      "Old Money Coastal"
                    ].map(aesthetic => {
                      const isSelected = userProfile.preferredAesthetics.includes(aesthetic);
                      return (
                        <button
                          key={aesthetic}
                          onClick={() => {
                            if (isSelected) {
                              setUserProfile({
                                ...userProfile,
                                preferredAesthetics: userProfile.preferredAesthetics.filter(item => item !== aesthetic)
                              });
                            } else {
                              setUserProfile({
                                ...userProfile,
                                preferredAesthetics: [...userProfile.preferredAesthetics, aesthetic]
                              });
                            }
                          }}
                          className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "bg-purple-600/10 border-purple-500 text-white"
                              : "bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-850"
                          }`}
                        >
                          <span className="text-[11px] font-bold">{aesthetic}</span>
                          {isSelected && <Check className="h-3 w-3 text-purple-400" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setOnboardingStep(3)}
                      className="flex-1 py-3 rounded-xl border border-slate-800 hover:bg-slate-900 text-xs font-bold text-slate-400"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleOnboardingSubmit}
                      className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Complete Reset
                      <Sparkles className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 3. DYNAMIC DIGITAL CLOSSET DASHBOARD (SIGNED IN) */}
        {isAuthenticated && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-screen"
          >
            {/* Header */}
            <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-850/80 backdrop-blur-md bg-slate-950/60 z-10 sticky top-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Sparkles className="h-5 w-5 text-white animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    ClosetAI
                  </h1>
                  <p className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">
                    Mindful Aesthetic Assistant
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1 justify-end"><User className="h-3.5 w-3.5 text-purple-400" /> {userProfile.fullName || "Elegant Partner"}</span>
                  <span className="text-[10px] text-slate-500">📍 {userProfile.locationCity} • 💰 Max Budget ${userProfile.budgetLimit}</span>
                </div>
                
                <button
                  onClick={() => setIsAuthenticated(false)}
                  className="text-xs font-semibold px-4 py-2 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900 transition-all text-slate-400 hover:text-white"
                >
                  Log Out
                </button>
              </div>
            </header>

            {/* Main Grid Workspace */}
            <main className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10 z-10 flex-1 pb-16">
              
              {/* Left Column: Closet Grid & Tagging Panel (8 cols) */}
              <section className="lg:col-span-8 flex flex-col gap-8">
                
                {/* AI INGESTION PANEL */}
                <div className="relative border border-slate-850 bg-slate-900/40 backdrop-blur-xl rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center shadow-xl shadow-black/40 overflow-hidden">
                  {/* Glowing Accent Border */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-indigo-500" />

                  <div className="flex flex-col gap-2 flex-1 text-center md:text-left">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 flex items-center gap-1.5 justify-center md:justify-start">
                      <Sparkles className="h-3 w-3 text-purple-400" /> Gemini Auto-Tagger
                    </span>
                    <h2 className="text-xl font-bold tracking-tight text-white">
                      Upload Garmet Photo
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                      Gemini 1.5 Flash will automatically extract fabric, colors, pattern, aesthetic, and comfortable temperature limits, then produce style vector embeddings for pgvector closet sorting.
                    </p>
                  </div>

                  <div className="w-full md:w-auto">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-purple-500/80 bg-slate-950/40 hover:bg-slate-950/80 transition-all rounded-xl p-6 cursor-pointer text-center group min-w-[220px]">
                      <Upload className="h-8 w-8 text-slate-400 group-hover:text-purple-400 transition-colors mb-2 group-hover:scale-110 transform" />
                      <span className="text-xs font-semibold text-slate-200">Drag & Drop Image</span>
                      <span className="text-[10px] text-slate-500 mt-1">JPEG, PNG or WEBP</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploadStatus !== ""}
                      />
                    </label>
                  </div>
                </div>

                {/* CLOSET GRID HEADERS AND FILTER BAR */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Filter className="h-4.5 w-4.5 text-purple-400" /> Digital Closet Inventory
                      </h3>
                      <p className="text-xs text-slate-400">
                        Showing {filteredItems.length} items cataloged.
                      </p>
                    </div>

                    {/* Categories Selector */}
                    <div className="flex flex-wrap gap-1.5 bg-slate-950 border border-slate-900/60 p-1.2 rounded-xl">
                      {["All", "Top", "Bottom", "Outerwear", "Footwear"].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`text-xs font-medium px-3.5 py-1.5 rounded-lg transition-all ${
                            activeCategory === cat
                              ? "bg-purple-600 text-white shadow-md shadow-purple-600/10"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Closet Cards Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredItems.map(item => {
                      const isSelected = selectedItems.includes(item.id);
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          whileHover={{ y: -4 }}
                          className={`group relative rounded-xl overflow-hidden border bg-slate-900/20 backdrop-blur-sm transition-all flex flex-col ${
                            isSelected 
                              ? "border-purple-500 ring-2 ring-purple-500/20" 
                              : "border-slate-800/80 hover:border-slate-700"
                          }`}
                        >
                          {/* Clothing Thumbnail */}
                          <div className="w-full aspect-[4/5] relative bg-slate-950 overflow-hidden">
                            <img
                              src={item.image_url}
                              alt={item.sub_category}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                            
                            {/* Delete Button overlay */}
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-md"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>

                            {/* category badge */}
                            <span className="absolute bottom-2 left-2 text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md bg-slate-950/70 border border-slate-800 text-purple-400 backdrop-blur-md">
                              {item.category}
                            </span>
                          </div>

                          {/* Meta Details */}
                          <div className="p-4 flex flex-col gap-1.5 flex-1 justify-between">
                            <div>
                              <h4 className="font-semibold text-xs text-white tracking-wide">
                                {item.sub_category}
                              </h4>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                <span className="text-[9px] text-slate-400 bg-slate-950 border border-slate-900 rounded px-1.5 py-0.5">
                                  {item.color_family}
                                </span>
                                <span className="text-[9px] text-slate-400 bg-slate-950 border border-slate-900 rounded px-1.5 py-0.5">
                                  {item.fabric}
                                </span>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-slate-800/40 mt-3 flex items-center justify-between">
                              <span className="text-[9px] text-slate-400">
                                {item.formality} • {item.min_temp}°F-{item.max_temp}°F
                              </span>
                              {isSelected && (
                                <span className="text-[8px] uppercase font-bold text-purple-400 flex items-center gap-0.5">
                                  <CheckCircle2 className="h-2.5 w-2.5" /> OOTD
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Right Column: AI OOTD Planner & Live Sandbox (4 cols) */}
              <aside className="lg:col-span-4 flex flex-col gap-8">
                
                {/* PLANNER PANEL */}
                <div className="border border-slate-850 bg-slate-900/20 backdrop-blur-xl rounded-2xl p-6 flex flex-col gap-6 shadow-xl shadow-black/30 relative overflow-hidden">
                  {/* Glowing Accent Border */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500" />
                  
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Gemini 3.1 Pro Stylist
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Contextual OOTD Planner
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Choose a weather/schedule preset to simulate how the model selects compatible clothing and explains its visual reasoning.
                    </p>
                  </div>

                  {/* Presets Select Menu */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                      Select Context Preset
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: "business-rain", label: "Showcase Pitch (Rainy, 50°F)", icon: Calendar },
                        { id: "casual-sunny", label: "Outdoor Brunch (Sunny, 72°F)", icon: Sun },
                        { id: "study-cold", label: "Evening Sync (Chilly, 38°F)", icon: Clock }
                      ].map(preset => {
                        const Icon = preset.icon;
                        return (
                          <button
                            key={preset.id}
                            onClick={() => setOotdScenario(preset.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                              ootdScenario === preset.id
                                ? "bg-purple-600/10 border-purple-500/80 text-white"
                                : "bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-200"
                            }`}
                          >
                            <Icon className={`h-4.5 w-4.5 ${ootdScenario === preset.id ? "text-purple-400" : "text-slate-500"}`} />
                            <span className="text-xs font-semibold">{preset.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* OOTD Results Card */}
                  <div className="border border-slate-800 bg-slate-950/60 rounded-xl p-5 flex flex-col gap-4 relative">
                    {isGeneratingOOTD ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-3">
                        <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
                        <span className="text-[11px] text-slate-400 font-medium">Gemini 3.1 Pro curation in progress...</span>
                      </div>
                    ) : ootdResult ? (
                      <>
                        <div className="flex flex-col gap-1 border-b border-slate-800/60 pb-3">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            Curated Outfit
                          </span>
                          <h4 className="font-bold text-xs text-white">
                            {ootdResult.scenario}
                          </h4>
                          <p className="text-[10px] text-purple-400 font-semibold mt-1">
                            ⛅ Weather: {ootdResult.weather}
                          </p>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/30 p-3 rounded-lg border border-slate-900">
                          "{ootdResult.reasoning}"
                        </p>

                        {/* Feedback Action Buttons */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-800/40 mt-1">
                          <span className="text-[10px] text-slate-500 font-medium">
                            Does this match your style?
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => setLikedOOTD(true)}
                              className={`p-2 rounded-lg border transition-all ${
                                likedOOTD === true
                                  ? "bg-purple-600 border-purple-500 text-white"
                                  : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-purple-400"
                              }`}
                            >
                              <Heart className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setLikedOOTD(false)}
                              className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg border transition-all ${
                                likedOOTD === false
                                  ? "bg-red-950/30 border-red-900/80 text-red-400"
                                  : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-red-400"
                              }`}
                            >
                              Dislike
                            </button>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>

                  {/* Email Dispatch button */}
                  <button
                    onClick={() => alert(`Daily Styling Newsletter successfully compiled using React Email and sent via Resend API to ${userProfile.email}!`)}
                    className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white transition-all shadow-lg shadow-purple-500/10 cursor-pointer"
                  >
                    <Mail className="h-4 w-4" />
                    Dispatch Morning Newsletter
                  </button>
                </div>

                {/* VIRTUAL TRY-ON & RECOMMENDATION BOARD */}
                <div id="tryon" className="border border-slate-850 bg-slate-900/20 backdrop-blur-xl rounded-2xl p-6 flex flex-col gap-6 shadow-xl shadow-black/30 relative">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                      Google Imagen 3 API
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Virtual Try-On Room
                    </h3>
                    <p className="text-xs text-slate-400">
                      Monitor favorite store catalogs within budget. Select recommended buyable items and virtually try them on.
                    </p>
                  </div>

                  {/* Budget Store Catalog items */}
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                      Recommended for you (Max Budget: ${userProfile.budgetLimit})
                    </span>
                    
                    <div className="flex flex-col gap-2.5">
                      {(userProfile.gender === "female" ? FEMALE_SHOP_RECOMMENDATIONS : MALE_SHOP_RECOMMENDATIONS).map(shopItem => (
                        <div key={shopItem.id} className="flex gap-4 p-3 rounded-xl bg-slate-950 border border-slate-900/80 hover:border-slate-800 transition-all items-center">
                          <img src={shopItem.image} alt={shopItem.title} className="w-12 h-16 object-cover rounded-lg bg-slate-900" />
                          
                          <div className="flex-1 flex flex-col gap-0.5">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{shopItem.store}</span>
                            <h5 className="font-semibold text-xs text-white">{shopItem.title}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-emerald-400 font-bold">{shopItem.price}</span>
                              <span className="text-[10px] text-slate-500 line-through">{shopItem.originalPrice}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-[9px] font-bold text-purple-400 bg-purple-950/20 px-2 py-0.5 rounded border border-purple-900/30">
                              {shopItem.score} Fit
                            </span>
                            <button
                              onClick={() => alert(`Imagen Inpainting call triggered for ${shopItem.title}: Masking your avatar and generating high-fidelity virtual try-on preview!`)}
                              className="text-[9px] font-bold text-slate-300 hover:text-white px-2 py-1 bg-purple-600 hover:bg-purple-500 rounded-md transition-all shadow cursor-pointer"
                            >
                              Try On
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Uploading Status Toast */}
      <AnimatePresence>
        {uploadStatus !== "" && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 left-8 right-8 md:left-auto md:w-[360px] border border-purple-800 bg-slate-950 shadow-2xl shadow-purple-500/10 rounded-2xl p-5 z-50 flex items-center gap-4 backdrop-blur-md"
          >
            {uploadStatus === "complete" ? (
              <div className="h-9 w-9 rounded-full bg-emerald-950 border border-emerald-900 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            ) : (
              <div className="h-9 w-9 rounded-full bg-purple-950 border border-purple-900 flex items-center justify-center text-purple-400">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}

            <div className="flex-1">
              <h4 className="font-bold text-xs text-white">
                {uploadStatus === "uploading" && "1. Uploading Asset..."}
                {uploadStatus === "tagging" && "2. Analysing via Gemini Flash..."}
                {uploadStatus === "embeddings" && "3. Generating Style Vectors..."}
                {uploadStatus === "complete" && "Garment Successfully Cataloged!"}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {uploadStatus === "uploading" && "Uploading binary image stream to Supabase Storage..."}
                {uploadStatus === "tagging" && "Extracting fabric, pattern, color, and formality attributes..."}
                {uploadStatus === "embeddings" && "Running text-embedding-004 for vector database similarity..."}
                {uploadStatus === "complete" && "Analyzed and saved! Refreshing closet items list..."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple Clock Icon replacement
function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
