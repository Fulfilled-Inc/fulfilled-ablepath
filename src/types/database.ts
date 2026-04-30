/** Supabase 테이블 타입 정의 (수동 — 추후 supabase gen types로 자동 생성 권장) */

export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: "USER" | "ADMIN" | "THERAPIST"; // 치료사(THERAPIST) 권한 추가
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

// --- 신규: 치료사(전문가) 관련 스키마 ---

export type TherapistChildLink = {
  id: string;
  therapist_id: string; // 치료사(Profile) ID
  child_id: string;     // 연결된 아이(Child) ID
  status: "pending" | "active" | "inactive"; // 연결 상태 (초대 대기중, 활성, 비활성)
  created_at: string;
  updated_at: string;
};

export type TherapySessionLog = {
  id: string;
  therapist_id: string;
  child_id: string;
  session_date: string; // 치료 진행 날짜
  title: string;        // 예: "놀이치료 3회차"
  observation: string;  // 치료 내용, 관찰 기록 (부모 투명성 제공)
  therapist_note: string | null; // 치료사 개인 참고 메모 (부모 비공개 옵션 등으로 확장 가능)
  attachment_urls: string[] | null; // 사진 등 첨부파일 URL (Supabase Storage 활용)
  created_at: string;
  updated_at: string;
};
