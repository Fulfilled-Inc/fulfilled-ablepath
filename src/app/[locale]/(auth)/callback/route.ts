import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase Auth 콜백 핸들러
 * OAuth 로그인 또는 이메일 확인 후 리다이렉트되는 경로
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 에러 시 로그인 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/login`);
}
