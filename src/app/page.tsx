import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import {
  MOCK_SYSTEM_STATS,
  MOCK_PIPELINE,
  MOCK_ALERTS,
  MOCK_FCFS_SIGNALS,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const unreadAlerts = MOCK_ALERTS.filter((a) => !a.read);
  const criticalSignals = MOCK_FCFS_SIGNALS.filter((s) => s.strength === "critical");

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-white/40 text-sm mt-1">
              Real-time crypto alpha discovery pipeline
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-sm font-medium">Live Scanning</span>
            </div>
            <div className="text-white/30 text-sm">
              Last scan: <span className="text-white/60">{MOCK_SYSTEM_STATS.lastScan}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Tweets Scanned"
            value={MOCK_SYSTEM_STATS.totalTweetsScanned.toLocaleString()}
            sub="Total since start"
            icon="🔍"
            color="blue"
          />
          <StatCard
            label="Original Tweets"
            value={MOCK_SYSTEM_STATS.originalTweetsOnly.toLocaleString()}
            sub="No replies / retweets"
            icon="🐦"
            color="cyan"
          />
          <StatCard
            label="FCFS Signals"
            value={MOCK_SYSTEM_STATS.fcfsSignalsDetected}
            sub="Detected this session"
            icon="🚨"
            color="red"
          />
          <StatCard
            label="Alerts Sent"
            value={MOCK_SYSTEM_STATS.alertsSent}
            sub="Across all channels"
            icon="🔔"
            color="amber"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Country Filtered"
            value={MOCK_SYSTEM_STATS.filteredByCountry.toLocaleString()}
            sub="Excluded regions"
            icon="🌍"
            color="purple"
          />
          <StatCard
            label="Projects Extracted"
            value={MOCK_SYSTEM_STATS.projectsExtracted}
            sub="Unique accounts"
            icon="👤"
            color="emerald"
          />
          <StatCard
            label="System Uptime"
            value={MOCK_SYSTEM_STATS.uptime}
            sub="Continuous operation"
            icon="⏱️"
            color="blue"
          />
          <StatCard
            label="Active Keywords"
            value="9"
            sub="Out of 10 configured"
            icon="🏷️"
            color="cyan"
          />
        </div>

        {/* Pipeline Flow */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>⚡</span> Discovery Pipeline
          </h2>
          <div className="space-y-3">
            {MOCK_PIPELINE.map((stage, idx) => {
              const passRate = stage.processed > 0
                ? Math.round((stage.passed / stage.processed) * 100)
                : 0;
              return (
                <div key={stage.stage} className="flex items-center gap-4">
                  {/* Step number */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    stage.active
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : "bg-white/5 text-white/30 border border-white/10"
                  }`}>
                    {idx + 1}
                  </div>

                  {/* Stage info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${stage.active ? "text-white" : "text-white/40"}`}>
                        {stage.label}
                      </span>
                      {!stage.active && (
                        <Badge variant="muted">Optional</Badge>
                      )}
                      {stage.active && (
                        <Badge variant="success">Active</Badge>
                      )}
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          stage.active ? "bg-blue-500" : "bg-white/20"
                        }`}
                        style={{ width: `${passRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Numbers */}
                  <div className="text-right flex-shrink-0 w-40">
                    <div className="flex items-center justify-end gap-3 text-xs">
                      <span className="text-white/40">{stage.processed.toLocaleString()} in</span>
                      <span className="text-emerald-400">✓ {stage.passed.toLocaleString()}</span>
                      <span className="text-red-400">✗ {stage.filtered.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Arrow (not last) */}
                  {idx < MOCK_PIPELINE.length - 1 && (
                    <div className="text-white/20 text-xs flex-shrink-0">↓</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom row: Recent Alerts + Critical Signals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Alerts */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <span>🔔</span> Recent Alerts
              </h2>
              {unreadAlerts.length > 0 && (
                <Badge variant="danger">{unreadAlerts.length} unread</Badge>
              )}
            </div>
            <div className="space-y-3">
              {MOCK_ALERTS.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${
                    !alert.read
                      ? "bg-white/5 border-white/15"
                      : "bg-transparent border-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${alert.read ? "text-white/50" : "text-white"}`}>
                      {alert.title}
                    </p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!alert.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                      <span className="text-white/30 text-xs">{alert.timestamp}</span>
                    </div>
                  </div>
                  <p className="text-white/40 text-xs mt-1 line-clamp-1">{alert.message}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {alert.channel.map((ch) => (
                      <Badge key={ch} variant="muted">{ch}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical FCFS Signals */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <span>🚨</span> FCFS Signals
              </h2>
              {criticalSignals.length > 0 && (
                <Badge variant="danger">{criticalSignals.length} critical</Badge>
              )}
            </div>
            <div className="space-y-3">
              {MOCK_FCFS_SIGNALS.map((signal) => {
                const strengthConfig = {
                  critical: { badge: "danger" as const, label: "CRITICAL" },
                  high: { badge: "warning" as const, label: "HIGH" },
                  medium: { badge: "info" as const, label: "MEDIUM" },
                  low: { badge: "muted" as const, label: "LOW" },
                };
                const cfg = strengthConfig[signal.strength];
                return (
                  <div key={signal.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm font-medium">{signal.handle}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={cfg.badge}>{cfg.label}</Badge>
                        <span className="text-white/30 text-xs">{signal.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-white/50 text-xs line-clamp-2 mb-2">{signal.text}</p>
                    <div className="flex flex-wrap gap-1">
                      {signal.indicators.map((ind) => (
                        <span key={ind} className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
