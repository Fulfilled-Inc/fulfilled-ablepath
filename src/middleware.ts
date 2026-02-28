import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. Supabase 세션 갱신
  const supabaseResponse = await updateSession(request);

  // 2. next-intl 로케일 라우팅
  const intlResponse = intlMiddleware(request);

  // Supabase가 설정한 쿠키를 intl 응답에 복사
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    // next-intl: 로케일 접두사 라우팅
    "/",
    "/(en|ko|ja|zh|es)/:path*",
    // API, _next, 정적 파일 제외
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
