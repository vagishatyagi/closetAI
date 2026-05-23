"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, Cloud, Sparkles, Filter, CheckCircle2, Loader2, 
  Trash2, Sun, Calendar, Mail, Heart, RefreshCw, ShoppingBag 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// Mock Closet Items to make the UI look rich and functional out-of-the-box
const MOCK_WARDROBE = [
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

export default function Dashboard() {
  const [items, setItems] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [uploadStatus, setUploadStatus] = useState<string>(""); // "", "uploading", "tagging", "embeddings", "complete"
  const [taggingResult, setTaggingResult] = useState<any>(null);
  
  // Interactive Daily OOTD Pitch Simulator States
  const [ootdScenario, setOotdScenario] = useState<string>("business-rain");
  const [ootdResult, setOotdResult] = useState<any>(null);
  const [isGeneratingOOTD, setIsGeneratingOOTD] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [likedOOTD, setLikedOOTD] = useState<boolean | null>(null);

  // Fetch clothing from Supabase on mount
  useEffect(() => {
    fetchClosetItems();
  }, []);

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
        // Use Mock data if database is empty
        setItems(MOCK_WARDROBE);
      }
    } catch (err) {
      console.error("Failed to fetch wardrobe:", err);
      setItems(MOCK_WARDROBE);
    }
  };

  // Auto-Tagging File Ingestion Routine
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setTaggingResult(null);
      setUploadStatus("uploading");

      // Step 1: Upload to Supabase Storage
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

      // Step 2: Auto-Tag and Embed via Gemini
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

      // Add freshly cataloged item to the UI grid
      setItems(prev => [tagData.item, ...prev]);

      // Hide status popup after a few seconds
      setTimeout(() => setUploadStatus(""), 4000);
    } catch (err: any) {
      console.error("Ingestion failed:", err);
      setUploadStatus("");
      alert(err.message || "An error occurred during AI analysis.");
    }
  };

  // Mock-Simulating the OOTD reasoning output from Gemini 3.1 Pro
  const simulateOOTD = () => {
    setIsGeneratingOOTD(true);
    setLikedOOTD(null);

    // Simulate model thinking delay
    setTimeout(() => {
      let result = null;
      if (ootdScenario === "business-rain") {
        result = {
          scenario: "Corporate Pitch & Heavy Rain Expected",
          weather: "50°F • Rain (85% risk) • Tense Wind",
          schedule: "10:00 AM - Vercel Hackathon Showcase Pitch",
          items: ["m6", "m3", "m1"], // Blazer, Chinos, Trench Coat
          reasoning: "To dominate your Vercel Showcase Pitch in 50°F weather with active rainfall, we layered the Forest Green Tweed Blazer over your trousers for a sharp, boardroom-ready presence. The precipitation-resistant Gabardine Beige Trench Coat provides elegant outer protection to keep your professional layers dry on the commute."
        };
      } else if (ootdScenario === "casual-sunny") {
        result = {
          scenario: "Sunday Brunch & Bright Sun",
          weather: "72°F • Sunny (0% rain) • Clear UV",
          schedule: "11:30 AM - Outdoor Team Brunch Celebration",
          items: ["m5", "m3"], // Linen Shirt, Chinos
          reasoning: "With a warm, sunny high of 72°F, we combined your White Linen Shirt with the Navy Cotton Chinos. Linen offers excellent breathability for outdoor seating, creating a relaxed yet impeccably preppy aesthetic that matches the team celebration vibe."
        };
      } else {
        result = {
          scenario: "Cozy Study Session & Chilly Evening",
          weather: "38°F • Chilly Breeze • Clear Sky",
          schedule: "5:00 PM - Evening Technical Writing in Library",
          items: ["m2", "m3", "m4"], // Knit Sweater, Chinos, Chelsea Boots
          reasoning: "For a chilly 38°F evening at the library, the Merino Wool Charcoal Sweater provides heavy warmth and texturing. Parir it with Cotton Chinos and Suede Chelsea Boots to stay thermal-insulated, smart-casual, and comfortable for extended writing sessions."
        };
      }

      setOotdResult(result);
      setSelectedItems(result.items);
      setIsGeneratingOOTD(false);
    }, 1500);
  };

  // Trigger default simulation on first load
  useEffect(() => {
    simulateOOTD();
  }, [ootdScenario]);

  // Clean-up Closet item
  const handleDeleteItem = async (id: string) => {
    if (id.startsWith("m")) {
      // For mock items, just remove from UI state
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

  // Filter closet items by active category
  const filteredItems = activeCategory === "All"
    ? items
    : items.filter(item => item.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white pb-16">
      {/* Premium Gradient Background Blur */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-purple-900/20 via-indigo-900/10 to-transparent pointer-events-none blur-3xl z-0" />
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-emerald-500/5 rounded-full pointer-events-none blur-3xl z-0" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-800/80 backdrop-blur-md bg-slate-950/60 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              ThreadCraft AI
            </h1>
            <p className="text-[10px] text-purple-400 uppercase tracking-widest font-semibold">
              Pureple Supercharged
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <a
            href="#tryon"
            className="hidden md:flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900 transition-all text-slate-300"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-purple-400" />
            Budget Store Recommendations
          </a>
          <div className="text-xs bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5 font-medium flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-400">Hackathon Tier 3 Active</span>
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10 z-10 flex-1">
        
        {/* Left Column: Closet Grid & Tagging Panel (8 cols) */}
        <section className="lg:col-span-8 flex flex-col gap-8">
          
          {/* AI INGESTION PANEL */}
          <div className="relative border border-slate-800 bg-slate-900/40 backdrop-blur-xl rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center shadow-xl shadow-black/40 overflow-hidden">
            {/* Glowing Accent Border */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-indigo-500" />

            <div className="flex flex-col gap-2 flex-1 text-center md:text-left">
              <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 flex items-center gap-1.5 justify-center md:justify-start">
                <Sparkles className="h-3 w-3 text-purple-400" /> Gemini Auto-Tagger Ingestion
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Upload Apparel Photo
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
              <div className="flex flex-wrap gap-1.5 bg-slate-950 border border-slate-900 p-1.2 rounded-xl">
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
                          {item.precipitation_resistant && (
                            <span className="text-[9px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 rounded px-1.5 py-0.5">
                              Waterproof
                            </span>
                          )}
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
          
          {/* PITCH/SANDBOX OOTD INTERACTIVE PLANNER */}
          <div className="border border-slate-800 bg-slate-900/20 backdrop-blur-xl rounded-2xl p-6 flex flex-col gap-6 shadow-xl shadow-black/30 relative overflow-hidden">
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
                  { id: "casual-sunny", label: "Team Outdoor Brunch (Sunny, 72°F)", icon: Sun },
                  { id: "study-cold", label: "Writing Session (Chilly, 38°F)", icon: Clock }
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
                      Curated Pairing
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

            {/* Email Dispatch button for simulation demo */}
            <button
              onClick={() => alert("Daily Styling Newsletter successfully compiled using React Email and sent via Resend API to user's registered inbox!")}
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white transition-all shadow-lg shadow-purple-500/10 cursor-pointer"
            >
              <Mail className="h-4 w-4" />
              Simulate Email Dispatch (Resend API)
            </button>
          </div>

          {/* VIRTUAL TRY-ON & RECOMMENDATION BOARD MOCKUP */}
          <div id="tryon" className="border border-slate-800 bg-slate-900/20 backdrop-blur-xl rounded-2xl p-6 flex flex-col gap-6 shadow-xl shadow-black/30 relative">
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
                Store items under budget cap
              </span>
              
              <div className="flex flex-col gap-2.5">
                {[
                  {
                    id: "s1",
                    store: "Zara",
                    title: "Textured Linen Trousers",
                    price: "$49.90",
                    originalPrice: "$69.90",
                    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=200&auto=format&fit=crop&q=60",
                    score: "94%"
                  },
                  {
                    id: "s2",
                    store: "Uniqlo",
                    title: "Ultra Light Quilted Parka",
                    price: "$79.90",
                    originalPrice: "$99.90",
                    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=200&auto=format&fit=crop&q=60",
                    score: "89%"
                  }
                ].map(shopItem => (
                  <div key={shopItem.id} className="flex gap-4 p-3 rounded-xl bg-slate-950 border border-slate-900 hover:border-slate-800 transition-all items-center">
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
                        onClick={() => alert("Imagen Inpainting call triggered: Masking avatar legs/torso and generating high-fidelity virtual outfit try-on preview!")}
                        className="text-[9px] font-bold text-slate-300 hover:text-white px-2 py-1 bg-purple-600 hover:bg-purple-500 rounded-md transition-all shadow"
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

// Custom simple Lucide icons mapping that might be missing
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
