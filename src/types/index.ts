export type { Profile, Child, Mission, MissionLog, MoodLog, AiChatLog } from "./database";

/** 지원 로케일 */
export type Locale = "en" | "ko" | "ja" | "zh" | "es";

/** 미션 카테고리 */
export type MissionCategory = "language" | "sensory" | "cognitive";

/** 기분 상태 */
export type Mood = "great" | "good" | "neutral" | "bad" | "awful";
