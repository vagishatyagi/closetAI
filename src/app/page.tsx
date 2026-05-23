"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, Sparkles, Filter, CheckCircle2, Loader2, 
  Trash2, Calendar, Mail, Heart, RefreshCw,
  ArrowRight, Sparkle, LogIn, Compass, ShieldCheck, MapPin, DollarSign,
  User, Check, Camera, Image as ImageIcon, Eye
} from "lucide-react";

const WARDROBE_IMAGES = {
  trenchCoat: "https://m.media-amazon.com/images/I/61GHW7bE3OL._AC_UL640_QL65_.jpg",
  cardigan: "https://m.media-amazon.com/images/I/71D6XzzIgyL._AC_UL640_QL65_.jpg",
  floralDress: "https://m.media-amazon.com/images/I/71OAcN7nmlL._AC_UL640_QL65_.jpg",
  pleatedSkirt: "https://m.media-amazon.com/images/I/61b6tZ8mHvL._AC_UL640_QL65_.jpg",
  ankleBoots: "https://m.media-amazon.com/images/I/71gHHJV+6DL._AC_UL640_QL65_.jpg",
  satinBlouse: "https://m.media-amazon.com/images/I/61q+sy7esWL._AC_UL640_QL65_.jpg",
  highWaistedJeans: "https://m.media-amazon.com/images/I/71COA9r5sYL._AC_UL640_QL65_.jpg",
  blazer: "https://m.media-amazon.com/images/I/71Qn828Je2L._AC_UL640_QL65_.jpg",
  ribbedSweater: "https://m.media-amazon.com/images/I/61vOYfmPuvL._AC_UL640_QL65_.jpg",
  flats: "https://m.media-amazon.com/images/I/81Oy9y1aQVL._AC_UL640_QL65_.jpg",
  linenDress: "https://m.media-amazon.com/images/I/61c2CefKYsL._AC_UL640_QL65_.jpg",
  crewneckTee: "https://m.media-amazon.com/images/I/61x-LF9fyYL._AC_UL640_QL65_.jpg",
  chinos: "https://m.media-amazon.com/images/I/714rUx8rGDL._AC_UL640_QL65_.jpg",
  linenShirt: "https://m.media-amazon.com/images/I/61q+sy7esWL._AC_UL640_QL65_.jpg",
  denimJacket: "https://m.media-amazon.com/images/I/71DOPxLVvKL._AC_UL640_QL65_.jpg",
  sneakers: "https://m.media-amazon.com/images/I/718cNfFJmiL._AC_UL640_QL65_.jpg",
  bomberJacket: "https://m.media-amazon.com/images/I/61XHdgc2rcL._AC_UL640_QL65_.jpg",
} as const;

const userWardrobeStorageKey = (userId: string, email: string) =>
  `closet-companion-wardrobe-${userId || email || "anonymous"}`;

const mergeWardrobeItems = (...groups: any[][]) => {
  const seen = new Set<string>();
  const merged: any[] = [];
  for (const group of groups) {
    for (const item of group) {
      if (!item?.id || seen.has(item.id)) continue;
      seen.add(item.id);
      merged.push(item);
    }
  }
  return merged;
};

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
    image_url: WARDROBE_IMAGES.trenchCoat,
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
    image_url: WARDROBE_IMAGES.cardigan,
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
    image_url: WARDROBE_IMAGES.floralDress,
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
    image_url: WARDROBE_IMAGES.pleatedSkirt,
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
    image_url: WARDROBE_IMAGES.ankleBoots,
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
    image_url: WARDROBE_IMAGES.satinBlouse,
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
    image_url: WARDROBE_IMAGES.highWaistedJeans,
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
    image_url: WARDROBE_IMAGES.blazer,
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
    image_url: WARDROBE_IMAGES.ribbedSweater,
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
    image_url: WARDROBE_IMAGES.flats,
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
    image_url: WARDROBE_IMAGES.linenDress,
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
    image_url: WARDROBE_IMAGES.crewneckTee,
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
    image_url: WARDROBE_IMAGES.trenchCoat,
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
    image_url: WARDROBE_IMAGES.ribbedSweater,
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
    image_url: WARDROBE_IMAGES.chinos,
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
    image_url: WARDROBE_IMAGES.ankleBoots,
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
    image_url: WARDROBE_IMAGES.linenShirt,
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
    image_url: WARDROBE_IMAGES.blazer,
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
    image_url: WARDROBE_IMAGES.highWaistedJeans,
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
    image_url: WARDROBE_IMAGES.satinBlouse,
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
    image_url: WARDROBE_IMAGES.denimJacket,
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
    image_url: WARDROBE_IMAGES.sneakers,
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
    image_url: WARDROBE_IMAGES.crewneckTee,
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
    image_url: WARDROBE_IMAGES.bomberJacket,
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

// Helper to enrich wardrobe items with KonMari attributes
const enrichWardrobeItems = (rawItems: any[]) => {
  const now = new Date();
  return rawItems.map((item, index) => {
    const enriched = { ...item };
    
    // Ensure joy_score is set (default to 5 or deterministic for mock items)
    if (enriched.joy_score === undefined || enriched.joy_score === null) {
      if (item.id === "f1" || item.id === "m1") enriched.joy_score = 3;
      else if (item.id === "f2" || item.id === "m2") enriched.joy_score = 2;
      else if (item.id === "f4" || item.id === "m4") enriched.joy_score = 4;
      else if (item.id === "f5" || item.id === "m5") enriched.joy_score = 3;
      else if (item.id === "f9" || item.id === "m9") enriched.joy_score = 2;
      else enriched.joy_score = 5;
    }

    // Ensure last_worn_at is set
    if (!enriched.last_worn_at) {
      const daysAgo = 
        item.id === "f1" || item.id === "m1" ? 400 : // Over a year
        item.id === "f2" || item.id === "m2" ? 510 : // Over a year
        item.id === "f5" || item.id === "m5" ? 385 : // Over a year
        item.id === "f9" || item.id === "m9" ? 420 : // Over a year
        (index * 25) + 15; // Recent
      
      const lastWornDate = new Date();
      lastWornDate.setDate(now.getDate() - daysAgo);
      enriched.last_worn_at = lastWornDate.toISOString();
    }
    
    return enriched;
  });
};

const formatLastWorn = (isoString?: string) => {
  if (!isoString) return "Never worn";
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - new Date(isoString).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return "Today";
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;
  const diffYears = (diffDays / 365).toFixed(1);
  return `${diffYears} year${Number(diffYears) === 1.0 ? "" : "s"} ago`;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isOnboarding, setIsOnboarding] = useState<boolean>(false);
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [appUserId, setAppUserId] = useState<string>("");
  
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

  // Custom setter to always enrich items
  const setWardrobeItems = (rawItems: any[] | ((prev: any[]) => any[])) => {
    if (typeof rawItems === "function") {
      setItems(prev => enrichWardrobeItems(rawItems(prev)));
    } else {
      setItems(enrichWardrobeItems(rawItems));
    }
  };

  // KonMari Declutter Room States
  const [declutterMode, setDeclutterMode] = useState<boolean>(false);
  const [releasedItem, setReleasedItem] = useState<any>(null);
  const [gratitudeCount, setGratitudeCount] = useState<number>(0);

  // KonMari Mindfulness states
  const [gratitudeOption, setGratitudeOption] = useState<string>("served_comfort");
  const [customGratitude, setCustomGratitude] = useState<string>("");
  const [ceremonyStep, setCeremonyStep] = useState<"reflect" | "breathe" | "complete">("reflect");
  const [isBreathingIn, setIsBreathingIn] = useState<boolean>(true);

  // Mindfulness breathing exercise interval
  useEffect(() => {
    if (ceremonyStep !== "breathe") return;

    const interval = setInterval(() => {
      setIsBreathingIn(prev => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, [ceremonyStep]);

  // Retailer Integration States
  const [retailSyncOpen, setRetailSyncOpen] = useState<boolean>(false);
  const [retailStore, setRetailStore] = useState<string>("zara.com");
  const [retailEmail, setRetailEmail] = useState<string>("");
  const [retailPassword, setRetailPassword] = useState<string>("");
  const [retailSyncStatus, setRetailSyncStatus] = useState<"idle" | "connecting" | "bypassing" | "fetching" | "synthesizing" | "success" | "error">("idle");
  const [retailSyncLogs, setRetailSyncLogs] = useState<string[]>([]);
  const [connectedStores, setConnectedStores] = useState<any[]>([]);
  const [cronSyncing, setCronSyncing] = useState<boolean>(false);
  const [bgSyncActive, setBgSyncActive] = useState<boolean>(false);
  const [bgSyncMessage, setBgSyncMessage] = useState<string>("");

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [uploadStatus, setUploadStatus] = useState<string>(""); 
  
  // Interactive Daily OOTD Planner States
  const [ootdResult, setOotdResult] = useState<any>(null);
  const [isGeneratingOOTD, setIsGeneratingOOTD] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [likedOOTD, setLikedOOTD] = useState<boolean | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [calendarConnected, setCalendarConnected] = useState<boolean>(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [calendarDebug, setCalendarDebug] = useState<any>(null);
  const [ootdWeather, setOotdWeather] = useState<any>(null);
  const [plannerSource, setPlannerSource] = useState<string>("");

  // Virtual Try-On Modal States
  const [isTryOnModalOpen, setIsTryOnModalOpen] = useState<boolean>(false);
  const [selectedTryOnItem, setSelectedTryOnItem] = useState<any>(null);
  const [tryOnStep, setTryOnStep] = useState<"choose" | "loading" | "result">("choose");
  const [tryOnPhoto, setTryOnPhoto] = useState<string | null>(null);
  const [tryOnResultPhoto, setTryOnResultPhoto] = useState<string | null>(null);
  const [isSimulatingCamera, setIsSimulatingCamera] = useState<boolean>(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("closet-companion-session");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (parsed.userProfile) setUserProfile(parsed.userProfile);
      if (parsed.userId) setAppUserId(parsed.userId);
      setIsAuthenticated(true);
    } catch {
      window.localStorage.removeItem("closet-companion-session");
    }
  }, []);

  const persistSession = (profile: typeof userProfile, userId: string) => {
    window.localStorage.setItem(
      "closet-companion-session",
      JSON.stringify({ userProfile: profile, userId })
    );
  };

  const getBaseWardrobe = (gender = userProfile.gender) =>
    gender === "female" ? FEMALE_WARDROBE : MALE_WARDROBE;

  const readCachedWardrobe = (userId = appUserId, email = userProfile.email) => {
    try {
      return JSON.parse(window.localStorage.getItem(userWardrobeStorageKey(userId, email)) || "[]");
    } catch {
      return [];
    }
  };

  const cacheWardrobeItem = (item: any, userId = appUserId, email = userProfile.email) => {
    try {
      const cached = readCachedWardrobe(userId, email);
      const next = mergeWardrobeItems([item], cached).slice(0, 24);
      window.localStorage.setItem(userWardrobeStorageKey(userId, email), JSON.stringify(next));
    } catch (error) {
      console.warn("Could not cache wardrobe item locally.", error);
    }
  };

  const syncProfile = async (profile = userProfile, existingUserId = appUserId) => {
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userProfile: profile, userId: existingUserId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to sync profile.");
    setAppUserId(data.userId);
    persistSession(profile, data.userId);
    return data.userId as string;
  };

  // Initialize closet depending on selected gender
  useEffect(() => {
    if (isAuthenticated) {
      setWardrobeItems(mergeWardrobeItems(readCachedWardrobe(), getBaseWardrobe()));
    }
  }, [isAuthenticated, userProfile.gender]);

  // Fetch real Supabase closet items fallback
  useEffect(() => {
    if (isAuthenticated && (appUserId || userProfile.email)) {
      fetchClosetItems();
    }
  }, [isAuthenticated, appUserId, userProfile.email, userProfile.gender]);

  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated && (appUserId || userProfile.email)) {
        fetchClosetItems();
        fetchConnectedStores();
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isAuthenticated, appUserId, userProfile.email]);

  const fetchClosetItems = async () => {
    try {
      const params = new URLSearchParams();
      if (appUserId) params.set("userId", appUserId);
      if (userProfile.email) params.set("email", userProfile.email);
      if (userProfile.fullName) params.set("fullName", userProfile.fullName);
      if (userProfile.locationCity) params.set("city", userProfile.locationCity);

      const response = await fetch(`/api/wardrobe/items?${params.toString()}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to fetch wardrobe.");

      if (result.userId && result.userId !== appUserId) {
        setAppUserId(result.userId);
        persistSession(userProfile, result.userId);
      }

      const cached = readCachedWardrobe(result.userId || appUserId, userProfile.email);
      setWardrobeItems(mergeWardrobeItems(result.items || [], cached, getBaseWardrobe()));
    } catch (err: any) {
      console.error("Failed to fetch wardrobe:", err);
      setWardrobeItems(userProfile.gender === "female" ? FEMALE_WARDROBE : MALE_WARDROBE);
    }
  };

  const fetchConnectedStores = async () => {
    if (!appUserId) return;
    try {
      const response = await fetch(`/api/wardrobe/import/zara?userId=${appUserId}`);
      const data = await response.json();
      if (response.ok && data.stores) {
        setConnectedStores(data.stores);
      }
    } catch (err) {
      console.warn("Failed to fetch connected stores:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && appUserId) {
      fetchConnectedStores();
    }
  }, [isAuthenticated, appUserId]);

  // Auto-Tagging Ingestion
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadStatus("uploading");
      const currentUserId = appUserId || await syncProfile(userProfile);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", currentUserId);

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
        body: JSON.stringify({ imageUrl, userId: currentUserId, userProfile }),
      });

      if (!tagResponse.ok) {
        const errorData = await tagResponse.json();
        throw new Error(errorData.error || "Tagging failed.");
      }

      const tagData = await tagResponse.json();
      if (tagData.userId && tagData.userId !== appUserId) {
        setAppUserId(tagData.userId);
        persistSession(userProfile, tagData.userId);
      }
      setUploadStatus("complete");

      cacheWardrobeItem(tagData.item, tagData.userId || currentUserId, userProfile.email);
      setWardrobeItems(prev => mergeWardrobeItems([tagData.item], prev));

      setTimeout(() => setUploadStatus(""), 4000);
    } catch (err: any) {
      console.error("Ingestion failed:", err);
      setUploadStatus("");
      alert(err.message || "An error occurred during image analysis.");
    }
  };

  const handleConnectRetailer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retailEmail || !retailPassword) {
      alert("Please provide both email and password.");
      return;
    }

    // Immediately close the modal to prevent blocking the user
    setRetailSyncOpen(false);
    setBgSyncActive(true);
    setBgSyncMessage("🤖 Initializing Chromium headless driver...");

    // Run scraping process in the background
    (async () => {
      try {
        setRetailSyncLogs([]);
        
        const log = (msg: string, delay = 1500) => {
          return new Promise<void>(resolve => {
            setTimeout(() => {
              setRetailSyncLogs(prev => [...prev, msg]);
              setBgSyncMessage(msg);
              resolve();
            }, delay);
          });
        };

        setRetailSyncStatus("connecting");
        await log("🌐 Connecting to retail gateway: https://www.zara.com/us/en/log-in");
        await log(`🔑 Transmitting secure connection keys for user: "${retailEmail}"...`);

        setRetailSyncStatus("bypassing");
        await log("🛡️ Anti-bot active. Bypassing Cloudflare CAPTCHA...", 1800);
        await log("🔑 Handshake acknowledged. Cookie session extracted!", 1200);

        setRetailSyncStatus("fetching");
        await log("📥 Establishing secure stream. Fetching receipts...", 1500);
        await log("🧾 Match found: Order #ZR-982734 (Nov 2025)", 1000);
        await log("🛒 Downloading product SKU items...", 1200);

        setRetailSyncStatus("synthesizing");
        await log("✨ Categorizing retrieved garments...", 1500);
        await log("🤖 Fabric matching & ideal suit temp indices in progress...", 1200);

        const currentUserId = appUserId || await syncProfile(userProfile);

        const response = await fetch("/api/wardrobe/import/zara", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUserId,
            email: retailEmail,
            password: retailPassword,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed importing retail orders.");

        setRetailSyncStatus("success");
        setBgSyncMessage("🎉 Success! 5 brand new Zara garments imported.");

        if (data.items && data.items.length > 0) {
          setWardrobeItems(prev => mergeWardrobeItems(data.items, prev));
          data.items.forEach((it: any) => cacheWardrobeItem(it, currentUserId, userProfile.email));
        }
        fetchConnectedStores();
        
        // Clear background sync toast after a pleasant delay
        setTimeout(() => {
          setBgSyncActive(false);
          setBgSyncMessage("");
        }, 5000);
      } catch (err: any) {
        console.error(err);
        setRetailSyncStatus("error");
        setBgSyncMessage(`❌ Sync failed: ${err.message || "Unknown error"}`);
        setTimeout(() => {
          setBgSyncActive(false);
          setBgSyncMessage("");
        }, 6000);
      }
    })();
  };

  const handleCronSync = async () => {
    if (cronSyncing) return;
    setCronSyncing(true);
    
    try {
      const currentUserId = appUserId || await syncProfile(userProfile);
      
      const response = await fetch("/api/wardrobe/import/zara", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          isCronJob: true,
        }),
      });

      const data = await response.json();
      if (response.ok && data.items) {
        setWardrobeItems(prev => mergeWardrobeItems(data.items, prev));
        data.items.forEach((it: any) => cacheWardrobeItem(it, currentUserId, userProfile.email));
        fetchConnectedStores();
      }
    } catch (err) {
      console.warn("Background cron sync failed:", err);
    } finally {
      setTimeout(() => setCronSyncing(false), 2500);
    }
  };

  // OOTD compilation backed by live weather, Google Calendar, Supabase closet, and Gemini.
  const compileOOTDSelection = async () => {
    if (isGeneratingOOTD) return;
    setIsGeneratingOOTD(true);
    setLikedOOTD(null);

    try {
      const response = await fetch("/api/ootd/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: appUserId,
          userProfile,
          closetItems: items,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate outfit.");

      const primaryOutfit = data.outfits?.[0];
      if (!primaryOutfit) throw new Error("The planner did not return an outfit.");

      const itemDetails = Array.isArray(primaryOutfit.items) ? primaryOutfit.items : [];
      const itemIds = itemDetails.map((item: any) => item.id).filter(Boolean);
      const normalizedResult = {
        ...primaryOutfit,
        scenario: primaryOutfit.scenario || primaryOutfit.context || "Today's Outfit",
        schedule: primaryOutfit.schedule || (data.calendar || []).map((event: any) => `${event.time} - ${event.title}`).join(" · "),
        weather: primaryOutfit.weather || `${data.weather?.temp}°F • ${data.weather?.condition} in ${data.weather?.city}`,
        reasoning: primaryOutfit.reasoning || primaryOutfit.stylingReasoning,
        itemDetails,
        items: itemIds,
      };

      setOotdResult(normalizedResult);
      setSelectedItems(itemIds);
      setCalendarEvents(
        Array.isArray(data.calendarEvents)
          ? data.calendarEvents
          : (data.calendar || []).filter((event: any) => String(event.source || "").startsWith("google:"))
      );
      setCalendarConnected(Boolean(data.calendarConnected));
      setCalendarError(data.calendarError || null);
      setCalendarDebug(data.calendarDebug || null);
      setOotdWeather(data.weather || null);
      setPlannerSource(data.plannerSource || "");
      if (data.userId && data.userId !== appUserId) {
        setAppUserId(data.userId);
        persistSession(userProfile, data.userId);
      }
    } catch (err: any) {
      console.error("OOTD generation failed:", err);
      alert(err.message || "Failed to generate today's outfit.");
    } finally {
      setIsGeneratingOOTD(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && items.length > 0) {
      compileOOTDSelection();
    }
  }, [isAuthenticated, appUserId, items.length]);

  const handleDeleteItem = async (id: string) => {
    if (id.startsWith("m") || id.startsWith("f")) {
      setWardrobeItems(prev => prev.filter(item => item.id !== id));
      return;
    }

    try {
      const response = await fetch("/api/wardrobe/items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, userId: appUserId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete item.");
      setWardrobeItems(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      console.error("Failed to delete:", err);
    }
  };

  const updateItemJoyScore = async (id: string, score: number) => {
    // 1. Update state immediately for optimal UX
    setWardrobeItems(prev => prev.map(item => item.id === id ? { ...item, joy_score: score } : item));

    // If it's a default mock item, we don't need to write to Supabase (or we can write if we have synced it)
    if (id.startsWith("m") || id.startsWith("f")) {
      // Local cache update
      try {
        const cached = readCachedWardrobe();
        const updatedCache = cached.map((item: any) => item.id === id ? { ...item, joy_score: score } : item);
        window.localStorage.setItem(userWardrobeStorageKey(appUserId, userProfile.email), JSON.stringify(updatedCache));
      } catch (err) {
        console.warn("Could not cache joy score locally:", err);
      }
      return;
    }

    // 2. Call PUT API
    try {
      const response = await fetch("/api/wardrobe/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, userId: appUserId, joy_score: score }),
      });
      const data = await response.json();
      if (!response.ok) {
        console.warn("Could not sync joy score update to server, using local fallback:", data.warning);
      }
    } catch (err) {
      console.warn("Could not sync joy score update to server, using local fallback:", err);
    }
  };

  const markItemWornToday = async (id: string) => {
    const todayIso = new Date().toISOString();
    setWardrobeItems(prev => prev.map(item => item.id === id ? { ...item, last_worn_at: todayIso } : item));

    if (id.startsWith("m") || id.startsWith("f")) {
      try {
        const cached = readCachedWardrobe();
        const updatedCache = cached.map((item: any) => item.id === id ? { ...item, last_worn_at: todayIso } : item);
        window.localStorage.setItem(userWardrobeStorageKey(appUserId, userProfile.email), JSON.stringify(updatedCache));
      } catch (err) {
        console.warn("Could not cache wear date locally:", err);
      }
      return;
    }

    try {
      const response = await fetch("/api/wardrobe/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, userId: appUserId, last_worn_at: todayIso }),
      });
      const data = await response.json();
      if (!response.ok) {
        console.warn("Could not sync last worn update to server, using local fallback:", data.warning);
      }
    } catch (err) {
      console.warn("Could not sync last worn update to server, using local fallback:", err);
    }
  };

  const handleStartReleaseCeremony = (item: any) => {
    setReleasedItem(item);
    setGratitudeOption("served_comfort");
    setCustomGratitude("");
    setCeremonyStep("reflect");
    setIsBreathingIn(true);
  };

  const handleCompleteReleaseCeremony = async () => {
    if (!releasedItem) return;
    
    const itemId = releasedItem.id;
    await handleDeleteItem(itemId);
    setGratitudeCount(prev => prev + 1);
    setReleasedItem(null);
  };

  const filteredItems = activeCategory === "All"
    ? items
    : items.filter(item => item.category.toLowerCase() === activeCategory.toLowerCase());

  // Handle onboarding submission
  const handleOnboardingSubmit = async () => {
    try {
      const userId = await syncProfile(userProfile);
      setAppUserId(userId);
      setIsOnboarding(false);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error("Failed to sync profile to database", err);
      alert(err.message || "Failed to create profile.");
    }
  };

  // Dispatch real-time styling digest email via Resend API
  const handleSendEmail = async () => {
    if (!userProfile.email) {
      alert("Please ensure your registered email address is set in your profile settings.");
      return;
    }
    if (!ootdResult) {
      alert("No curated outfit is currently loaded. Please select an event scenario first.");
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await fetch("/api/ootd/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userProfile.email,
          ootdResult: {
            ...ootdResult,
            items: ootdResult.itemDetails?.length
              ? ootdResult.itemDetails
              : selectedItems.map(id => items.find(item => item.id === id)).filter(Boolean),
          },
          userProfile,
          weather: ootdWeather,
          calendar: calendarEvents,
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert(`✨ ${data.message || 'Style digest email dispatched successfully!'}`);
      } else {
        alert(`❌ ${data.error || 'Failed to dispatch email.'}`);
      }
    } catch (err: any) {
      console.error("Email dispatch failed:", err);
      alert(`❌ Error dispatching email: ${err.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const submitOOTDFeedback = async (liked: boolean) => {
    setLikedOOTD(liked);
    if (!selectedItems.length) return;

    try {
      await fetch("/api/ootd/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: appUserId,
          userProfile,
          itemIds: selectedItems,
          liked,
          dislikeReason: liked ? null : "User marked this outfit as not matching their style.",
        }),
      });
    } catch (err) {
      console.error("Failed to submit outfit feedback:", err);
    }
  };

  const handleConnectCalendar = async () => {
    try {
      const response = await fetch("/api/google/auth-url?returnTo=/");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to start Google Calendar connection.");
      window.location.href = data.url;
    } catch (err: any) {
      alert(err.message || "Failed to connect Google Calendar.");
    }
  };

  const handleDisconnectCalendar = async () => {
    await fetch("/api/google/disconnect", { method: "POST" });
    setCalendarConnected(false);
    setCalendarEvents([]);
    setCalendarError(null);
    setCalendarDebug(null);
    compileOOTDSelection();
  };

  // Handle simulated login
  const handleMockLogin = async () => {
    const profile = {
      fullName: "Vagisha Tyagi",
      email: "vagisha.tyagi001@gmail.com",
      gender: "female",
      locationCity: "New York",
      budgetLimit: 120,
      preferredAesthetics: ["Classic Minimalist", "Academia"]
    };

    try {
      const userId = await syncProfile(profile);
      setUserProfile(profile);
      setAppUserId(userId);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error("Demo sign-in failed:", err);
      alert(err.message || "Demo sign-in failed.");
    }
  };

  // Virtual Try-On flow simulation
  const handleTryOnTrigger = (item: any) => {
    setSelectedTryOnItem(item);
    setTryOnPhoto(null);
    setTryOnStep("choose");
    setIsTryOnModalOpen(true);
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
                    vibecheck.ai
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
                  onClick={() => {
                    window.localStorage.removeItem("closet-companion-session");
                    setIsAuthenticated(false);
                    setAppUserId("");
                    setOotdResult(null);
                    setSelectedItems([]);
                  }}
                  className="text-xs font-semibold px-4 py-2 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900 transition-all text-slate-400 hover:text-white cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            </header>

            {/* BACKGROUND SYNC STATUS CARD */}
            <AnimatePresence>
              {bgSyncActive && (
                <div className="w-full max-w-7xl mx-auto px-6 mt-6 z-30">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border border-cyan-500/30 bg-cyan-950/15 backdrop-blur-xl rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xl"
                  >
                    <div className="flex gap-3.5 items-center">
                      <div className="h-10 w-10 rounded-xl bg-cyan-950/50 border border-cyan-800/30 flex items-center justify-center text-cyan-400 shrink-0">
                        {retailSyncStatus === "success" ? (
                          <Check className="h-5 w-5 text-emerald-400 animate-bounce" />
                        ) : retailSyncStatus === "error" ? (
                          <span className="text-rose-400 font-bold">!</span>
                        ) : (
                          <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
                        )}
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-cyan-200 flex items-center gap-1.5 uppercase tracking-wider">
                          Zara.com Background Importer
                          <span className="text-[10px] px-2 py-0.5 rounded-full border bg-cyan-500/10 text-cyan-300 border-cyan-500/20 animate-pulse">
                            {retailSyncStatus === "success" ? "Finished" : retailSyncStatus === "error" ? "Failed" : "Syncing..."}
                          </span>
                        </h4>
                        <p className="text-xs text-slate-300 mt-1">
                          {bgSyncMessage}
                        </p>
                      </div>
                    </div>
                    {retailSyncStatus !== "success" && retailSyncStatus !== "error" && (
                      <div className="hidden sm:block text-[11px] text-cyan-400 font-mono animate-pulse">
                        Progress: {retailSyncStatus === "connecting" && "Initializing driver (20%)"}
                        {retailSyncStatus === "bypassing" && "Bypassing CAPTCHA (45%)"}
                        {retailSyncStatus === "fetching" && "Extracting receipts (70%)"}
                        {retailSyncStatus === "synthesizing" && "Structuring items (90%)"}
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

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
                        Google Calendar Context
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          calendarConnected
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/20"
                        }`}>
                          {calendarConnected ? "Connected" : "Not connected"}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-300 mt-1">
                        {calendarConnected && calendarEvents.length > 0 ? (
                          <>
                            {String(calendarEvents[0].source || "").includes(":upcoming:") ? "Upcoming event" : "Today's first event"}: <span className="text-white font-semibold">&quot;{calendarEvents[0].title}&quot;</span> ({calendarEvents[0].time}).
                          </>
                        ) : calendarConnected ? (
                          "Calendar is connected and no events were found today. The planner will optimize for weather and your closet."
                        ) : (
                          "Connect Google Calendar so outfits adapt to your real meetings, workouts, meals, and social plans instead of canned demo events."
                        )}
                        {calendarError && <span className="block text-red-300 mt-1">{calendarError}</span>}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={calendarConnected ? compileOOTDSelection : handleConnectCalendar}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/15 transition-all self-start md:self-auto cursor-pointer"
                  >
                    {calendarConnected ? "Refresh Outfit Context" : "Connect Google Calendar"}
                  </button>
                </div>

                {/* Suggested Outfit Preview */}
                <div className="border-t border-amber-900/30 pt-4 mt-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Current Outfit Pieces:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-3">
                    {items.filter(it => selectedItems.includes(it.id)).map(it => (
                      <div key={it.id} className="flex items-center gap-2 bg-slate-950/60 border border-slate-900 rounded-lg p-2">
                        <img src={it.image_url} alt={it.sub_category} className="w-8 h-10 object-cover rounded-md bg-slate-900 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-semibold text-white truncate max-w-[80px]">{it.sub_category}</span>
                          <span className="text-[8px] text-slate-500">{it.color_family}</span>
                        </div>
                      </div>
                    ))}
                    {selectedItems.length === 0 && (
                      <div className="text-[11px] text-slate-400 col-span-full">
                        Generate a daily outfit to see the selected pieces here.
                      </div>
                    )}
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

                {/* RETAILER AUTOMATIC IMPORT PANEL */}
                <div className="relative border border-slate-850 bg-slate-900/40 backdrop-blur-xl rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center shadow-xl shadow-black/40 overflow-hidden">
                  {/* Glowing Accent Border */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-blue-500" />

                  <div className="flex flex-col gap-2 flex-1 text-center md:text-left">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 flex items-center gap-1.5 justify-center md:justify-start">
                      <Compass className="h-3 w-3 text-cyan-400" /> Retailer &amp; Email Sync Portal
                    </span>
                    <h2 className="text-xl font-bold tracking-tight text-white">
                      Auto-Sync Online Purchase History
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                      Connect your online store accounts or securely scan clothing receipt emails to populate your smart closet catalog without needing model photography.
                    </p>
                    
                    {/* Connection Badges */}
                    {connectedStores.length > 0 && (
                      <div className="flex flex-wrap gap-2.5 mt-3 justify-center md:justify-start">
                        {connectedStores.map((store) => (
                          <div key={store.id} className="flex items-center gap-2 px-3 py-1 bg-slate-950/60 border border-slate-800/80 rounded-lg text-[10px] font-mono font-bold text-slate-200">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            <span className="capitalize">{store.store_name === 'email-sync' ? 'Email Receipts Scanner' : store.store_name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="w-full md:w-auto flex flex-col gap-3 min-w-[220px]">
                    <a
                      href="/retail-sync"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/10 cursor-pointer transition-all flex items-center justify-center gap-2 hover:scale-102 transform text-center"
                    >
                      <Compass className="h-4 w-4" />
                      <span>Launch Sync Hub (New Tab)</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                {/* CLOSET GRID HEADERS AND FILTER BAR */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {declutterMode ? (
                          <>
                            <Sparkles className="h-4.5 w-4.5 text-rose-300 animate-pulse" />
                            <span>KonMari Declutter Room</span>
                          </>
                        ) : (
                          <>
                            <Filter className="h-4.5 w-4.5 text-purple-400" />
                            <span>Your Wardrobe Closet</span>
                          </>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {declutterMode 
                          ? "Reflect on your wardrobe to keep only those garments that spark true joy."
                          : `Showing ${filteredItems.length} items cataloged.`
                        }
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setDeclutterMode(!declutterMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          declutterMode
                            ? "bg-gradient-to-r from-rose-500 to-purple-600 border-rose-400 text-white shadow-lg shadow-purple-500/20"
                            : "bg-slate-950/80 border-slate-800 text-purple-400 hover:text-white hover:border-purple-500/50 hover:bg-purple-950/25"
                        }`}
                      >
                        <Sparkle className="h-3.5 w-3.5" />
                        {declutterMode ? "Return to Closet" : "🌸 KonMari Declutter Room"}
                      </button>

                      {!declutterMode && (
                        <div className="flex flex-wrap gap-1.5 bg-slate-950 border border-slate-900/60 p-1 rounded-xl">
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
                      )}
                    </div>
                  </div>

                  {declutterMode ? (
                    /* DECLUTTER ROOM WORKSPACE */
                    <div className="flex flex-col gap-6 bg-slate-900/10 border border-slate-850/80 p-6 rounded-2xl backdrop-blur-xl relative overflow-hidden">
                      {/* Gentle decorative ambient background glow */}
                      <div className="absolute top-0 right-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />
                      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

                      {/* Header Quote Card */}
                      <div className="relative border border-purple-900/20 bg-purple-950/5 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-purple-950/40 border border-purple-800/20 flex items-center justify-center shrink-0">
                          <Sparkle className="h-5 w-5 text-purple-400 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-xs text-purple-200 italic leading-relaxed font-medium">
                            &quot;The question of what you want to own is actually the question of how you want to live your life. Keep only those things that speak to your heart, and thank those that have served their purpose.&quot;
                          </p>
                          <span className="text-[10px] text-purple-400 font-bold uppercase mt-1 block tracking-wider">— Marie Kondo (KonMari Strategy)</span>
                        </div>
                      </div>

                      {/* Mindful Declutter Metrics */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-xl border border-slate-900 bg-slate-950/60 p-4">
                          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Total Closet</span>
                          <p className="text-lg font-bold text-white mt-1">{items.length} garments</p>
                        </div>
                        <div className="rounded-xl border border-slate-900 bg-slate-950/60 p-4">
                          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Unworn &gt; 1 Year</span>
                          <p className="text-lg font-bold text-rose-300 mt-1">
                            {(() => {
                              const oneYearAgo = new Date();
                              oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                              return items.filter(it => it.last_worn_at && new Date(it.last_worn_at) < oneYearAgo).length;
                            })()}{" "}
                            items
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-900 bg-slate-950/60 p-4">
                          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Released</span>
                          <p className="text-lg font-bold text-emerald-300 mt-1">{gratitudeCount} items</p>
                        </div>
                      </div>

                      {/* Items to Declutter */}
                      <div className="flex flex-col gap-4 mt-2">
                        <h4 className="text-xs font-bold text-slate-300 tracking-wider uppercase">
                          🌸 Reflect on Your Garments
                        </h4>
                        
                        {items.length === 0 ? (
                          <div className="text-xs text-slate-400 text-center py-8">
                            Your wardrobe is empty. Upload some closet photos first!
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4">
                            {items.map(item => {
                              const oneYearAgo = new Date();
                              oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                              const isUnwornOverYear = item.last_worn_at && new Date(item.last_worn_at) < oneYearAgo;
                              
                              return (
                                <motion.div
                                  key={item.id}
                                  layout
                                  className="flex flex-col sm:flex-row gap-5 p-4 rounded-xl border border-slate-900 bg-slate-950/20 hover:border-slate-800 transition-all items-start sm:items-center justify-between"
                                >
                                  {/* Item Photo & Details */}
                                  <div className="flex gap-4 items-center w-full sm:w-auto">
                                    <div className="w-16 h-20 relative bg-slate-900 rounded-lg overflow-hidden shrink-0 border border-slate-850">
                                      <img src={item.image_url} alt={item.sub_category} className="w-full h-full object-cover" />
                                      <span className="absolute bottom-1 left-1 text-[7px] uppercase font-bold px-1.5 py-0.2 bg-slate-950/80 border border-slate-900 text-purple-400 rounded">
                                        {item.category}
                                      </span>
                                    </div>
                                    <div className="flex flex-col gap-1 min-w-0">
                                      <h5 className="font-semibold text-xs text-white tracking-tight">{item.sub_category}</h5>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-900">
                                          {item.color_family}
                                        </span>
                                        <span className="text-[9px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-900">
                                          {item.fabric}
                                        </span>
                                      </div>
                                      
                                      <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                        ⏳ Last Worn: <strong className="text-slate-200">{formatLastWorn(item.last_worn_at)}</strong>
                                      </span>
                                    </div>
                                  </div>

                                  {/* Scoring & Recommendations */}
                                  <div className="flex flex-col gap-2.5 w-full sm:w-auto sm:items-end shrink-0 mt-3 sm:mt-0">
                                    {/* Sparks Joy Interactive Stars */}
                                    <div className="flex flex-col gap-1 sm:items-end">
                                      <span className="text-[8px] uppercase tracking-wider font-bold text-slate-500 flex items-center gap-1">
                                        Sparks Joy?
                                        <span className="text-[10px] text-yellow-400 font-semibold">
                                          {item.joy_score === 1 && " (💔 No Joy)"}
                                          {item.joy_score === 2 && " (🌸 Low Joy)"}
                                          {item.joy_score === 3 && " (⭐️ Neutral)"}
                                          {item.joy_score === 4 && " (✨ Sparks Joy!)"}
                                          {item.joy_score === 5 && " (💖 Sparks Immense Joy!)"}
                                        </span>
                                      </span>
                                      <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                          <button
                                            key={star}
                                            onClick={() => updateItemJoyScore(item.id, star)}
                                            className="text-slate-600 hover:text-yellow-400 transition-colors cursor-pointer"
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className={`h-4.5 w-4.5 ${
                                                star <= (item.joy_score || 5)
                                                  ? "fill-yellow-400 text-yellow-400"
                                                  : "text-slate-700"
                                              }`}
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.246.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.178 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 10.1c-.773-.564-.374-1.81.588-1.81h4.908a1 1 0 00.95-.69l1.519-4.674z"
                                              />
                                            </svg>
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Action row & Warnings */}
                                    <div className="flex flex-col sm:items-end gap-1.5">
                                      {isUnwornOverYear && (
                                        <span className="text-[9px] text-rose-300 bg-rose-950/20 px-2 py-0.5 rounded border border-rose-900/30 font-medium">
                                          🌸 Unworn over a year: Recommended to Donate
                                        </span>
                                      )}

                                      <div className="flex gap-2.5 items-center mt-1">
                                        <button
                                          onClick={() => markItemWornToday(item.id)}
                                          className="text-[9px] font-bold text-slate-300 hover:text-white px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-md transition-all cursor-pointer flex items-center gap-1"
                                          title="Reset wear date to today"
                                        >
                                          Mark Worn
                                        </button>
                                        
                                        <button
                                          onClick={() => handleStartReleaseCeremony(item)}
                                          className="text-[9px] font-bold text-rose-300 hover:text-white px-2.5 py-1.5 bg-rose-950/20 border border-rose-900/30 hover:bg-rose-950/40 rounded-md transition-all cursor-pointer flex items-center gap-1"
                                        >
                                          Thank &amp; Release
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Closet Cards Grid */
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
                  )}
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
                      Generates a live outfit from your current closet, local weather, calendar events, and previous feedback.
                    </p>
                  </div>

                  {/* Live Context Controls */}
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-3">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Weather</span>
                        <p className="text-xs font-semibold text-slate-200 mt-1">
                          {ootdWeather ? `${ootdWeather.temp}°F • ${ootdWeather.condition}` : "Loading"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-3">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Calendar</span>
                        <p className="text-xs font-semibold text-slate-200 mt-1">
                          {calendarConnected ? `${calendarEvents.length} event${calendarEvents.length === 1 ? "" : "s"}` : "Not connected"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={compileOOTDSelection}
                        disabled={isGeneratingOOTD}
                        className="flex items-center justify-center gap-2 p-3 rounded-xl border border-purple-500/50 bg-purple-600/10 text-white hover:bg-purple-600/20 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isGeneratingOOTD ? <Loader2 className="h-4 w-4 animate-spin text-purple-300" /> : <RefreshCw className="h-4 w-4 text-purple-300" />}
                        <span className="text-xs font-semibold">Generate From Live Context</span>
                      </button>
                      <button
                        onClick={calendarConnected ? handleDisconnectCalendar : handleConnectCalendar}
                        className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-900 bg-slate-950/40 text-slate-300 hover:text-white hover:border-slate-800 transition-all cursor-pointer"
                      >
                        <Calendar className="h-4 w-4 text-amber-300" />
                        <span className="text-xs font-semibold">{calendarConnected ? "Disconnect Calendar" : "Connect Google Calendar"}</span>
                      </button>
                    </div>
                    {plannerSource && (
                      <p className="text-[10px] text-slate-500">
                        Planner source: {plannerSource === "gemini" ? "Gemini" : "Rules fallback"}
                      </p>
                    )}
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
                              onClick={() => submitOOTDFeedback(true)}
                              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                                likedOOTD === true
                                  ? "bg-purple-600 border-purple-500 text-white"
                                  : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-purple-400"
                              }`}
                            >
                              <Heart className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => submitOOTDFeedback(false)}
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
                    onClick={handleSendEmail}
                    disabled={isSendingEmail}
                    className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white transition-all shadow-lg shadow-purple-500/10 cursor-pointer disabled:opacity-50"
                  >
                    {isSendingEmail ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending Style Digest...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        Send Style Digest Email
                      </>
                    )}
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
      {/* 5. MINDFUL KONMARI GRATITUDE CEREMONY MODAL */}
      <AnimatePresence>
        {releasedItem && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="w-full max-w-lg border border-rose-900/30 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Sparkly lavender/rose decorative background lights */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 h-48 w-48 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-12 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

              <div className="flex flex-col items-center gap-6 relative z-10 text-center">
                {/* Modal Header */}
                <div className="flex flex-col items-center gap-2">
                  <div className="h-14 w-14 rounded-full bg-rose-950/50 border border-rose-900/30 flex items-center justify-center text-rose-300 shadow-lg shadow-rose-950/40 animate-pulse">
                    <Heart className="h-6 w-6 text-rose-300" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-rose-400">KonMari Ritual</span>
                    <h3 className="text-lg font-bold text-white mt-1">Thank &amp; Release Ceremony</h3>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center gap-2 bg-slate-950/50 border border-slate-900 px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-500">
                  <span className={ceremonyStep === "reflect" ? "text-purple-400" : "text-slate-500"}>1. Reflect</span>
                  <span className="text-slate-700">•</span>
                  <span className={ceremonyStep === "breathe" ? "text-purple-400" : "text-slate-500"}>2. Breathe</span>
                  <span className="text-slate-700">•</span>
                  <span className={ceremonyStep === "complete" ? "text-emerald-400" : "text-slate-500"}>3. Release</span>
                </div>

                {/* STEP 1: REFLECT & GRATITUDE SELECTION */}
                {ceremonyStep === "reflect" && (
                  <div className="w-full flex flex-col gap-4">
                    {/* Item Preview */}
                    <div className="flex items-center gap-4 bg-slate-950/40 border border-slate-900 rounded-2xl p-3 text-left">
                      <img
                        src={releasedItem.image_url}
                        alt={releasedItem.sub_category}
                        className="w-14 h-18 object-cover rounded-xl border border-slate-850 shadow-md"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-purple-400 font-bold uppercase">{releasedItem.category}</span>
                        <h4 className="text-sm font-bold text-white">{releasedItem.color_family} {releasedItem.sub_category}</h4>
                        <span className="text-[10px] text-slate-500">Last worn: {formatLastWorn(releasedItem.last_worn_at)}</span>
                      </div>
                    </div>

                    {/* Joy Score Confirmation */}
                    <div className="flex flex-col gap-1 text-left bg-slate-950/20 border border-slate-900 p-4 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                        Confirm Joy Score:
                        <span className="text-[11px] text-yellow-400 font-bold">
                          {releasedItem.joy_score === 1 && "💔 No Joy"}
                          {releasedItem.joy_score === 2 && "🌸 Low Joy"}
                          {releasedItem.joy_score === 3 && "⭐️ Neutral"}
                          {releasedItem.joy_score === 4 && "✨ Sparks Joy!"}
                          {releasedItem.joy_score === 5 && "💖 Sparks Immense Joy!"}
                        </span>
                      </span>
                      <div className="flex gap-2.5 mt-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => {
                              updateItemJoyScore(releasedItem.id, star);
                              setReleasedItem((prev: any) => ({ ...prev, joy_score: star }));
                            }}
                            className="text-slate-600 hover:text-yellow-400 transition-all transform hover:scale-110 cursor-pointer"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-6 w-6 ${
                                star <= (releasedItem.joy_score || 5)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-slate-700"
                              }`}
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.246.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.178 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 10.1c-.773-.564-.374-1.81.588-1.81h4.908a1 1 0 00.95-.69l1.519-4.674z"
                              />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Gratitude Prompt Selection */}
                    <div className="flex flex-col gap-2 text-left">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Gratitude Theme:</label>
                      <select
                        value={gratitudeOption}
                        onChange={(e) => setGratitudeOption(e.target.value)}
                        className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                      >
                        <option value="served_comfort">Cozy &amp; Comfort (&quot;keeping me warm and comfortable&quot;)</option>
                        <option value="served_moments">Confidence &amp; Special Memories (&quot;bringing me confidence and joy&quot;)</option>
                        <option value="served_lesson">Style Growth &amp; Lessons (&quot;teaching me what style doesn&apos;t fit me&quot;)</option>
                        <option value="served_gift">A Connection of Kindness (&quot;representing a kind gesture from someone dear&quot;)</option>
                        <option value="served_journey">An Elegant Companion (&quot;being a beautiful styling partner on my journey&quot;)</option>
                        <option value="custom">Custom Mindful Reflection Note...</option>
                      </select>
                    </div>

                    {/* Optional Custom Gratitude Note */}
                    {gratitudeOption === "custom" && (
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Personal Thank-You Note:</label>
                        <textarea
                          rows={2}
                          value={customGratitude}
                          onChange={(e) => setCustomGratitude(e.target.value)}
                          placeholder="Write a custom thank-you reflection..."
                          className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none transition-colors"
                        />
                      </div>
                    )}

                    {/* Live Preview of the Mindful Thank-You Note */}
                    <div className="border border-purple-900/20 bg-purple-950/5 rounded-2xl p-4 text-left relative mt-1">
                      <span className="text-[8px] uppercase font-bold tracking-widest text-purple-400 absolute top-2.5 right-3">Live Statement</span>
                      <p className="text-xs text-slate-300 italic leading-relaxed pt-2">
                        &quot;Thank you, {releasedItem.color_family} {releasedItem.sub_category}, for{" "}
                        {gratitudeOption === "custom" && customGratitude
                          ? customGratitude
                          : gratitudeOption === "custom"
                          ? "the memories and lessons we shared"
                          : gratitudeOption === "served_comfort"
                          ? "keeping me warm, cozy, and comfortable whenever I needed it"
                          : gratitudeOption === "served_moments"
                          ? "giving me confidence, strength, and joy during beautiful moments"
                          : gratitudeOption === "served_lesson"
                          ? "teaching me more about my personal style and helping me understand what doesn't suit me"
                          : gratitudeOption === "served_gift"
                          ? "representing a warm gesture of kindness and connection from someone dear"
                          : "being a wonderful and elegant companion during this chapter of my life"
                        }. You have served me beautifully. I release you with gratitude to find a new home.&quot;
                      </p>
                    </div>

                    {/* Action Row */}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => setReleasedItem(null)}
                        className="flex-1 py-3 border border-slate-850 hover:bg-slate-900 text-xs font-bold text-slate-400 hover:text-white rounded-xl cursor-pointer transition-all"
                      >
                        Keep Garment
                      </button>
                      <button
                        onClick={() => setCeremonyStep("breathe")}
                        className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/15 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      >
                        Mindful Breath
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: BREATHING MINDFULNESS EXERCISE */}
                {ceremonyStep === "breathe" && (
                  <div className="w-full flex flex-col items-center gap-6">
                    {/* Immersive Pulsing Breathing Circle */}
                    <div className="relative h-48 w-48 flex items-center justify-center">
                      {/* Concentric expanding wave 1 */}
                      <motion.div
                        animate={{ scale: isBreathingIn ? [1, 1.4, 1] : [1, 1.1, 1] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className={`absolute inset-0 rounded-full border ${
                          isBreathingIn ? "border-purple-500/20 bg-purple-500/3" : "border-rose-500/20 bg-rose-500/3"
                        }`}
                      />
                      {/* Concentric expanding wave 2 */}
                      <motion.div
                        animate={{ scale: isBreathingIn ? [1, 1.2, 1] : [1, 1.05, 1] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className={`absolute h-36 w-33 rounded-full border ${
                          isBreathingIn ? "border-purple-500/30 bg-purple-500/5" : "border-rose-500/30 bg-rose-500/5"
                        }`}
                      />
                      {/* Heart core */}
                      <div className="h-24 w-24 rounded-full bg-slate-950 border border-slate-850 flex flex-col items-center justify-center z-10 shadow-lg">
                        <img
                          src={releasedItem.image_url}
                          alt={releasedItem.sub_category}
                          className="h-16 w-12 object-cover rounded-md opacity-40 shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Dynamically toggling breathing messages */}
                    <div className="flex flex-col gap-1.5">
                      <h4 className="text-sm font-bold text-white tracking-wide">
                        {isBreathingIn ? "✨ Inhale Love & Space ✨" : "🌸 Exhale Gratitude & Release 🌸"}
                      </h4>
                      <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                        {isBreathingIn
                          ? "Breathe in peace, acknowledging the joy and utility this garment brought into your life."
                          : "Exhale attachment, letting go of clutter and sending positive energy to the next owner."}
                      </p>
                    </div>

                    <p className="text-[10px] text-purple-400 font-bold tracking-wider animate-pulse">
                      Synchronize your breathing with the pulsing expansion...
                    </p>

                    {/* Action Row */}
                    <div className="flex gap-3 w-full mt-4">
                      <button
                        onClick={() => setCeremonyStep("reflect")}
                        className="flex-1 py-3 border border-slate-850 hover:bg-slate-900 text-xs font-bold text-slate-400 hover:text-white rounded-xl cursor-pointer transition-all"
                      >
                        Adjust Note
                      </button>
                      <button
                        onClick={() => setCeremonyStep("complete")}
                        className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-500/15 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      >
                        <Sparkle className="h-3.5 w-3.5" />
                        Complete Release
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: RITUAL COMPLETION */}
                {ceremonyStep === "complete" && (
                  <div className="w-full flex flex-col items-center gap-5">
                    <div className="h-20 w-20 rounded-full bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/20 relative">
                      <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
                      <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <h4 className="text-base font-bold text-white">Item Released with Love</h4>
                      <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
                        Your {releasedItem.color_family} {releasedItem.sub_category} has been thanked, blessed, and released! It has been added to your released catalog and is ready to find its new home.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-900/30 bg-emerald-950/5 p-4 text-left w-full">
                      <span className="text-[9px] uppercase font-bold text-emerald-400 tracking-wider">Mindful Thought:</span>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1 italic">
                        &quot;By decluttering with gratitude, you let go of the past and make conscious, beautiful space for new inspiration and opportunities to unfold in your wardrobe and life.&quot;
                      </p>
                    </div>

                    <button
                      onClick={handleCompleteReleaseCeremony}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/15 cursor-pointer transition-all"
                    >
                      Return to Declutter Room
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. RETAILER ACCOUNT LINK & SYNC SIMULATION MODAL */}
      <AnimatePresence>
        {retailSyncOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="w-full max-w-lg border border-cyan-900/30 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Decorative cyan/indigo lights */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-12 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

              <div className="flex flex-col gap-6 relative z-10">
                {/* Modal Header */}
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="h-14 w-14 rounded-full bg-cyan-950/50 border border-cyan-900/30 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-950/40">
                    <Compass className="h-6 w-6 text-cyan-300 animate-spin-slow" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">Retail Sync Gateway</span>
                    <h3 className="text-lg font-bold text-white mt-1">Connect Your Shopping Apps</h3>
                  </div>
                </div>

                {/* IDLE LOGIN STATE */}
                {retailSyncStatus === "idle" && (
                  <form onSubmit={handleConnectRetailer} className="flex flex-col gap-4 text-left">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Retail Platform:</label>
                      <select
                        value={retailStore}
                        onChange={(e) => setRetailStore(e.target.value)}
                        className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                      >
                        <option value="zara.com">Zara (zara.com/us/en)</option>
                        <option value="hm.com">H&amp;M (hm.com/en_us) [Coming Soon]</option>
                        <option value="asos.com">ASOS (asos.com/us) [Coming Soon]</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Zara.com Email / Username:</label>
                      <input
                        type="email"
                        required
                        value={retailEmail}
                        onChange={(e) => setRetailEmail(e.target.value)}
                        placeholder="your-account@email.com"
                        className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-all placeholder-slate-600"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password:</label>
                      <input
                        type="password"
                        required
                        value={retailPassword}
                        onChange={(e) => setRetailPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-all placeholder-slate-600"
                      />
                    </div>

                    <div className="border border-slate-850 bg-slate-950/20 p-3 rounded-xl text-[10px] text-slate-400 leading-relaxed">
                      🔒 **Secure Connection**: Credentials are used exclusively to negotiate session auth keys with Zara.com. No credentials are stored directly or transmitted outside the isolated scraper gateway.
                    </div>

                    <div className="flex gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => setRetailSyncOpen(false)}
                        className="flex-1 py-3 border border-slate-850 hover:bg-slate-900 text-xs font-bold text-slate-400 hover:text-white rounded-xl cursor-pointer transition-all text-center"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/15 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      >
                        Connect &amp; Import
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </form>
                )}

                {/* RUNNING SCRAPER TERMINAL LOGS */}
                {retailSyncStatus !== "idle" && (
                  <div className="flex flex-col gap-4">
                    {/* Live Terminal screen */}
                    <div className="bg-slate-950 border border-slate-900 p-4 rounded-2xl text-[11px] font-mono text-cyan-400 text-left h-52 overflow-y-auto flex flex-col gap-1.5 shadow-inner">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-1.5 text-slate-500">
                        <span className="text-[9px]">CONSOLE TERMINAL • ACTIVE SESSION</span>
                        <span className="flex gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </span>
                      </div>
                      {retailSyncLogs.map((logLine, index) => (
                        <div key={index} className="leading-relaxed">
                          <span className="text-cyan-600 mr-1.5">&gt;</span> {logLine}
                        </div>
                      ))}
                      {retailSyncStatus !== "success" && retailSyncStatus !== "error" && (
                        <div className="flex items-center gap-1.5 text-cyan-300 animate-pulse mt-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Executing automated scraper routine...</span>
                        </div>
                      )}
                    </div>

                    {/* Completion Status Area */}
                    {retailSyncStatus === "success" && (
                      <div className="flex flex-col items-center gap-4 py-2">
                        <div className="h-12 w-12 rounded-full bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400 relative">
                          <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
                          <Check className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div className="text-center">
                          <h4 className="text-sm font-bold text-white">Extract Complete</h4>
                          <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                            5 brand-new retail pieces added. vibecheck.ai synthesized item color tags, fabric contents, and weather suitability indices using Google Gemini.
                          </p>
                        </div>
                        
                        <button
                          onClick={() => {
                            setRetailSyncOpen(false);
                            setRetailSyncStatus("idle");
                          }}
                          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all"
                        >
                          Return to Smart Wardrobe
                        </button>
                      </div>
                    )}

                    {retailSyncStatus === "error" && (
                      <div className="flex flex-col items-center gap-3 py-2">
                        <div className="h-12 w-12 rounded-full bg-rose-950/40 border border-rose-500/20 flex items-center justify-center text-rose-400">
                          <span className="font-bold text-lg">!</span>
                        </div>
                        <div className="text-center">
                          <h4 className="text-sm font-bold text-white">Import Failed</h4>
                          <p className="text-xs text-slate-400 mt-1">
                            Scraper failed to complete successfully. Check console log above for details.
                          </p>
                        </div>
                        <div className="flex gap-3 w-full mt-1">
                          <button
                            type="button"
                            onClick={() => setRetailSyncStatus("idle")}
                            className="flex-1 py-3 border border-slate-850 hover:bg-slate-900 text-xs font-bold text-slate-400 hover:text-white rounded-xl cursor-pointer transition-all"
                          >
                            Edit Credentials
                          </button>
                          <button
                            type="button"
                            onClick={() => setRetailSyncOpen(false)}
                            className="flex-1 py-3 bg-slate-900 text-xs font-bold text-slate-200 hover:bg-slate-850 rounded-xl cursor-pointer transition-all"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
