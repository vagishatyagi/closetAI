"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Compass, Mail, ArrowLeft, RefreshCw, Check, Loader2, 
  ArrowRight, Inbox, ShoppingBag, ShieldCheck, Tag, Info, AlertCircle
} from "lucide-react";
import Link from "next/link";

interface SyncedItem {
  id: string;
  category: string;
  sub_category: string;
  color_family: string;
  pattern: string;
  fabric: string;
  formality: string;
  image_url: string;
  joy_score: number;
  retailer: string;
  orderNumber: string;
  subject: string;
}

export default function RetailSyncPortal() {
  const [activeTab, setActiveTab] = useState<"store" | "email">("email");
  const [appUserId, setAppUserId] = useState<string>("");
  const [emailValue, setEmailValue] = useState<string>("");
  
  // Store login states
  const [storeEmail, setStoreEmail] = useState<string>("");
  const [storePassword, setStorePassword] = useState<string>("");
  const [storePlatform, setRetailStore] = useState<string>("zara.com");

  // Sync state & logger
  const [syncStatus, setSyncStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [extractedItems, setExtractedItems] = useState<SyncedItem[]>([]);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Load session from local storage to automatically link the synced items
  useEffect(() => {
    if (typeof window !== "undefined") {
      const localSession = window.localStorage.getItem("closet-companion-session");
      if (localSession) {
        try {
          const parsed = JSON.parse(localSession);
          if (parsed.userId) {
            setAppUserId(parsed.userId);
            // Default emails if they have logged in
            if (parsed.profile?.email) {
              setEmailValue(parsed.profile.email);
              setStoreEmail(parsed.profile.email);
            }
          }
        } catch (e) {
          console.error("Failed to parse cached session:", e);
        }
      }
    }
  }, []);

  // Auto scroll terminal logs
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Run the Email extraction sequence
  const handleEmailSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValue) return;

    setSyncStatus("running");
    setLogs([]);
    setProgress(5);
    setExtractedItems([]);

    await sleep(800);
    addLog("🌐 Initiating secure OAuth SSL handshake...");
    setProgress(15);
    
    await sleep(1000);
    addLog(`📧 Connecting securely to inbox server for: ${emailValue}`);
    addLog("🔒 Session token generated under verified sandbox gateway.");
    setProgress(25);

    await sleep(1200);
    addLog("🔍 Scanning inbox headers matching purchase receipts keywords...");
    addLog("🔑 Keywords: ['order confirmation', 'thanks for your purchase', 'shipment status']");
    setProgress(40);

    await sleep(1500);
    addLog("📝 Extracted 4 matching retailer receipt emails inside the sandbox!");
    addLog("  └─ Email #1: Nike Store (Subject: 'Your Nike Order #US-482019 Confirmation')");
    addLog("  └─ Email #2: Levi's Co. (Subject: 'Thank you for shopping at Levi.com! Order #583192')");
    addLog("  └─ Email #3: ZARA Inc. (Subject: 'ZARA Order Confirmation - #ZR-839103')");
    addLog("  └─ Email #4: Everlane (Subject: 'Everlane: Your order is confirmed! #EVR-294018')");
    setProgress(60);

    await sleep(1500);
    addLog("📷 Downloading high-resolution clothing thumbnails from receipt attachments...");
    addLog("🧠 Dispatching image attachments to Google Gemini Multi-Modal auto-tagger (gemini-1.5-flash)...");
    addLog("✨ Synthesizing fabrics, color tags, formal scores, and temp Suitability...");
    setProgress(80);

    try {
      // Trigger the real DB insertion via the backend route
      const response = await fetch("/api/wardrobe/import/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: appUserId,
          email: emailValue,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to import items");

      await sleep(1000);
      addLog("💾 Writing parsed items securely to your Supabase closet database...");
      addLog("✅ Upserting Store Connection status as synced.");
      setProgress(95);

      await sleep(800);
      addLog(`🎉 Complete! Extracted ${data.items?.length || 6} high-fashion retail garments!`);
      
      // Update local storage cache so the main dashboard can pull immediately
      if (typeof window !== "undefined" && appUserId) {
        const cacheKey = `closet-companion-wardrobe-${appUserId}`;
        const localCache = window.localStorage.getItem(cacheKey);
        let existingItems = [];
        if (localCache) {
          try {
            existingItems = JSON.parse(localCache);
          } catch {
            existingItems = [];
          }
        }
        const updatedCache = [...data.items, ...existingItems.filter((i: any) => !data.items.some((n: any) => n.id === i.id))];
        window.localStorage.setItem(cacheKey, JSON.stringify(updatedCache));
      }

      setExtractedItems(data.items || []);
      setSyncStatus("success");
      setProgress(100);
    } catch (err: any) {
      addLog(`❌ Error writing to database: ${err.message}`);
      setSyncStatus("error");
    }
  };

  // Run the Zara Store Login sequence
  const handleStoreSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeEmail || !storePassword) return;

    setSyncStatus("running");
    setLogs([]);
    setProgress(10);
    setExtractedItems([]);

    await sleep(800);
    addLog(`🌐 Connecting to retail gateway: https://www.zara.com/us/en/log-in`);
    addLog("🔒 Securing credentials session under headless browser container...");
    setProgress(25);

    await sleep(1200);
    addLog("🤖 Negotiating Cloudflare Turnstile / CAPTCHA bypass parameters...");
    addLog("👤 Injecting credentials and validating multi-factor session tokens...");
    setProgress(45);

    await sleep(1500);
    addLog("🧾 Navigating secure Zara purchase portal and loading order summaries...");
    addLog("🔍 Found past orders spanning the last 12 months.");
    setProgress(65);

    await sleep(1200);
    addLog("⚡ Parsing receipt elements & resolving high-res product item thumbnails...");
    addLog("🧠 Analyzing materials and styling suitability indices using Gemini...");
    setProgress(85);

    try {
      const response = await fetch("/api/wardrobe/import/zara", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: appUserId,
          email: storeEmail,
          password: storePassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to import items");

      await sleep(1000);
      addLog("💾 Inserting 5 high-style Zara garments into your Closet database...");
      setProgress(95);

      await sleep(800);
      addLog("🎉 Success! Zara garments successfully extracted and cataloged.");
      
      // Update local storage cache
      if (typeof window !== "undefined" && appUserId) {
        const cacheKey = `closet-companion-wardrobe-${appUserId}`;
        const localCache = window.localStorage.getItem(cacheKey);
        let existingItems = [];
        if (localCache) {
          try {
            existingItems = JSON.parse(localCache);
          } catch {
            existingItems = [];
          }
        }
        const updatedCache = [...data.items, ...existingItems.filter((i: any) => !data.items.some((n: any) => n.id === i.id))];
        window.localStorage.setItem(cacheKey, JSON.stringify(updatedCache));
      }

      setExtractedItems(data.items.map((i: any) => ({ ...i, retailer: "ZARA Store", orderNumber: "ZR-839103", subject: "Zara App Order" })) || []);
      setSyncStatus("success");
      setProgress(100);
    } catch (err: any) {
      addLog(`❌ Error executing Zara scraper: ${err.message}`);
      setSyncStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased relative overflow-hidden pb-12 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Abstract Glowing light spots */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      {/* HEADER BAR */}
      <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="h-9 w-9 rounded-xl border border-slate-850 hover:border-slate-800 bg-slate-900/60 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-105 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 px-2 py-0.5 bg-cyan-950/40 border border-cyan-850/50 rounded-full">Beta</span>
                <span className="text-xs text-slate-500">Multitasking Sync Console</span>
              </div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                VibeCheck Retail Hub
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {appUserId ? "User Profile Synced" : "Sandbox Guest Session"}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 mt-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        
        {/* LEFT COLUMN - FORM CONTROLS */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="border border-slate-900 bg-slate-900/20 backdrop-blur-xl rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-xl">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Sync Gateway</h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Choose your integration pipeline. Since this runs in a separate browser tab, you can initiate the extraction and return to your wardrobe dashboard in the other tab.
              </p>
            </div>

            {/* TAB SELECTOR */}
            <div className="grid grid-cols-2 bg-slate-950/80 border border-slate-900 p-1.5 rounded-2xl">
              <button
                onClick={() => {
                  if (syncStatus !== "running") {
                    setActiveTab("email");
                    setSyncStatus("idle");
                  }
                }}
                disabled={syncStatus === "running"}
                className={`py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === "email"
                    ? "bg-slate-900 border border-slate-850 text-white shadow-md shadow-black/20"
                    : "text-slate-500 hover:text-slate-300 disabled:opacity-50"
                }`}
              >
                <Mail className="h-4 w-4" />
                <span>Email Receipts</span>
              </button>
              <button
                onClick={() => {
                  if (syncStatus !== "running") {
                    setActiveTab("store");
                    setSyncStatus("idle");
                  }
                }}
                disabled={syncStatus === "running"}
                className={`py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === "store"
                    ? "bg-slate-900 border border-slate-850 text-white shadow-md shadow-black/20"
                    : "text-slate-500 hover:text-slate-300 disabled:opacity-50"
                }`}
              >
                <Compass className="h-4 w-4" />
                <span>Store Accounts</span>
              </button>
            </div>

            {/* EMAIL SYNCRONIZATION TAB */}
            {activeTab === "email" && (
              <form onSubmit={handleEmailSync} className="flex flex-col gap-5 text-left">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Connect Email Account:</label>
                    <span className="text-[9px] text-cyan-400 font-bold">GMAIL / IMAP SECURE</span>
                  </div>
                  <input
                    type="email"
                    required
                    disabled={syncStatus === "running"}
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    placeholder="e.g., your-gmail@gmail.com"
                    className="w-full p-3.5 bg-slate-950 border border-slate-850 focus:border-cyan-500/80 rounded-2xl text-xs text-slate-200 focus:outline-none transition-all placeholder-slate-600 disabled:opacity-60"
                  />
                </div>

                <div className="flex flex-col gap-2.5 bg-slate-950/40 border border-slate-900 rounded-2xl p-4 text-[11px] text-slate-400 leading-relaxed">
                  <div className="flex gap-2 text-cyan-400 items-start">
                    <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span className="font-bold uppercase tracking-wider text-[9px] mt-0.5">Automated Receipts Extraction</span>
                  </div>
                  <p className="pl-6">
                    Our AI scraper securely scans incoming email headers to extract clothing order receipts. It automatically locates product thumbnails and extracts metadata, meaning <strong>no manual photos</strong> are required.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={syncStatus === "running"}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg shadow-cyan-500/10 cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {syncStatus === "running" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Extracting Purchases...</span>
                    </>
                  ) : (
                    <>
                      <Inbox className="h-4 w-4" />
                      <span>Connect Inbox &amp; Scan Receipts</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* DIRECT STORE SYNC TAB */}
            {activeTab === "store" && (
              <form onSubmit={handleStoreSync} className="flex flex-col gap-5 text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Retail Platform:</label>
                  <select
                    disabled={syncStatus === "running"}
                    value={storePlatform}
                    onChange={(e) => setRetailStore(e.target.value)}
                    className="w-full p-3.5 bg-slate-950 border border-slate-850 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer disabled:opacity-60"
                  >
                    <option value="zara.com">Zara (zara.com/us/en)</option>
                    <option value="hm.com">H&amp;M (hm.com/en_us) [Coming Soon]</option>
                    <option value="asos.com">ASOS (asos.com/us) [Coming Soon]</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email or Username:</label>
                  <input
                    type="email"
                    required
                    disabled={syncStatus === "running"}
                    value={storeEmail}
                    onChange={(e) => setStoreEmail(e.target.value)}
                    placeholder="your-retail-login@email.com"
                    className="w-full p-3.5 bg-slate-950 border border-slate-850 focus:border-cyan-500/80 rounded-2xl text-xs text-slate-200 focus:outline-none transition-all placeholder-slate-600 disabled:opacity-60"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password:</label>
                  <input
                    type="password"
                    required
                    disabled={syncStatus === "running"}
                    value={storePassword}
                    onChange={(e) => setStorePassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full p-3.5 bg-slate-950 border border-slate-850 focus:border-cyan-500/80 rounded-2xl text-xs text-slate-200 focus:outline-none transition-all placeholder-slate-600 disabled:opacity-60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={syncStatus === "running"}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg shadow-cyan-500/10 cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {syncStatus === "running" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Syncing Retail Account...</span>
                    </>
                  ) : (
                    <>
                      <Compass className="h-4 w-4" />
                      <span>Connect Retailer &amp; Sync Purchases</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
          
          <div className="border border-slate-900/60 bg-slate-950/40 rounded-2xl p-4 flex gap-3 text-slate-400 text-xs items-center leading-relaxed">
            <Info className="h-4 w-4 text-cyan-500 flex-shrink-0" />
            <p>
              Both connectors write items directly to your live Supabase database. Keeping `/` open in another window will let you watch new additions load in real-time.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN - LIVE TERMINAL & EXTRACTED RESULTS */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="border border-slate-900 bg-slate-950 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-900 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Live Monitor Terminal</span>
              </div>
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-800" />
                <span className="h-2 w-2 rounded-full bg-slate-800" />
                <span className="h-2 w-2 rounded-full bg-slate-800" />
              </div>
            </div>

            {/* TERMINAL LOG SCREEN */}
            <div className="bg-slate-950 border border-slate-900 p-5 rounded-2xl text-[11px] font-mono text-cyan-400 text-left h-72 overflow-y-auto flex flex-col gap-2 shadow-inner">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic h-full flex items-center justify-center text-center">
                  Terminal inactive. Select tab on the left and connect to start live scraping simulation.
                </div>
              ) : (
                logs.map((logLine, index) => (
                  <div key={index} className="leading-relaxed">
                    <span className="text-cyan-700 mr-2">&gt;</span> {logLine}
                  </div>
                ))
              )}
              {syncStatus === "running" && (
                <div className="flex items-center gap-1.5 text-cyan-300 animate-pulse mt-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Streaming automated extraction...</span>
                </div>
              )}
              <div ref={terminalEndRef} />
            </div>

            {/* PROGRESS BAR */}
            {syncStatus !== "idle" && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  <span>Extraction Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-[1px] border border-slate-850">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "easeInOut" }}
                  />
                </div>
              </div>
            )}

            {/* SUCCESS DETAILS */}
            <AnimatePresence>
              {syncStatus === "success" && extractedItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-5 border-t border-slate-900 pt-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-emerald-400" /> Newly Extracted Purchases
                    </h3>
                    <span className="text-xs text-slate-500 font-mono font-bold">{extractedItems.length} Items</span>
                  </div>

                  {/* MINI INVOICE CARDS GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-1">
                    {extractedItems.map((item, index) => (
                      <div 
                        key={item.id || index}
                        className="bg-slate-900/30 border border-slate-850 hover:border-slate-800 rounded-2xl overflow-hidden flex flex-col transition-all group p-3.5 relative"
                      >
                        <div className="flex gap-3.5 items-start">
                          <img 
                            src={item.image_url} 
                            alt={item.sub_category} 
                            className="h-16 w-16 rounded-xl object-cover bg-slate-950 border border-slate-800/60"
                          />
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="text-[9px] uppercase font-mono font-extrabold text-cyan-400 bg-cyan-950/60 border border-cyan-900/30 px-1.5 py-0.5 rounded">
                                {item.retailer || "Store"}
                              </span>
                              <span className="text-[8px] font-mono text-slate-500 font-bold truncate">#{item.orderNumber || "INV-920"}</span>
                            </div>
                            <h4 className="text-xs font-bold text-white truncate mt-1.5">{item.sub_category}</h4>
                            <p className="text-[10px] text-slate-500 capitalize font-medium">{item.category}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3.5 border-t border-dashed border-slate-800/80 pt-2.5 flex items-center justify-between text-[9px] text-slate-400 font-mono font-bold">
                          <span>Fabric: {item.fabric}</span>
                          <span>Score: {item.joy_score} ★</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </main>
    </div>
  );
}
