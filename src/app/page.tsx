"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, Cloud, Sparkles, Filter, CheckCircle2, Loader2, 
  Trash2, Sun, Calendar, Mail, Heart, RefreshCw, ShoppingBag,
  ArrowRight, Sparkle, LogIn, Compass, ShieldCheck, MapPin, DollarSign,
  User, Check, Camera, Image as ImageIcon, Eye
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
    color_family: "Ivory White",
    pattern: "Solid",
    fabric: "Silk",
    formality: "Formal",
    image_url: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500&auto=format&fit=crop&q=60",
    min_temp: 55,
    max_temp: 80,
    precipitation_resistant: false,
    aesthetic: "Classic Minimalist"
  },
  {
    id: "f7",
    category: "Bottom",
    sub_category: "High-Waisted Jeans",
    color_family: "Classic Blue",
    pattern: "Solid",
    fabric: "Cotton Denim",
    formality: "Casual",
    image_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=60",
    min_temp: 50,
    max_temp: 80,
    precipitation_resistant: false,
    aesthetic: "Minimalist"
  },
  {
    id: "f8",
    category: "Outerwear",
    sub_category: "Tailored Blazer",
    color_family: "Tan Camel",
    pattern: "Solid",
    fabric: "Wool Blend",
    formality: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1548624149-f9b1859aa700?w=500&auto=format&fit=crop&q=60",
    min_temp: 40,
    max_temp: 65,
    precipitation_resistant: false,
    aesthetic: "Preppy Chic"
  },
  {
    id: "f9",
    category: "Top",
    sub_category: "Ribbed Knit Sweater",
    color_family: "Charcoal Gray",
    pattern: "Textured",
    fabric: "Cotton Knit",
    formality: "Casual",
    image_url: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?w=500&auto=format&fit=crop&q=60",
    min_temp: 45,
    max_temp: 70,
    precipitation_resistant: false,
    aesthetic: "Academia"
  },
  {
    id: "f10",
    category: "Footwear",
    sub_category: "Pointed Toe Flats",
    color_family: "Nude Beige",
    pattern: "Solid",
    fabric: "Soft Leather",
    formality: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop&q=60",
    min_temp: 55,
    max_temp: 85,
    precipitation_resistant: false,
    aesthetic: "Classic Minimalist"
  },
  {
    id: "f11",
    category: "One-piece",
    sub_category: "Linen Midi Dress",
    color_family: "Oatmeal Beige",
    pattern: "Solid",
    fabric: "100% Linen",
    formality: "Casual",
    image_url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=60",
    min_temp: 60,
    max_temp: 85,
    precipitation_resistant: false,
    aesthetic: "Old Money Coastal"
  },
  {
    id: "f12",
    category: "Top",
    sub_category: "Crewneck T-Shirt",
    color_family: "Classic White",
    pattern: "Solid",
    fabric: "Organic Cotton",
    formality: "Casual",
    image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60",
    min_temp: 65,
    max_temp: 90,
    precipitation_resistant: false,
    aesthetic: "Minimalist"
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
    sub_category: "Tailored Blazer",
    color_family: "Forest Green",
    pattern: "Solid",
    fabric: "Wool Tweed",
    formality: "Formal",
    image_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&auto=format&fit=crop&q=60",
    min_temp: 40,
    max_temp: 65,
    precipitation_resistant: false,
    aesthetic: "English Countryside"
  },
  {
    id: "m7",
    category: "Bottom",
    sub_category: "Slim-Fit Jeans",
    color_family: "Dark Indigo",
    pattern: "Solid",
    fabric: "Cotton Denim",
    formality: "Casual",
    image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=60",
    min_temp: 45,
    max_temp: 75,
    precipitation_resistant: false,
    aesthetic: "Classic Casual"
  },
  {
    id: "m8",
    category: "Top",
    sub_category: "Oxford Shirt",
    color_family: "Light Blue",
    pattern: "Solid",
    fabric: "Cotton Oxford",
    formality: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&auto=format&fit=crop&q=60",
    min_temp: 55,
    max_temp: 80,
    precipitation_resistant: false,
    aesthetic: "Preppy"
  },
  {
    id: "m9",
    category: "Outerwear",
    sub_category: "Denim Jacket",
    color_family: "Classic Indigo",
    pattern: "Solid",
    fabric: "Heavy Cotton Denim",
    formality: "Casual",
    image_url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=60",
    min_temp: 50,
    max_temp: 70,
    precipitation_resistant: false,
    aesthetic: "Streetwear"
  },
  {
    id: "m10",
    category: "Footwear",
    sub_category: "Leather Sneakers",
    color_family: "Minimalist White",
    pattern: "Solid",
    fabric: "Full-Grain Leather",
    formality: "Casual",
    image_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60",
    min_temp: 45,
    max_temp: 85,
    precipitation_resistant: false,
    aesthetic: "Minimalist"
  },
  {
    id: "m11",
    category: "Top",
    sub_category: "Crewneck Tee",
    color_family: "Heather Gray",
    pattern: "Solid",
    fabric: "Supima Cotton",
    formality: "Casual",
    image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60",
    min_temp: 65,
    max_temp: 90,
    precipitation_resistant: false,
    aesthetic: "Minimalist"
  },
  {
    id: "m12",
    category: "Outerwear",
    sub_category: "Bomber Jacket",
    color_family: "Charcoal Black",
    pattern: "Solid",
    fabric: "Nappa Leather",
    formality: "Casual",
    image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60",
    min_temp: 35,
    max_temp: 60,
    precipitation_resistant: false,
    aesthetic: "Classic Casual"
  }
];

// FEMININE SHOP RECOMMENDATIONS
const FEMALE_SHOP_RECOMMENDATIONS = [
  {
    id: "prod_1",
    store: "Everlane",
    title: "Classic Linen Blazer",
    price: "$88.00",
    originalPrice: "$118.00",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&auto=format&fit=crop&q=60",
    score: "96%"
  },
  {
    id: "prod_6",
    store: "Ralph Lauren",
    title: "Premium Cotton Oxford Shirt",
    price: "$65.00",
    originalPrice: "$89.90",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&auto=format&fit=crop&q=60",
    score: "92%"
  }
];

// MASCULINE SHOP RECOMMENDATIONS
const MALE_SHOP_RECOMMENDATIONS = [
  {
    id: "prod_1",
    store: "Zara",
    title: "Textured Linen Trousers",
    price: "$49.90",
    originalPrice: "$69.90",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=200&auto=format&fit=crop&q=60",
    score: "94%"
  },
  {
    id: "prod_5",
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
    gender: "female", 
    locationCity: "New York",
    budgetLimit: 100,
    preferredAesthetics: [] as string[]
  });

  const [items, setItems] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [uploadStatus, setUploadStatus] = useState<string>(""); 
  const [taggingResult, setTaggingResult] = useState<any>(null);
  
  // Interactive Daily OOTD Planner States
  const [ootdScenario, setOotdScenario] = useState<string>("business-rain");
  const [ootdResult, setOotdResult] = useState<any>(null);
  const [isGeneratingOOTD, setIsGeneratingOOTD] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [likedOOTD, setLikedOOTD] = useState<boolean | null>(null);

  // Virtual Try-On Modal States
  const [isTryOnModalOpen, setIsTryOnModalOpen] = useState<boolean>(false);
  const [selectedTryOnItem, setSelectedTryOnItem] = useState<any>(null);
  const [tryOnStep, setTryOnStep] = useState<"choose" | "loading" | "result">("choose");
  const [tryOnPhoto, setTryOnPhoto] = useState<string | null>(null);
  const [tryOnResultPhoto, setTryOnResultPhoto] = useState<string | null>(null);
  const [isSimulatingCamera, setIsSimulatingCamera] = useState<boolean>(false);

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
      alert(err.message || "An error occurred during image analysis.");
    }
  };

  // OOTD compilation
  const compileOOTDSelection = () => {
    setIsGeneratingOOTD(true);
    setLikedOOTD(null);

    setTimeout(() => {
      let result = null;
      if (userProfile.gender === "female") {
        if (ootdScenario === "business-rain") {
          result = {
            scenario: "Executive Client Briefing",
            weather: `50°F • Rain (85% risk) in ${userProfile.locationCity}`,
            schedule: "09:30 AM - Executive Client Briefing",
            items: ["f6", "f4", "f1"], 
            reasoning: `To support your presence at your Executive Briefing in wet 50°F weather, we selected your rich Emerald Green Satin Blouse paired with the Pleated Skirt. Over that, the beige Gabardine Trench Coat provides elegant wind and rain protection, ensuring you arrive warm, dry, and highly polished.`
          };
        } else if (ootdScenario === "casual-sunny") {
          result = {
            scenario: "Outdoor Team Brunch Social",
            weather: `72°F • Sunny in ${userProfile.locationCity}`,
            schedule: "11:30 AM - Outdoor Team Brunch Social",
            items: ["f3", "f5"], 
            reasoning: `For a warm, sun-kissed 72°F afternoon meeting, we styled your Soft Pink Floral Sun Dress. Its lightweight, comfortable silk-blend fabric offers superb breathability, while the Tan Suede Chelsea Boots keep the look highly curated and transition-ready.`
          };
        } else {
          result = {
            scenario: "Evening Technical Review & Write-up",
            weather: `38°F • Chilly Dusk in ${userProfile.locationCity}`,
            schedule: "6:00 PM - Research Sync at Coffee Lounge",
            items: ["f2", "f4", "f5"], 
            reasoning: `To keep you warm for your chilly 38°F evening session, we matched the heavy Cream Knit Cardigan with your Crepe Midi Skirt. Complete the combination with your Tan Chelsea boots to maintain a smart, classic aesthetic while feeling thoroughly insulated.`
          };
        }
      } else {
        if (ootdScenario === "business-rain") {
          result = {
            scenario: "Venture Showcase Pitch",
            weather: `50°F • Rain (85% risk) in ${userProfile.locationCity}`,
            schedule: "10:00 AM - Venture Showcase Pitch",
            items: ["m6", "m3", "m1"], 
            reasoning: `To represent absolute confidence in damp 50°F weather for your Showcase Pitch, we styled your structured Forest Green Tweed Blazer over Navy Cotton Chinos. Layering with your beige Gabardine Trench Coat provides robust weather protection to ensure a clean, dry arrival.`
          };
        } else if (ootdScenario === "casual-sunny") {
          result = {
            scenario: "Outdoor Team Brunch Celebration",
            weather: `72°F • Sunny in ${userProfile.locationCity}`,
            schedule: "11:30 AM - Open-Air Team Lunch",
            items: ["m5", "m3"], 
            reasoning: `Under clear blue skies and a high of 72°F for your lunch event, we combined your breathable White Linen Shirt with Navy Chinos. It creates a classic, effortlessly tailored summer silhouette that is breathable and sophisticated.`
          };
        } else {
          result = {
            scenario: "Evening Research & Write-up",
            weather: `38°F • Cold Breeze in ${userProfile.locationCity}`,
            schedule: "5:00 PM - Late Technical Writing Sync",
            items: ["m2", "m3", "m4"], 
            reasoning: `For your 38°F evening sync, the Merino Wool Charcoal Sweater provides dense heat insulation. Combining it with Navy Cotton Chinos and Leather Chelsea Boots guarantees you stay thoroughly warm, comfortable, and focused on the work.`
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
      compileOOTDSelection();
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
      
      await supabase
        .from("profiles")
        .upsert({
          id: "00000000-0000-0000-0000-000000000000",
          full_name: userProfile.fullName || "Style Partner",
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
      fullName: "Vagisha Tyagi",
      email: "vagisha.tyagi001@gmail.com",
      gender: "female",
      locationCity: "New York",
      budgetLimit: 120,
      preferredAesthetics: ["Classic Minimalist", "Academia"]
    });
    setIsAuthenticated(true);
  };

  // Virtual Try-On flow simulation
  const handleTryOnTrigger = (item: any) => {
    setSelectedTryOnItem(item);
    setTryOnPhoto(null);
    setTryOnStep("choose");
    setIsTryOnModalOpen(true);
  };

  const startCameraSimulation = () => {
    setIsSimulatingCamera(true);
    setTimeout(() => {
      // Set premium mock user selfie
      setTryOnPhoto("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80");
      setIsSimulatingCamera(false);
    }, 1500);
  };

  const executeTryOnGeneration = async () => {
    setTryOnStep("loading");
    try {
      const itemImg = selectedTryOnItem?.image_url || selectedTryOnItem?.image;
      const response = await fetch("/api/tryon/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseImage: tryOnPhoto,
          shopImage: itemImg,
          productId: selectedTryOnItem?.id
        })
      });
      const data = await response.json();
      if (data.success) {
        setTryOnResultPhoto(data.tryOnResultUrl);
      } else {
        setTryOnResultPhoto(itemImg);
      }
    } catch (err) {
      console.error("VTO failed:", err);
      setTryOnResultPhoto(selectedTryOnItem?.image_url || selectedTryOnItem?.image);
    }
    setTryOnStep("result");
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
              <Sparkle className="h-3.5 w-3.5 text-purple-400" />
              Mindful Outfit Planning
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
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900 transition-all font-bold text-sm text-slate-300 hover:text-white cursor-pointer"
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
                  <h4 className="text-xs font-bold text-slate-200">Mindful Coordination</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">Evaluates weather patterns and calendar meetings instantly.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400 shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Wardrobe Cataloging</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">Extracts colors, fabric textures, and suitability constraints.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400 shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Personalized Styling</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">Learns your preferences based on likes and styling history.</p>
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
                    <p className="text-xs text-slate-400">Choose your style direction to populate and recommend. This ensures highly relevant selections.</p>
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
                      <span className="text-xs font-bold">Feminine Pieces</span>
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
                      <span className="text-xs font-bold">Masculine Pieces</span>
                      <span className="text-[10px] text-slate-500 mt-1">Trousers, blazers, knitwear & boots</span>
                    </button>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setOnboardingStep(1)}
                      className="flex-1 py-3 rounded-xl border border-slate-800 hover:bg-slate-900 text-xs font-bold text-slate-400 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setOnboardingStep(3)}
                      className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-bold text-xs cursor-pointer"
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
                    <h2 className="text-2xl font-bold text-white tracking-tight">Weather & Budget Parameters</h2>
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
                      className="flex-1 py-3 rounded-xl border border-slate-800 hover:bg-slate-900 text-xs font-bold text-slate-400 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setOnboardingStep(4)}
                      className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-bold text-xs cursor-pointer"
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
                    <p className="text-xs text-slate-400">Select at least two style aesthetics to guide style recommendations. You can change these anytime.</p>
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
                      className="flex-1 py-3 rounded-xl border border-slate-800 hover:bg-slate-900 text-xs font-bold text-slate-400 cursor-pointer"
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

        {/* 3. DYNAMIC DIGITAL CLOSET DASHBOARD (SIGNED IN) */}
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
                    Closet Companion
                  </h1>
                  <p className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">
                    Mindful Style Companion
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
                  className="text-xs font-semibold px-4 py-2 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900 transition-all text-slate-400 hover:text-white cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            </header>

            {/* REAL CALENDAR SYNC ALERT */}
            <div className="w-full max-w-7xl mx-auto px-6 mt-6 z-10">
              <div className="border border-amber-900/40 bg-amber-950/15 backdrop-blur-xl rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex gap-3.5 items-start">
                    <div className="h-10 w-10 rounded-xl bg-amber-950/50 border border-amber-800/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-200 flex items-center gap-1.5">
                        Upcoming Google Calendar Event
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">Synced</span>
                      </h4>
                      <p className="text-xs text-slate-300 mt-1">
                        We found a meeting scheduled for today: <span className="text-white font-semibold">"
                          {userProfile.email === "devstar7440@gcplab.me" 
                            ? "Team Styling Sync" 
                            : (userProfile.gender === "female" ? "Executive Client Briefing" : "Venture Showcase Pitch")}
                        "</span> ({userProfile.email === "devstar7440@gcplab.me" ? "04:45 PM PST" : "09:30 AM"}).
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setOotdScenario("business-rain")}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/15 transition-all self-start md:self-auto cursor-pointer"
                  >
                    Suggest Outfit for Event
                  </button>
                </div>

                {/* Suggested Outfit Preview */}
                <div className="border-t border-amber-900/30 pt-4 mt-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Suggested Outfit for this Event:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-3">
                    {items.filter(it => (userProfile.gender === "female" ? ["f6", "f4", "f1"] : ["m6", "m3", "m1"]).includes(it.id)).map(it => (
                      <div key={it.id} className="flex items-center gap-2 bg-slate-950/60 border border-slate-900 rounded-lg p-2">
                        <img src={it.image_url} alt={it.sub_category} className="w-8 h-10 object-cover rounded-md bg-slate-900 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-semibold text-white truncate max-w-[80px]">{it.sub_category}</span>
                          <span className="text-[8px] text-slate-500">{it.color_family}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Grid Workspace */}
            <main className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 z-10 flex-1 pb-16">
              
              {/* Left Column: Closet Grid & Upload Panel (8 cols) */}
              <section className="lg:col-span-8 flex flex-col gap-8">
                
                {/* INGESTION PANEL */}
                <div className="relative border border-slate-850 bg-slate-900/40 backdrop-blur-xl rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center shadow-xl shadow-black/40 overflow-hidden">
                  {/* Glowing Accent Border */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-indigo-500" />

                  <div className="flex flex-col gap-2 flex-1 text-center md:text-left">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 flex items-center gap-1.5 justify-center md:justify-start">
                      <Sparkles className="h-3 w-3 text-purple-400" /> Wardrobe Organizer
                    </span>
                    <h2 className="text-xl font-bold tracking-tight text-white">
                      Add Current Closet Outfit Pictures
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                      Upload photos of your current wardrobe outfits. The wardrobe organizer will catalog fabric textures, color schemes, patterns, and temperature limits to keep your selections structured.
                    </p>
                  </div>

                  <div className="w-full md:w-auto">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-purple-500/80 bg-slate-950/40 hover:bg-slate-950/80 transition-all rounded-xl p-6 cursor-pointer text-center group min-w-[220px]">
                      <Upload className="h-8 w-8 text-slate-400 group-hover:text-purple-400 transition-colors mb-2 group-hover:scale-110 transform" />
                      <span className="text-xs font-semibold text-slate-200">Upload Closet Outfit Photo</span>
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
                        <Filter className="h-4.5 w-4.5 text-purple-400" /> Your Wardrobe Closet
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
                                  <CheckCircle2 className="h-2.5 w-2.5" /> Curated
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

              {/* Right Column: OOTD Planner & Try-On Board (4 cols) */}
              <aside className="lg:col-span-4 flex flex-col gap-8">
                
                {/* PLANNER PANEL */}
                <div className="border border-slate-850 bg-slate-900/20 backdrop-blur-xl rounded-2xl p-6 flex flex-col gap-6 shadow-xl shadow-black/30 relative overflow-hidden">
                  {/* Glowing Accent Border */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500" />
                  
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Personal Stylist
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Your Daily Style Planner
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Choose a schedule preset to see how the outfit planner structures your look based on weather and active meetings.
                    </p>
                  </div>

                  {/* Presets Select Menu */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                      Select Event Preset
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: "business-rain", label: "Executive Briefing (Rainy, 50°F)", icon: Calendar },
                        { id: "casual-sunny", label: "Outdoor Team Brunch (Sunny, 72°F)", icon: Sun },
                        { id: "study-cold", label: "Research Sync (Chilly, 38°F)", icon: Clock }
                      ].map(preset => {
                        const Icon = preset.icon;
                        return (
                          <button
                            key={preset.id}
                            onClick={() => setOotdScenario(preset.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
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
                        <span className="text-[11px] text-slate-400 font-medium">Curating your customized recommendations...</span>
                      </div>
                    ) : ootdResult ? (
                      <>
                        <div className="flex flex-col gap-1 border-b border-slate-800/60 pb-3">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            Your Curated Outfit Selection
                          </span>
                          <h4 className="font-bold text-xs text-white">
                            {ootdResult.scenario}
                          </h4>
                          <p className="text-[10px] text-purple-400 font-semibold mt-1">
                            ⛅ Weather: {ootdResult.weather}
                          </p>
                        </div>

                        {/* EXCLUSIVELY SHOWS THE BEAUTIFUL Styling reasoning (HIDING PROMPT AND TECHNICAL INPUTS) */}
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
                              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                                likedOOTD === true
                                  ? "bg-purple-600 border-purple-500 text-white"
                                  : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-purple-400"
                              }`}
                            >
                              <Heart className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setLikedOOTD(false)}
                              className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
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
                    onClick={() => alert(`✨ Your curated style digest is on its way! Check your inbox at ${userProfile.email} for your daily styling inspiration.`)}
                    className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white transition-all shadow-lg shadow-purple-500/10 cursor-pointer"
                  >
                    <Mail className="h-4 w-4" />
                    Send Style Digest Email
                  </button>
                </div>

                {/* TRY-ON & RECOMMENDATION BOARD */}
                <div id="tryon" className="border border-slate-850 bg-slate-900/20 backdrop-blur-xl rounded-2xl p-6 flex flex-col gap-6 shadow-xl shadow-black/30 relative">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                      Fitting Room
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Virtual Try-On Room
                    </h3>
                    <p className="text-xs text-slate-400">
                      Monitor catalog items under your budget. Select recommended buyable items and virtually try them on.
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
                              {shopItem.score} Match
                            </span>
                            <button
                              onClick={() => handleTryOnTrigger(shopItem)}
                              className="text-[9px] font-bold text-slate-300 hover:text-white px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-md transition-all shadow cursor-pointer flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
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

      {/* 4. DYNAMIC INTERACTIVE VIRTUAL TRY-ON MODAL */}
      <AnimatePresence>
        {isTryOnModalOpen && selectedTryOnItem && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg border border-slate-800 bg-slate-900 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsTryOnModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 rounded bg-slate-950 border border-slate-800 cursor-pointer"
              >
                ✕ Close
              </button>

              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-purple-400 animate-pulse" />
                  <h3 className="text-base font-bold text-white">Virtual Fitting Room</h3>
                </div>
                
                <p className="text-xs text-slate-400">
                  Try on <span className="text-white font-bold">{selectedTryOnItem.title}</span> virtually to see how it aligns with your style.
                </p>

                {/* Step 1: Upload or Capture Photo */}
                {tryOnStep === "choose" && (
                  <div className="flex flex-col gap-5 mt-2">
                    <div className="flex flex-col items-center justify-center border border-dashed border-slate-850 bg-slate-950/40 rounded-xl p-8 text-center">
                      {tryOnPhoto ? (
                        <div className="relative w-32 h-40 rounded-lg overflow-hidden border border-slate-800">
                          <img src={tryOnPhoto} className="w-full h-full object-cover" alt="Profile setup" />
                          <button 
                            onClick={() => {
                              setTryOnPhoto(null);
                              setTryOnResultPhoto(null);
                            }}
                            className="absolute bottom-1 right-1 bg-red-600 text-white text-[9px] font-bold p-1 rounded cursor-pointer"
                          >
                            Reset
                          </button>
                        </div>
                      ) : isSimulatingCamera ? (
                        <div className="flex flex-col items-center gap-3 py-6">
                          <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
                          <span className="text-[11px] text-slate-400">Syncing and aligning camera...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Camera className="h-8 w-8 text-slate-500" />
                          <span className="text-xs font-bold text-slate-300">Set Your Photo</span>
                          <p className="text-[10px] text-slate-500 max-w-[200px] mt-0.5">Capture a quick picture or upload an existing photo of yourself.</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setIsSimulatingCamera(true);
                          setTimeout(() => {
                            // Set premium mock user selfie based on selected gender
                            if (userProfile.gender === "female") {
                              setTryOnPhoto("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80");
                            } else {
                              setTryOnPhoto("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80");
                            }
                            setIsSimulatingCamera(false);
                          }, 1500);
                        }}
                        disabled={isSimulatingCamera || !!tryOnPhoto}
                        className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-800 bg-slate-950/40 hover:bg-slate-950 text-xs font-bold text-slate-300 rounded-xl disabled:opacity-50 cursor-pointer"
                      >
                        <Camera className="h-4 w-4 text-purple-400" />
                        Allow Camera
                      </button>
                      
                      <label className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-800 bg-slate-950/40 hover:bg-slate-950 text-xs font-bold text-slate-300 rounded-xl cursor-pointer">
                        <ImageIcon className="h-4 w-4 text-purple-400" />
                        Upload Picture
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const localUrl = URL.createObjectURL(file);
                              setTryOnPhoto(localUrl);
                            }
                          }}
                        />
                      </label>
                    </div>

                    <button
                      onClick={executeTryOnGeneration}
                      disabled={!tryOnPhoto}
                      className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-bold text-xs rounded-xl disabled:opacity-40 cursor-pointer shadow-lg shadow-purple-600/15"
                    >
                      Generate Style Preview
                    </button>
                  </div>
                )}

                {/* Step 2: Generation Loading State */}
                {tryOnStep === "loading" && (
                  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center mt-2">
                    <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Refining style alignment...</h4>
                      <p className="text-[10px] text-slate-500 mt-1 max-w-[240px]">Blending the outfit with your pose, lighting, and shadow profile...</p>
                    </div>
                  </div>
                )}

                {/* Step 3: Beautiful Fitting Result Preview */}
                {tryOnStep === "result" && (
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="grid grid-cols-2 gap-4 items-center">
                      <div className="flex flex-col gap-1 text-center">
                        <span className="text-[9px] uppercase font-bold text-slate-500">Your Base Photo</span>
                        <div className="aspect-[3/4] rounded-lg overflow-hidden border border-slate-800 relative bg-slate-950">
                          <img src={tryOnPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"} className="w-full h-full object-cover" alt="User Base" />
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1 text-center">
                        <span className="text-[9px] uppercase font-bold text-purple-400">Virtual Fit Preview</span>
                        <div className="aspect-[3/4] rounded-lg overflow-hidden border border-purple-500/50 relative bg-slate-950 shadow-lg shadow-purple-500/10">
                          <img src={tryOnResultPhoto || tryOnPhoto || ""} className="w-full h-full object-cover" alt="Fitting result" />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-purple-600 text-white text-[8px] font-bold uppercase tracking-wider">Applied</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 text-center mt-2">
                      <span className="text-xs font-bold text-slate-200 block">Style Digest Recommendation</span>
                      <p className="text-[11px] text-slate-400 mt-1">This outfit flatters your proportions beautifully and matches your active climate perfectly!</p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setTryOnStep("choose");
                          setTryOnResultPhoto(null);
                        }}
                        className="flex-1 py-3 border border-slate-800 hover:bg-slate-950 text-xs font-bold text-slate-400 rounded-xl cursor-pointer"
                      >
                        Try Another Photo
                      </button>
                      <button
                        onClick={() => setIsTryOnModalOpen(false)}
                        className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Keep Style Selection
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
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
                {uploadStatus === "uploading" && "1. Uploading Closet Outfit..."}
                {uploadStatus === "tagging" && "2. Analyzing details..."}
                {uploadStatus === "complete" && "Outfit Successfully Cataloged!"}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {uploadStatus === "uploading" && "Uploading picture to your digital wardrobe catalog..."}
                {uploadStatus === "tagging" && "Extracting fabrics, colors, textures, and suitability filters..."}
                {uploadStatus === "complete" && "Analyzed and saved! Refreshing closet list..."}
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
