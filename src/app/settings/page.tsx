"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";

export default function SettingsPage() {
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [discordWebhook, setDiscordWebhook] = useState("");
  const [scanInterval, setScanInterval] = useState(30);
  const [minScore, setMinScore] = useState(70);
  const [twitterBearerToken, setTwitterBearerToken] = useState("");

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            ⚙️ Settings
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Configure API keys, scan intervals, and notification channels
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Twitter API */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
              🐦 Twitter API
            </h2>
            <p className="text-white/40 text-xs mb-4">Required for tweet collection and scanning</p>
            <div className="space-y-3">
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">
                  Bearer Token
                </label>
                <input
                  type="password"
                  value={twitterBearerToken}
                  onChange={(e) => setTwitterBearerToken(e.target.value)}
                  placeholder="AAAA..."
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-blue-500/50 font-mono"
                />
              </div>
              <div className="flex items-center gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                <span className="text-amber-400">⚠️</span>
                <p className="text-amber-300/70 text-xs">
                  Requires Twitter API v2 access. Basic tier supports 500K tweets/month.
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
              { label: "Twitter API", value: "Not Connected", badge: "warning" as const },
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
