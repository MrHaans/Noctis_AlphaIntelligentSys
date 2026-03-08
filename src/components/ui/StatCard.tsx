interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  color?: "blue" | "emerald" | "amber" | "red" | "cyan" | "purple";
}

const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", icon: "text-blue-400" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", icon: "text-emerald-400" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-400", icon: "text-amber-400" },
  red: { bg: "bg-red-500/10", text: "text-red-400", icon: "text-red-400" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400", icon: "text-cyan-400" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-400", icon: "text-purple-400" },
};

export function StatCard({ label, value, sub, icon, color = "blue" }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center text-xl flex-shrink-0`}>
        <span>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-white/50 text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${c.text}`}>{value}</p>
        {sub && <p className="text-white/40 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
