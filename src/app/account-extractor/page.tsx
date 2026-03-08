"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import type { ProjectAccount } from "@/lib/types";

const CATEGORY_COLORS: Record<string, "danger" | "warning" | "info" | "success" | "default" | "muted"> = {
  DeFi: "info",
  NFT: "warning",
  Airdrop: "success",
  GameFi: "default",
  Layer2: "danger",
  Other: "muted",
};

export default function AccountExtractorPage() {
  const [projects, setProjects] = useState<ProjectAccount[]>(MOCK_PROJECTS);
  const [search, setSearch] = useState("");

  const toggleTrack = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, tracked: !p.tracked } : p))
    );
  };

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.handle.toLowerCase().includes(search.toLowerCase())
  );

  const trackedCount = projects.filter((p) => p.tracked).length;

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            👤 Project Account Extractor
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Automatically extracts and tracks project Twitter accounts from FCFS signals
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">{projects.length}</p>
            <p className="text-white/40 text-xs mt-1">Projects Extracted</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">{trackedCount}</p>
            <p className="text-white/40 text-xs mt-1">Being Tracked</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-amber-400">
              {projects.filter((p) => p.verified).length}
            </p>
            <p className="text-white/40 text-xs mt-1">Verified Accounts</p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">
          <h2 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
            <span>ℹ️</span> How Account Extraction Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "1", title: "FCFS Signal", desc: "A high-confidence FCFS signal is detected" },
              { step: "2", title: "Parse Tweet", desc: "Extract @mentions, $tickers, and URLs" },
              { step: "3", title: "Identify Project", desc: "Match against known project patterns" },
              { step: "4", title: "Add to Tracker", desc: "Auto-add to watchlist for monitoring" },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{s.title}</p>
                  <p className="text-white/40 text-xs mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name or handle..."
            className="flex-1 bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-500/50"
          />
        </div>

        {/* Projects Table */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-white font-semibold">Extracted Projects</h2>
            <span className="text-white/40 text-sm">{filtered.length} projects</span>
          </div>
          <div className="divide-y divide-white/5">
            {filtered.map((project) => (
              <div key={project.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {project.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">{project.name}</span>
                    {project.verified && (
                      <span className="text-blue-400 text-xs">✓</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-white/40 text-xs">{project.handle}</span>
                    <span className="text-white/20 text-xs">·</span>
                    <span className="text-white/30 text-xs">Added {project.addedAt}</span>
                  </div>
                </div>

                {/* Category */}
                <Badge variant={CATEGORY_COLORS[project.category] ?? "muted"}>
                  {project.category}
                </Badge>

                {/* Followers */}
                <div className="text-right w-28">
                  <span className="text-white/60 text-sm">{project.followers.toLocaleString()}</span>
                  <p className="text-white/30 text-xs">followers</p>
                </div>

                {/* Source */}
                <div className="text-right w-24">
                  <span className="text-white/30 text-xs">from tweet</span>
                  <p className="text-white/50 text-xs font-mono">#{project.extractedFrom}</p>
                </div>

                {/* Track toggle */}
                <button
                  onClick={() => toggleTrack(project.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    project.tracked
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {project.tracked ? "✓ Tracking" : "+ Track"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Extraction Patterns */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Extraction Patterns</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: "@",
                title: "@Mentions",
                desc: "Extracts @handles from tweet text and identifies project accounts",
                example: "@nova_protocol",
              },
              {
                icon: "$",
                title: "$Tickers",
                desc: "Detects token tickers and maps to known project accounts",
                example: "$NOVA → @nova_protocol",
              },
              {
                icon: "🔗",
                title: "URLs",
                desc: "Extracts project website URLs and resolves to Twitter accounts",
                example: "nova.io → @nova_protocol",
              },
            ].map((p) => (
              <div key={p.title} className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl mb-2">{p.icon}</div>
                <p className="text-white font-medium text-sm">{p.title}</p>
                <p className="text-white/40 text-xs mt-1">{p.desc}</p>
                <p className="text-blue-400 text-xs font-mono mt-2">{p.example}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
