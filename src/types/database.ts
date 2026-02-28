/** Supabase 테이블 타입 정의 (수동 — 추후 supabase gen types로 자동 생성 권장) */

export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  locale: string;
  timezone: string;
  created_at: string;
  updated_at: string;
};

export type Child = {
  id: string;
  parent_id: string;
  name: string;
  birth_date: string | null;
  disability_type: string | null;
  disability_detail: string | null;
  created_at: string;
  updated_at: string;
};

export type Mission = {
  id: string;
  category: "language" | "sensory" | "cognitive";
  title: Record<string, string>;       // { en: "...", ko: "..." }
  description: Record<string, string>;
  instructions: Record<string, string>;
  difficulty_level: number;
  min_age: number | null;
  max_age: number | null;
  is_active: boolean;
  created_at: string;
};

export type MissionLog = {
  id: string;
  child_id: string;
  mission_id: string;
  completed_at: string;
  status: "completed" | "skipped" | "partial";
  parent_note: string | null;
  created_at: string;
};

export type MoodLog = {
  id: string;
  child_id: string;
  mood: "great" | "good" | "neutral" | "bad" | "awful";
  note: string | null;
  logged_date: string;
  created_at: string;
};

export type AiChatLog = {
  id: string;
  parent_id: string;
  child_id: string | null;
  question: string;
  answer: string;
  created_at: string;
};
