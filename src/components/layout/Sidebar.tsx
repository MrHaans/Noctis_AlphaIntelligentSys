"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "⚡", label: "Dashboard", badge: null },
  { href: "/keyword-scanner", icon: "🔍", label: "Keyword Scanner", badge: null },
  { href: "/tweet-filter", icon: "🐦", label: "Tweet Filter", badge: null },
  { href: "/fcfs-detector", icon: "🚨", label: "FCFS Detector", badge: "3" },
  { href: "/account-extractor", icon: "👤", label: "Account Extractor", badge: null },
  { href: "/follower-filter", icon: "📊", label: "Follower Filter", badge: null },
  { href: "/alerts", icon: "🔔", label: "Alerts", badge: "2" },
  { href: "/settings", icon: "⚙️", label: "Settings", badge: null },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0d1120] border-r border-white/10 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-lg font-bold">
            ₿
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Noctis Alpha</p>
            <p className="text-white/40 text-xs">Intelligence System</p>
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="px-5 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-medium">System Active</span>
          <span className="ml-auto text-white/30 text-xs">14h 32m</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-white/20 text-xs text-center">v1.0.0 · CAIS</p>
      </div>
    </aside>
  );
}
