"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { MOCK_TWEETS, EXCLUDED_COUNTRIES } from "@/lib/mock-data";
import type { Tweet, CountryFilter } from "@/lib/types";

function TweetCard({ tweet }: { tweet: Tweet }) {
  const isFiltered = tweet.status === "filtered";
  const filterReasons: string[] = [];
  if (tweet.is_reply) filterReasons.push("is_reply = true");
  if (tweet.is_retweet) filterReasons.push("is_retweet = true");
  if (EXCLUDED_COUNTRIES.some((c) => c.code === tweet.countryCode)) {
    filterReasons.push(`country: ${tweet.country}`);
  }

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isFiltered
          ? "bg-red-500/5 border-red-500/20 opacity-60"
          : "bg-white/5 border-white/10"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
          {tweet.avatar}
        </div>

        <div className="flex-1 min-w-0">
          {/* Author row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-medium text-sm">{tweet.author}</span>
            <span className="text-white/40 text-xs">{tweet.handle}</span>
            <span className="text-white/20 text-xs">·</span>
            <span className="text-white/30 text-xs">{tweet.timestamp}</span>
            <span className="ml-auto text-white/30 text-xs">{tweet.country} ({tweet.countryCode})</span>
          </div>

          {/* Tweet text */}
          <p className="text-white/70 text-sm mt-1.5 leading-relaxed">{tweet.text}</p>

          {/* Matched keywords */}
          {tweet.matchedKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tweet.matchedKeywords.map((kw) => (
                <span key={kw} className="text-xs bg-blue-500/15 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-full">
                  🏷️ {kw}
                </span>
              ))}
            </div>
          )}

          {/* Flags row */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${tweet.is_reply ? "bg-red-400" : "bg-emerald-400"}`} />
              <span className="text-xs text-white/40">
                is_reply: <span className={tweet.is_reply ? "text-red-400" : "text-emerald-400"}>{String(tweet.is_reply)}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${tweet.is_retweet ? "bg-red-400" : "bg-emerald-400"}`} />
              <span className="text-xs text-white/40">
                is_retweet: <span className={tweet.is_retweet ? "text-red-400" : "text-emerald-400"}>{String(tweet.is_retweet)}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-white/40">
                followers: <span className="text-white/60">{tweet.followers.toLocaleString()}</span>
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {isFiltered ? (
                <Badge variant="danger">FILTERED</Badge>
              ) : (
                <Badge variant="success">PASSED</Badge>
              )}
              {tweet.score > 0 && (
                <span className={`text-xs font-bold ${tweet.score >= 80 ? "text-emerald-400" : tweet.score >= 50 ? "text-amber-400" : "text-white/40"}`}>
                  Score: {tweet.score}
                </span>
              )}
            </div>
          </div>

          {/* Filter reasons */}
          {filterReasons.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {filterReasons.map((r) => (
                <span key={r} className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded">
                  ✗ {r}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TweetFilterPage() {
  const [countries, setCountries] = useState<CountryFilter[]>(EXCLUDED_COUNTRIES);
  const [showFiltered, setShowFiltered] = useState(true);
  const [filterReplies, setFilterReplies] = useState(true);
  const [filterRetweets, setFilterRetweets] = useState(true);

  const filteredTweets = MOCK_TWEETS.filter((t) => {
    if (filterReplies && t.is_reply) return false;
    if (filterRetweets && t.is_retweet) return false;
    if (countries.some((c) => c.excluded && c.code === t.countryCode)) return false;
    return true;
  });

  const passedCount = filteredTweets.length;
  const totalCount = MOCK_TWEETS.length;
  const filteredCount = totalCount - passedCount;

  const toggleCountry = (code: string) => {
    setCountries((prev) =>
      prev.map((c) => (c.code === code ? { ...c, excluded: !c.excluded } : c))
    );
  };

  const displayTweets = showFiltered ? MOCK_TWEETS : filteredTweets;

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            🐦 Tweet Filter
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Filter original tweets only — excludes replies, retweets, and excluded countries
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{totalCount}</p>
            <p className="text-white/40 text-xs mt-1">Total Collected</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">{passedCount}</p>
            <p className="text-white/40 text-xs mt-1">Passed Filter</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-400">{filteredCount}</p>
            <p className="text-white/40 text-xs mt-1">Filtered Out</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filter Config */}
          <div className="space-y-4">
            {/* Tweet Type Filters */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-4">Tweet Type Filters</h2>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-white text-sm font-medium">Filter Replies</p>
                    <p className="text-white/40 text-xs">is_reply = false only</p>
                  </div>
                  <button
                    onClick={() => setFilterReplies(!filterReplies)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      filterReplies ? "bg-blue-500" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                        filterReplies ? "left-5" : "left-0.5"
                      }`}
                    />
                  </button>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-white text-sm font-medium">Filter Retweets</p>
                    <p className="text-white/40 text-xs">is_retweet = false only</p>
                  </div>
                  <button
                    onClick={() => setFilterRetweets(!filterRetweets)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      filterRetweets ? "bg-blue-500" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                        filterRetweets ? "left-5" : "left-0.5"
                      }`}
                    />
                  </button>
                </label>
              </div>
            </div>

            {/* Country Filter */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-1">Country Filter</h2>
              <p className="text-white/40 text-xs mb-4">Exclude tweets from these countries</p>
              <div className="space-y-2">
                {countries.map((c) => (
                  <label key={c.code} className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 text-sm">{c.name}</span>
                      <span className="text-white/30 text-xs">({c.code})</span>
                    </div>
                    <button
                      onClick={() => toggleCountry(c.code)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        c.excluded ? "bg-red-500" : "bg-white/20"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                          c.excluded ? "left-5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </label>
                ))}
              </div>
              <p className="text-white/30 text-xs mt-3 pt-3 border-t border-white/10">
                {countries.filter((c) => c.excluded).length} countries excluded
              </p>
            </div>

            {/* View Toggle */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-3">Display</h2>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-white text-sm font-medium">Show Filtered Tweets</p>
                  <p className="text-white/40 text-xs">Display rejected tweets too</p>
                </div>
                <button
                  onClick={() => setShowFiltered(!showFiltered)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    showFiltered ? "bg-blue-500" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                      showFiltered ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>

          {/* Tweet List */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">
                {showFiltered ? "All Tweets" : "Passed Tweets"}
              </h2>
              <span className="text-white/40 text-sm">{displayTweets.length} tweets</span>
            </div>
            {displayTweets.map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
