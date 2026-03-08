import type {
  Tweet,
  Keyword,
  FCFSSignal,
  ProjectAccount,
  Alert,
  CountryFilter,
  PipelineStats,
  SystemStats,
} from "./types";

// ─── Excluded Countries ───────────────────────────────────────────────────────

export const EXCLUDED_COUNTRIES: CountryFilter[] = [
  { code: "IN", name: "India", excluded: true },
  { code: "BD", name: "Bangladesh", excluded: true },
  { code: "PK", name: "Pakistan", excluded: true },
  { code: "NG", name: "Nigeria", excluded: true },
  { code: "ID", name: "Indonesia", excluded: true },
  { code: "PH", name: "Philippines", excluded: true },
];

// ─── Keywords ─────────────────────────────────────────────────────────────────

export const MOCK_KEYWORDS: Keyword[] = [
  { id: "k1", term: "FCFS", category: "fcfs", active: true, hits: 342 },
  { id: "k2", term: "first come first serve", category: "fcfs", active: true, hits: 128 },
  { id: "k3", term: "whitelist open", category: "whitelist", active: true, hits: 89 },
  { id: "k4", term: "airdrop live", category: "airdrop", active: true, hits: 214 },
  { id: "k5", term: "mint now", category: "launch", active: true, hits: 567 },
  { id: "k6", term: "presale", category: "launch", active: true, hits: 431 },
  { id: "k7", term: "alpha call", category: "alpha", active: true, hits: 76 },
  { id: "k8", term: "stealth launch", category: "launch", active: true, hits: 193 },
  { id: "k9", term: "free mint", category: "airdrop", active: true, hits: 388 },
  { id: "k10", term: "WL spots", category: "whitelist", active: false, hits: 55 },
];

// ─── Mock Tweets ──────────────────────────────────────────────────────────────

export const MOCK_TWEETS: Tweet[] = [
  {
    id: "t1",
    text: "🚨 FCFS mint is LIVE! Only 500 spots remaining. Don't miss this alpha — stealth launch happening NOW. #crypto #NFT",
    author: "CryptoWhale",
    handle: "@cryptowhale_eth",
    avatar: "CW",
    followers: 48200,
    country: "United States",
    countryCode: "US",
    timestamp: "2 min ago",
    is_reply: false,
    is_retweet: false,
    matchedKeywords: ["FCFS", "stealth launch"],
    score: 94,
    status: "passed",
  },
  {
    id: "t2",
    text: "New airdrop live for early holders. Free mint open for next 2 hours. Grab your whitelist spot now!",
    author: "AlphaLeaks",
    handle: "@alphaleaks_xyz",
    avatar: "AL",
    followers: 22100,
    country: "United Kingdom",
    countryCode: "GB",
    timestamp: "5 min ago",
    is_reply: false,
    is_retweet: false,
    matchedKeywords: ["airdrop live", "free mint", "whitelist"],
    score: 88,
    status: "passed",
  },
  {
    id: "t3",
    text: "@someone check this out bro, presale starting soon",
    author: "CryptoUser",
    handle: "@cryptouser99",
    avatar: "CU",
    followers: 1200,
    country: "India",
    countryCode: "IN",
    timestamp: "7 min ago",
    is_reply: true,
    is_retweet: false,
    matchedKeywords: ["presale"],
    score: 12,
    status: "filtered",
  },
  {
    id: "t4",
    text: "RT @someone: FCFS whitelist open — 1000 spots only!",
    author: "RetweetBot",
    handle: "@rtbot_crypto",
    avatar: "RB",
    followers: 500,
    country: "Nigeria",
    countryCode: "NG",
    timestamp: "9 min ago",
    is_reply: false,
    is_retweet: true,
    matchedKeywords: ["FCFS", "whitelist open"],
    score: 8,
    status: "filtered",
  },
  {
    id: "t5",
    text: "🔥 Alpha call: $NOVA presale is underway. First come first serve — only 200 ETH hard cap. Team is doxxed. DYOR.",
    author: "DegenAlpha",
    handle: "@degenalpha_eth",
    avatar: "DA",
    followers: 31500,
    country: "Canada",
    countryCode: "CA",
    timestamp: "12 min ago",
    is_reply: false,
    is_retweet: false,
    matchedKeywords: ["alpha call", "presale", "first come first serve"],
    score: 91,
    status: "passed",
  },
  {
    id: "t6",
    text: "Stealth launch in 30 minutes. No announcement. Pure alpha. Follow for the CA drop.",
    author: "SolanaSniper",
    handle: "@solsniper_pro",
    avatar: "SS",
    followers: 15800,
    country: "Germany",
    countryCode: "DE",
    timestamp: "15 min ago",
    is_reply: false,
    is_retweet: false,
    matchedKeywords: ["stealth launch"],
    score: 79,
    status: "passed",
  },
];

// ─── FCFS Signals ─────────────────────────────────────────────────────────────

export const MOCK_FCFS_SIGNALS: FCFSSignal[] = [
  {
    id: "f1",
    tweetId: "t1",
    author: "CryptoWhale",
    handle: "@cryptowhale_eth",
    text: "🚨 FCFS mint is LIVE! Only 500 spots remaining. Don't miss this alpha — stealth launch happening NOW.",
    timestamp: "2 min ago",
    strength: "critical",
    indicators: ["FCFS keyword", "urgency language", "spot limit mentioned", "live event"],
    projectName: "Unknown Project",
  },
  {
    id: "f2",
    tweetId: "t5",
    author: "DegenAlpha",
    handle: "@degenalpha_eth",
    text: "🔥 Alpha call: $NOVA presale is underway. First come first serve — only 200 ETH hard cap.",
    timestamp: "12 min ago",
    strength: "high",
    indicators: ["first come first serve", "hard cap mentioned", "token ticker ($NOVA)"],
    projectName: "$NOVA",
  },
  {
    id: "f3",
    tweetId: "t2",
    author: "AlphaLeaks",
    handle: "@alphaleaks_xyz",
    text: "New airdrop live for early holders. Free mint open for next 2 hours.",
    timestamp: "5 min ago",
    strength: "medium",
    indicators: ["time-limited offer", "airdrop live", "free mint"],
    projectName: "Unknown Project",
  },
];

// ─── Project Accounts ─────────────────────────────────────────────────────────

export const MOCK_PROJECTS: ProjectAccount[] = [
  {
    id: "p1",
    name: "NOVA Protocol",
    handle: "@nova_protocol",
    avatar: "NP",
    followers: 12400,
    verified: false,
    category: "DeFi",
    extractedFrom: "t5",
    addedAt: "12 min ago",
    tracked: true,
  },
  {
    id: "p2",
    name: "StealthMint",
    handle: "@stealthmint_io",
    avatar: "SM",
    followers: 8900,
    verified: false,
    category: "NFT",
    extractedFrom: "t6",
    addedAt: "15 min ago",
    tracked: true,
  },
  {
    id: "p3",
    name: "AirdropDAO",
    handle: "@airdroptdao",
    avatar: "AD",
    followers: 34200,
    verified: true,
    category: "Airdrop",
    extractedFrom: "t2",
    addedAt: "5 min ago",
    tracked: false,
  },
];

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const MOCK_ALERTS: Alert[] = [
  {
    id: "a1",
    title: "🚨 Critical FCFS Signal Detected",
    message: "@cryptowhale_eth posted a FCFS mint alert with 500 spots. Score: 94/100.",
    severity: "critical",
    channel: ["dashboard", "telegram"],
    tweetId: "t1",
    timestamp: "2 min ago",
    read: false,
  },
  {
    id: "a2",
    title: "🔥 High-Score Alpha Call",
    message: "$NOVA presale detected via @degenalpha_eth. First come first serve with 200 ETH cap.",
    severity: "critical",
    channel: ["dashboard", "telegram", "discord"],
    tweetId: "t5",
    projectHandle: "@nova_protocol",
    timestamp: "12 min ago",
    read: false,
  },
  {
    id: "a3",
    title: "⚡ New Project Extracted",
    message: "StealthMint (@stealthmint_io) extracted from stealth launch tweet. 8.9K followers.",
    severity: "warning",
    channel: ["dashboard"],
    tweetId: "t6",
    projectHandle: "@stealthmint_io",
    timestamp: "15 min ago",
    read: true,
  },
  {
    id: "a4",
    title: "ℹ️ Airdrop Signal",
    message: "Free mint + airdrop live detected from @alphaleaks_xyz. Medium confidence.",
    severity: "info",
    channel: ["dashboard"],
    tweetId: "t2",
    timestamp: "5 min ago",
    read: true,
  },
];

// ─── Pipeline Stats ───────────────────────────────────────────────────────────

export const MOCK_PIPELINE: PipelineStats[] = [
  { stage: "keyword-scanner", label: "Keyword Scanner", processed: 12840, passed: 1247, filtered: 11593, active: true },
  { stage: "tweet-collector", label: "Tweet Collector", processed: 1247, passed: 1247, filtered: 0, active: true },
  { stage: "tweet-filter", label: "Tweet Filter (Original Only)", processed: 1247, passed: 634, filtered: 613, active: true },
  { stage: "fcfs-detector", label: "FCFS Detector", processed: 634, passed: 89, filtered: 545, active: true },
  { stage: "account-extractor", label: "Project Account Extractor", processed: 89, passed: 67, filtered: 22, active: true },
  { stage: "follower-filter", label: "Follower Range Filter", processed: 67, passed: 41, filtered: 26, active: false },
  { stage: "alert", label: "Alert System", processed: 41, passed: 41, filtered: 0, active: true },
];

// ─── System Stats ─────────────────────────────────────────────────────────────

export const MOCK_SYSTEM_STATS: SystemStats = {
  totalTweetsScanned: 12840,
  originalTweetsOnly: 634,
  filteredByCountry: 2341,
  fcfsSignalsDetected: 89,
  projectsExtracted: 67,
  alertsSent: 41,
  uptime: "14h 32m",
  lastScan: "Just now",
};
