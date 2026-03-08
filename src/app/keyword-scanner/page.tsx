"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { useScan } from "@/lib/use-scan";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "fcfs" | "launch" | "airdrop" | "whitelist" | "alpha" | "custom";

interface Keyword {
  id: string;
  term: string;
  category: Category;
  active: boolean;
}

const CATEGORY_COLORS: Record<Category, "danger" | "warning" | "info" | "success" | "default" | "muted"> = {
  fcfs: "danger",
  launch: "warning",
  airdrop: "info",
  whitelist: "success",
  alpha: "default",
  custom: "muted",
};

const DEFAULT_KEYWORDS: Keyword[] = [
  { id: "k1", term: "FCFS", category: "fcfs", active: true },
  { id: "k2", term: "first come first serve", category: "fcfs", active: true },
  { id: "k3", term: "whitelist open", category: "whitelist", active: true },
  { id: "k4", term: "airdrop live", category: "airdrop", active: true },
  { id: "k5", term: "mint now", category: "launch", active: true },
  { id: "k6", term: "presale", category: "launch", active: true },
  { id: "k7", term: "alpha call", category: "alpha", active: true },
  { id: "k8", term: "stealth launch", category: "launch", active: true },
  { id: "k9", term: "free mint", category: "airdrop", active: true },
  { id: "k10", term: "WL spots", category: "whitelist", active: true },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KeywordScannerPage() {
  const [keywords, setKeywords] = useState<Keyword[]>(DEFAULT_KEYWORDS);
  const [newTerm, setNewTerm] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("custom");

  const activeTerms = useMemo(
    () => keywords.filter((k) => k.active).map((k) => k.term),
    [keywords]
  );

  const { data, loading, error, lastScan, refresh } = useScan({
    keywords: activeTerms,
    pollMs: 60_000,
  });

  // Compute live hit counts from real scan results
  const hitCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!data) return counts;
    for (const tweet of data.results) {
      for (const kw of tweet.matched_keywords) {
        counts[kw.toLowerCase()] = (counts[kw.toLowerCase()] ?? 0) + 1;
      }
    }
    return counts;
  }, [data]);

  const getHits = (term: string) => hitCounts[term.toLowerCase()] ?? 0;

  const toggleKeyword = (id: string) => {
    setKeywords((prev) =>
      prev.map((k) => (k.id === id ? { ...k, active: !k.active } : k))
    );
  };

  const removeKeyword = (id: string) => {
    setKeywords((prev) => prev.filter((k) => k.id !== id));
  };

  const addKeyword = () => {
    if (!newTerm.trim()) return;
    const kw: Keyword = {
      id: `k${Date.now()}`,
      term: newTerm.trim(),
      category: newCategory,
      active: true,
    };
    setKeywords((prev) => [...prev, kw]);
    setNewTerm("");
  };

  const activeCount = keywords.filter((k) => k.active).length;
  const totalHits = keywords.reduce((sum, k) => sum + getHits(k.term), 0);

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              🔍 Keyword Scanner
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Configure keywords — hit counts are live from the last Nitter scan
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-lg text-xs transition-colors disabled:opacity-40"
          >
            {loading ? "Scanning…" : "↻ Refresh"}
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm font-medium">Backend not reachable</p>
            <p className="text-red-300/60 text-xs mt-0.5">{error}</p>
            <p className="text-white/30 text-xs mt-1">
              Start it:{" "}
              <code className="text-white/50">cd backend && python run.py</code>
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">{keywords.length}</p>
            <p className="text-white/40 text-xs mt-1">Total Keywords</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">{activeCount}</p>
            <p className="text-white/40 text-xs mt-1">Active</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className={`text-3xl font-bold ${loading ? "text-white/30 animate-pulse" : "text-amber-400"}`}>
              {loading ? "…" : totalHits.toLocaleString()}
            </p>
            <p className="text-white/40 text-xs mt-1">
              Live Hits {lastScan ? `(${lastScan.toLocaleTimeString()})` : ""}
            </p>
          </div>
        </div>

        {/* Add Keyword */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Add New Keyword</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addKeyword()}
              placeholder="Enter keyword or phrase..."
              className="flex-1 bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/8"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as Category)}
              className="bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
            >
              <option value="fcfs" className="bg-[#0d1120]">FCFS</option>
              <option value="launch" className="bg-[#0d1120]">Launch</option>
              <option value="airdrop" className="bg-[#0d1120]">Airdrop</option>
              <option value="whitelist" className="bg-[#0d1120]">Whitelist</option>
              <option value="alpha" className="bg-[#0d1120]">Alpha</option>
              <option value="custom" className="bg-[#0d1120]">Custom</option>
            </select>
            <button
              onClick={addKeyword}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Keywords Table */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-white font-semibold">Keyword List</h2>
            <span className="text-white/40 text-sm">{keywords.length} keywords</span>
          </div>
          <div className="divide-y divide-white/5">
            {keywords.map((kw) => {
              const hits = getHits(kw.term);
              return (
                <div
                  key={kw.id}
                  className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
                    kw.active ? "hover:bg-white/3" : "opacity-50 hover:bg-white/3"
                  }`}
                >
                  {/* Toggle */}
                  <button
                    onClick={() => toggleKeyword(kw.id)}
                    className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 relative ${
                      kw.active ? "bg-blue-500" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                        kw.active ? "left-5" : "left-0.5"
                      }`}
                    />
                  </button>

                  {/* Term */}
                  <span className="flex-1 text-white text-sm font-mono">{kw.term}</span>

                  {/* Category */}
                  <Badge variant={CATEGORY_COLORS[kw.category]}>
                    {kw.category.toUpperCase()}
                  </Badge>

                  {/* Live Hits */}
                  <div className="text-right w-28">
                    {loading ? (
                      <span className="text-white/20 text-xs animate-pulse">scanning…</span>
                    ) : (
                      <>
                        <span className={`text-sm font-medium ${hits > 0 ? "text-amber-400" : "text-white/20"}`}>
                          {hits.toLocaleString()}
                        </span>
                        <span className="text-white/30 text-xs ml-1">hits</span>
                      </>
                    )}
                  </div>

                  {/* Status */}
                  <Badge variant={kw.active ? "success" : "muted"}>
                    {kw.active ? "Active" : "Paused"}
                  </Badge>

                  {/* Delete */}
                  <button
                    onClick={() => removeKeyword(kw.id)}
                    className="text-white/20 hover:text-red-400 transition-colors text-sm ml-2"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Legend */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">Category Guide</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { cat: "fcfs" as Category, desc: "First Come First Serve signals — highest priority" },
              { cat: "launch" as Category, desc: "Token/NFT launch events (mint, presale, stealth)" },
              { cat: "airdrop" as Category, desc: "Free token distribution events" },
              { cat: "whitelist" as Category, desc: "Whitelist / allowlist openings" },
              { cat: "alpha" as Category, desc: "Alpha calls and insider tips" },
              { cat: "custom" as Category, desc: "User-defined custom keywords" },
            ].map(({ cat, desc }) => (
              <div key={cat} className="flex items-start gap-2">
                <Badge variant={CATEGORY_COLORS[cat]}>{cat.toUpperCase()}</Badge>
                <p className="text-white/40 text-xs mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
