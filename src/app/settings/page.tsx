"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";

interface InstanceHealth {
  [url: string]: boolean;
}

interface HealthData {
  status: string;
  instances: InstanceHealth;
  healthy_count: number;
  total_count: number;
}

export default function SettingsPage() {
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [discordWebhook, setDiscordWebhook] = useState("");
  const [scanInterval, setScanInterval] = useState(30);
  const [minScore, setMinScore] = useState(70);
  const [backendUrl, setBackendUrl] = useState("http://localhost:8000");

  // Nitter instance health
  const [health, setHealth] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  const checkHealth = async () => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      const res = await fetch("/api/scraper/health");
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const data: HealthData = await res.json();
      setHealth(data);
    } catch (e) {
      setHealthError(e instanceof Error ? e.message : "Unknown error");
      setHealth(null);
    } finally {
      setHealthLoading(false);
    }
  };

  // Auto-check health on mount
  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            ⚙️ Settings
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Configure the Nitter scraper, scan intervals, and notification channels
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Nitter Scraper Backend */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
              🕷️ Nitter Scraper Backend
            </h2>
            <p className="text-white/40 text-xs mb-4">
              Zero-cost Twitter scraping — no API key required
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">
                  Backend URL
                </label>
                <input
                  type="text"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-blue-500/50 font-mono"
                />
              </div>

              <button
                onClick={checkHealth}
                disabled={healthLoading}
                className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {healthLoading ? "Checking..." : "Check Nitter Instances"}
              </button>

              {/* Health error */}
              {healthError && (
                <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-xs font-medium mb-1">Backend not reachable</p>
                  <p className="text-red-300/60 text-xs">{healthError}</p>
                  <p className="text-white/30 text-xs mt-2">
                    Start it: <code className="text-white/50">cd backend && python run.py</code>
                  </p>
                </div>
              )}

              {/* Health results */}
              {health && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-xs">
                      {health.healthy_count}/{health.total_count} instances alive
                    </span>
                    <Badge variant={health.healthy_count > 0 ? "success" : "danger"}>
                      {health.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {Object.entries(health.instances).map(([url, alive]) => (
                      <div key={url} className="flex items-center gap-2 text-xs">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${alive ? "bg-emerald-400" : "bg-red-400"}`} />
                        <span className={`font-mono truncate ${alive ? "text-white/60" : "text-white/25"}`}>
                          {url.replace("https://", "")}
                        </span>
                        <span className={`ml-auto flex-shrink-0 ${alive ? "text-emerald-400" : "text-red-400/60"}`}>
                          {alive ? "✓" : "✗"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info box */}
              <div className="flex items-start gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <span className="text-blue-400 mt-0.5">ℹ️</span>
                <p className="text-blue-300/70 text-xs">
                  Nitter scrapes public Twitter data for free. Run the Python backend locally:{" "}
                  <code className="text-blue-200/60">cd backend && pip install -r requirements.txt && python run.py</code>
                </p>
              </div>
            </div>
          </div>

          {/* Scan Settings */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
              🔍 Scan Settings
            </h2>
            <p className="text-white/40 text-xs mb-4">Control how often and what to scan</p>
            <div className="space-y-4">
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">
                  Scan Interval (seconds)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={10}
                    max={300}
                    step={10}
                    value={scanInterval}
                    onChange={(e) => setScanInterval(Number(e.target.value))}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="text-white font-mono text-sm w-12 text-right">{scanInterval}s</span>
                </div>
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">
                  Minimum Alert Score (0–100)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="text-white font-mono text-sm w-12 text-right">{minScore}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Telegram */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
              ✈️ Telegram Bot
            </h2>
            <p className="text-white/40 text-xs mb-4">Send alerts to a Telegram channel or group</p>
            <div className="space-y-3">
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">
                  Bot Token
                </label>
                <input
                  type="password"
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  placeholder="1234567890:AAF..."
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-blue-500/50 font-mono"
                />
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">
                  Chat ID
                </label>
                <input
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="-100123456789"
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-blue-500/50 font-mono"
                />
              </div>
              <button className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 rounded-lg text-sm transition-colors">
                Test Connection
              </button>
            </div>
          </div>

          {/* Discord */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
              💬 Discord Webhook
            </h2>
            <p className="text-white/40 text-xs mb-4">Send alerts to a Discord channel via webhook</p>
            <div className="space-y-3">
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">
                  Webhook URL
                </label>
                <input
                  type="password"
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-blue-500/50 font-mono"
                />
              </div>
              <button className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-lg text-sm transition-colors">
                Test Connection
              </button>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">System Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Version", value: "1.0.0", badge: "success" as const },
              { label: "Pipeline Status", value: "Active", badge: "success" as const },
              {
                label: "Data Source",
                value: "Nitter (Free)",
                badge: "info" as const,
              },
              { label: "Alert Channels", value: "2 Active", badge: "info" as const },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 rounded-lg p-3">
                <p className="text-white/40 text-xs mb-1">{item.label}</p>
                <Badge variant={item.badge}>{item.value}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </AppShell>
  );
}
