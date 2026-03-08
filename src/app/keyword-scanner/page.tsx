"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { MOCK_KEYWORDS } from "@/lib/mock-data";
import type { Keyword } from "@/lib/types";

const CATEGORY_COLORS: Record<string, "danger" | "warning" | "info" | "success" | "default" | "muted"> = {
  fcfs: "danger",
  launch: "warning",
  airdrop: "info",
  whitelist: "success",
  alpha: "default",
  custom: "muted",
};

export default function KeywordScannerPage() {
  const [keywords, setKeywords] = useState<Keyword[]>(MOCK_KEYWORDS);
  const [newTerm, setNewTerm] = useState("");
  const [newCategory, setNewCategory] = useState<Keyword["category"]>("custom");

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
      hits: 0,
    };
    setKeywords((prev) => [...prev, kw]);
    setNewTerm("");
  };

  const activeCount = keywords.filter((k) => k.active).length;
  const totalHits = keywords.reduce((sum, k) => sum + k.hits, 0);

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            🔍 Keyword Scanner
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Configure keywords to scan Twitter for crypto alpha signals
          </p>
        </div>

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
            <p className="text-3xl font-bold text-amber-400">{totalHits.toLocaleString()}</p>
            <p className="text-white/40 text-xs mt-1">Total Hits</p>
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
              onChange={(e) => setNewCategory(e.target.value as Keyword["category"])}
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
            {keywords.map((kw) => (
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

                {/* Hits */}
                <div className="text-right w-24">
                  <span className="text-amber-400 text-sm font-medium">{kw.hits.toLocaleString()}</span>
                  <span className="text-white/30 text-xs ml-1">hits</span>
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
            ))}
          </div>
        </div>

        {/* Category Legend */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">Category Guide</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { cat: "fcfs", desc: "First Come First Serve signals — highest priority" },
              { cat: "launch", desc: "Token/NFT launch events (mint, presale, stealth)" },
              { cat: "airdrop", desc: "Free token distribution events" },
              { cat: "whitelist", desc: "Whitelist / allowlist openings" },
              { cat: "alpha", desc: "Alpha calls and insider tips" },
              { cat: "custom", desc: "User-defined custom keywords" },
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
