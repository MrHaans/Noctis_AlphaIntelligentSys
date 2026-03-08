# Active Context: Next.js Starter Template

## Current State

**Template Status**: ✅ Ready for development

The template is a clean Next.js 16 starter with TypeScript and Tailwind CSS 4. It's ready for AI-assisted expansion to build any type of application.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] **Crypto Alpha Intelligence System** — full dashboard UI
  - Dashboard with pipeline overview, system stats, FCFS signals, alerts
  - Keyword Scanner page (add/remove/toggle, category tagging, hit counts)
  - Tweet Filter page (is_reply=false, is_retweet=false, country exclusion)
  - FCFS Detector page (weighted scoring, critical/high/medium/low signals)
  - Project Account Extractor page (auto-extract @mentions, $tickers, URLs)
  - Follower Range Filter page (optional, min/max gate, presets)
  - Alert System page (multi-channel: dashboard/telegram/discord/email)
  - Settings page (Twitter API, Telegram bot, Discord webhook, scan config)
  - Shared types (`src/lib/types.ts`), mock data (`src/lib/mock-data.ts`)
  - Reusable UI: `Badge`, `StatCard`, `Sidebar`, `AppShell`

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home page | ✅ Ready |
| `src/app/layout.tsx` | Root layout | ✅ Ready |
| `src/app/globals.css` | Global styles | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Current Focus

The template is ready. Next steps depend on user requirements:

1. What type of application to build
2. What features are needed
3. Design/branding preferences

## Quick Start Guide

### To add a new page:

Create a file at `src/app/[route]/page.tsx`:
```tsx
export default function NewPage() {
  return <div>New page content</div>;
}
```

### To add components:

Create `src/components/` directory and add components:
```tsx
// src/components/ui/Button.tsx
export function Button({ children }: { children: React.ReactNode }) {
  return <button className="px-4 py-2 bg-blue-600 text-white rounded">{children}</button>;
}
```

### To add a database:

Follow `.kilocode/recipes/add-database.md`

### To add API routes:

Create `src/app/api/[route]/route.ts`:
```tsx
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

## Available Recipes

| Recipe | File | Use Case |
|--------|------|----------|
| Add Database | `.kilocode/recipes/add-database.md` | Data persistence with Drizzle + SQLite |

## Pending Improvements

- [ ] Add more recipes (auth, email, etc.)
- [ ] Add example components
- [ ] Add testing setup recipe

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-03-08 | Added Nitter-based zero-cost scraper backend (`backend/`), Next.js API proxy (`/api/scraper/*`), updated Settings page with live Nitter instance health checker |
