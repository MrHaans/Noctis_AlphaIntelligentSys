"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { MOCK_ALERTS } from "@/lib/mock-data";
import type { Alert, AlertSeverity, AlertChannel } from "@/lib/types";

const SEVERITY_CONFIG: Record<AlertSeverity, { badge: "danger" | "warning" | "info"; label: string; icon: string }> = {
  critical: { badge: "danger", label: "Critical", icon: "🚨" },
  warning: { badge: "warning", label: "Warning", icon: "⚡" },
  info: { badge: "info", label: "Info", icon: "ℹ️" },
};

const CHANNEL_CONFIG: Record<AlertChannel, { icon: string; label: string }> = {
  dashboard: { icon: "🖥️", label: "Dashboard" },
  telegram: { icon: "✈️", label: "Telegram" },
  discord: { icon: "💬", label: "Discord" },
  email: { icon: "📧", label: "Email" },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [filter, setFilter] = useState<AlertSeverity | "all">("all");
  const [channels, setChannels] = useState<Record<AlertChannel, boolean>>({
    dashboard: true,
    telegram: true,
    discord: false,
    email: false,
  });

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const markRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const toggleChannel = (ch: AlertChannel) => {
    setChannels((prev) => ({ ...prev, [ch]: !prev[ch] }));
  };

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);
  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              🔔 Alert System
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Real-time alerts for FCFS signals, project discoveries, and system events
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white text-sm transition-all"
            >
              Mark all read ({unreadCount})
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{alerts.length}</p>
            <p className="text-white/40 text-xs mt-1">Total Alerts</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">{unreadCount}</p>
            <p className="text-white/40 text-xs mt-1">Unread</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-400">
              {alerts.filter((a) => a.severity === "critical").length}
            </p>
            <p className="text-white/40 text-xs mt-1">Critical</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-amber-400">
              {alerts.filter((a) => a.severity === "warning").length}
            </p>
            <p className="text-white/40 text-xs mt-1">Warnings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alert Feed */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filter tabs */}
            <div className="flex gap-2">
              {(["all", "critical", "warning", "info"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    filter === s
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {s === "all" ? "All" : SEVERITY_CONFIG[s].label}
                  {" "}({s === "all" ? alerts.length : alerts.filter((a) => a.severity === s).length})
                </button>
              ))}
            </div>

            {/* Alert cards */}
            <div className="space-y-3">
              {filtered.map((alert) => {
                const cfg = SEVERITY_CONFIG[alert.severity];
                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      !alert.read
                        ? alert.severity === "critical"
                          ? "bg-red-500/8 border-red-500/25"
                          : alert.severity === "warning"
                          ? "bg-amber-500/8 border-amber-500/25"
                          : "bg-blue-500/8 border-blue-500/25"
                        : "bg-white/3 border-white/8"
                    }`}
                    onClick={() => markRead(alert.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">{cfg.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-semibold ${alert.read ? "text-white/60" : "text-white"}`}>
                            {alert.title}
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!alert.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                            )}
                            <Badge variant={cfg.badge}>{cfg.label}</Badge>
                            <span className="text-white/30 text-xs">{alert.timestamp}</span>
                          </div>
                        </div>
                        <p className="text-white/50 text-xs mt-1 leading-relaxed">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {alert.channel.map((ch) => (
                            <span key={ch} className="text-xs text-white/30 flex items-center gap-1">
                              {CHANNEL_CONFIG[ch].icon} {CHANNEL_CONFIG[ch].label}
                            </span>
                          ))}
                          {alert.projectHandle && (
                            <span className="text-blue-400 text-xs ml-auto">{alert.projectHandle}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alert Config */}
          <div className="space-y-4">
            {/* Notification Channels */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-4">Notification Channels</h2>
              <div className="space-y-3">
                {(Object.keys(CHANNEL_CONFIG) as AlertChannel[]).map((ch) => (
                  <label key={ch} className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span>{CHANNEL_CONFIG[ch].icon}</span>
                      <span className="text-white/70 text-sm">{CHANNEL_CONFIG[ch].label}</span>
                    </div>
                    <button
                      onClick={() => toggleChannel(ch)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        channels[ch] ? "bg-blue-500" : "bg-white/20"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                          channels[ch] ? "left-5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </label>
                ))}
              </div>
              <p className="text-white/30 text-xs mt-4 pt-3 border-t border-white/10">
                Configure webhook URLs in Settings
              </p>
            </div>

            {/* Alert Rules */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-4">Alert Triggers</h2>
              <div className="space-y-3">
                {[
                  { icon: "🚨", label: "Critical FCFS Signal", enabled: true },
                  { icon: "🔥", label: "High Score Alpha (≥80)", enabled: true },
                  { icon: "👤", label: "New Project Extracted", enabled: true },
                  { icon: "📊", label: "Follower Threshold Hit", enabled: false },
                  { icon: "🌍", label: "Country Filter Bypass", enabled: false },
                ].map((rule) => (
                  <div key={rule.label} className="flex items-center gap-3">
                    <span>{rule.icon}</span>
                    <span className="flex-1 text-white/60 text-sm">{rule.label}</span>
                    <Badge variant={rule.enabled ? "success" : "muted"}>
                      {rule.enabled ? "On" : "Off"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Alert Stats */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-3">Today&apos;s Stats</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Alerts sent</span>
                  <span className="text-white">41</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Via Telegram</span>
                  <span className="text-blue-400">28</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Via Discord</span>
                  <span className="text-purple-400">13</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Avg response time</span>
                  <span className="text-emerald-400">&lt; 2s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
