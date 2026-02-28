import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind 클래스 병합 유틸 (shadcn/ui 호환) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 날짜를 로케일에 맞게 포맷 */
export function formatDate(date: Date | string, locale = "en") {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

/** 아이의 개월 수 계산 */
export function getAgeInMonths(birthDate: Date | string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  return (
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth())
  );
}
