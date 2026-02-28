"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Send,
  Loader2,
  AlertTriangle,
  Bot,
  MessageSquare,
  Sparkles,
  Home,
} from "lucide-react";
import type { DevelopmentalAdviceResponse, Mission } from "@/lib/gemini";

// ─── 카테고리 아이콘/색상 매핑 ───

const CATEGORY_META: Record<
  Mission["category"],
  { emoji: string; label: string; color: string; bg: string }
> = {
  language: {
    emoji: "🗣️",
    label: "Language",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  sensory: {
    emoji: "🎨",
    label: "Sensory",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  cognitive: {
    emoji: "🧩",
    label: "Cognitive",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
};

// ─── MissionCard ───

function MissionCard({ mission }: { mission: Mission }) {
  const meta = CATEGORY_META[mission.category] ?? CATEGORY_META.cognitive;

  return (
    <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
      {/* 카테고리 배지 */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${meta.bg} ${meta.color}`}
        >
          {meta.emoji} {meta.label}
        </span>
      </div>

      {/* 미션 제목 */}
      <h4 className="mb-2 text-base font-bold">{mission.title}</h4>

      {/* 단계별 가이드 */}
      <ol className="mb-3 list-inside list-decimal space-y-1 text-sm leading-relaxed text-muted-foreground">
        {mission.guide.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      {/* 기대 효과 */}
      <div className="mb-3 rounded-xl bg-accent/5 px-3 py-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-accent">
          <Sparkles className="h-3.5 w-3.5" />
          기대 효과
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {mission.expected_effect}
        </p>
      </div>

      {/* 준비물 */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Home className="h-3.5 w-3.5 text-muted-foreground" />
        {mission.home_materials.map((item, i) => (
          <span
            key={i}
            className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── AdviceCard (전체 응답) ───

function AdviceCard({ data }: { data: DevelopmentalAdviceResponse }) {
  return (
    <div className="space-y-4">
      {/* 오늘의 요약 */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Bot className="h-4 w-4" />
          전문가 코멘트
        </p>
        <p className="mt-1.5 text-sm leading-relaxed">{data.daily_summary}</p>
      </div>

      {/* 미션 카드 3개 */}
      <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-3">
        {data.missions.map((mission, i) => (
          <MissionCard key={i} mission={mission} />
        ))}
      </div>
    </div>
  );
}

// ─── 메인 타입 ───

type ChatEntry =
  | { role: "user"; content: string }
  | { role: "assistant"; data: DevelopmentalAdviceResponse }
  | { role: "error"; content: string; retryAfterMs?: number };

// ─── Page Component ───

export default function AiGuidePage() {
  const t = useTranslations();
  const locale = useLocale();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // Rate limit 해제 타이머
  useEffect(() => {
    if (!rateLimited) return;
    const timer = setTimeout(() => setRateLimited(false), 60_000);
    return () => clearTimeout(timer);
  }, [rateLimited]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading || rateLimited) return;

    const concern = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: concern }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concern, locale }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 429) setRateLimited(true);
        setMessages((prev) => [
          ...prev,
          {
            role: "error",
            content: json.error ?? "Something went wrong.",
            retryAfterMs: json.retryAfterMs,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", data: json.data },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "error", content: "Network error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col md:h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{t("nav.aiGuide")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("aiGuide.disclaimer")}
        </p>
      </div>

      {/* Chat Messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-border bg-card p-4"
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Bot className="mb-4 h-12 w-12 text-primary/40" />
            <p className="text-lg font-medium text-muted-foreground">
              {t("aiGuide.placeholder")}
            </p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {[
                "My child repeats the same words over and over",
                "아이가 눈을 잘 마주치지 않아요",
                "My child gets overwhelmed by loud noises",
                "아이가 또래와 어울리지 못해요",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="rounded-xl border border-border px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  &quot;{suggestion}&quot;
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === "user" && (
              <div className="flex justify-end">
                <div className="flex max-w-[80%] items-start gap-2">
                  <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm text-primary-foreground">
                    {msg.content}
                  </div>
                  <div className="mt-1 rounded-full bg-primary/10 p-1.5">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </div>
            )}

            {msg.role === "assistant" && (
              <div className="flex justify-start">
                <div className="w-full max-w-[95%]">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="rounded-full bg-accent/10 p-1.5">
                      <Bot className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      AblePath Guide
                    </span>
                  </div>
                  <AdviceCard data={msg.data} />
                </div>
              </div>
            )}

            {msg.role === "error" && (
              <div className="flex justify-center">
                <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {msg.content}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              <span className="text-sm text-muted-foreground">
                AI가 미션을 생성하고 있습니다...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("aiGuide.placeholder")}
          disabled={loading || rateLimited}
          className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading || rateLimited}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>

      {rateLimited && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          ⏳ Rate limit reached. Please wait about 1 minute before trying again.
        </p>
      )}
    </div>
  );
}
