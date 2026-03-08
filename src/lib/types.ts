// ─── Core Tweet Types ────────────────────────────────────────────────────────

export type TweetStatus = "pending" | "passed" | "filtered";

export interface Tweet {
  id: string;
  text: string;
  author: string;
  handle: string;
  avatar: string;
  followers: number;
  country: string;
  countryCode: string;
  timestamp: string;
  is_reply: boolean;
  is_retweet: boolean;
  matchedKeywords: string[];
  score: number;
  status: TweetStatus;
}

// ─── Keyword Scanner ─────────────────────────────────────────────────────────

export interface Keyword {
  id: string;
  term: string;
  category: "launch" | "airdrop" | "fcfs" | "whitelist" | "alpha" | "custom";
  active: boolean;
  hits: number;
}

// ─── FCFS Detector ───────────────────────────────────────────────────────────

export type FCFSSignalStrength = "low" | "medium" | "high" | "critical";

export interface FCFSSignal {
  id: string;
  tweetId: string;
  author: string;
  handle: string;
  text: string;
  timestamp: string;
  strength: FCFSSignalStrength;
  indicators: string[];
  projectName?: string;
}

// ─── Project Account ─────────────────────────────────────────────────────────

export interface ProjectAccount {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  followers: number;
  verified: boolean;
  category: string;
  extractedFrom: string;
  addedAt: string;
  tracked: boolean;
}

// ─── Follower Range Filter ────────────────────────────────────────────────────

export interface FollowerFilter {
  min: number;
  max: number;
  enabled: boolean;
}

// ─── Alert ───────────────────────────────────────────────────────────────────

export type AlertSeverity = "info" | "warning" | "critical";
export type AlertChannel = "dashboard" | "telegram" | "discord" | "email";

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  channel: AlertChannel[];
  tweetId?: string;
  projectHandle?: string;
  timestamp: string;
  read: boolean;
}

// ─── Country Filter ───────────────────────────────────────────────────────────

export interface CountryFilter {
  code: string;
  name: string;
  excluded: boolean;
}

// ─── Pipeline Stage ───────────────────────────────────────────────────────────

export type PipelineStage =
  | "keyword-scanner"
  | "tweet-collector"
  | "tweet-filter"
  | "fcfs-detector"
  | "account-extractor"
  | "follower-filter"
  | "alert";

export interface PipelineStats {
  stage: PipelineStage;
  label: string;
  processed: number;
  passed: number;
  filtered: number;
  active: boolean;
}

// ─── System Stats ─────────────────────────────────────────────────────────────

export interface SystemStats {
  totalTweetsScanned: number;
  originalTweetsOnly: number;
  filteredByCountry: number;
  fcfsSignalsDetected: number;
  projectsExtracted: number;
  alertsSent: number;
  uptime: string;
  lastScan: string;
}
