<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Supabase-Auth_&_DB-3FCF8E?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Gemini_1.5_Flash-AI-4285F4?logo=google" alt="Gemini" />
</p>

# 🌈 AblePath (에이블패스)

**전 세계 발달 장애 아동 가정을 위한 AI 기반 홈 케어 & 안심 치료실 연동 솔루션**

전문 치료 시설 접근이 어려운 가정에 저비용·고효율 발달 지원 가이드를 제공합니다.  
Gemini AI 전문가가 아이의 상태를 분석하여 가정 내 놀이 치료 미션을 제안할 뿐만 아니라, **보호자 - 치료사 - 시스템 관리자**를 유기적으로 연결하는 다중 권한(Role-Based) 플랫폼입니다.

---

## ✨ 핵심 기능 및 사용자 권한 (Roles)

이 프로젝트는 사용자의 역할(`role`)에 따라 완전히 분리된 대시보드와 기능을 제공합니다.

### 👪 1. 부모 / 보호자 (USER)
*   **🤖 AI 맞춤 미션:** 아이의 발달 유형과 현재 고민을 3단계 위자드 폼으로 입력하면, AI가 언어·감각통합·인지 3영역 놀이 치료 미션을 생성합니다.
*   **😊 기분 및 활동 기록:** 매일 아이의 기분을 기록하고, 미션 수행 현황을 타임라인과 차트로 확인합니다.
*   **📄 PDF 발달 리포트:** 활동 데이터를 기반으로 월간 발달 리포트를 PDF 문서로 다운로드할 수 있습니다.
*   **💌 선생님의 안심 리포트:** 아이를 담당하는 물리/언어 치료사가 작성한 '투명성 관찰 기록'을 메인 화면에서 실시간으로 확인하여 아동 학대에 대한 불안감을 해소합니다.

### 🩺 2. 치료사 / 전문가 (THERAPIST)
*   **👥 담당 아동 관리:** 본인과 연결된 아동들의 목록과 최근 세션 현황을 한눈에 파악합니다.
*   **📝 안심 치료 일지 작성:** 
    *   **부모님 공개용:** 관찰 기록과 칭찬 노트, 사진/영상을 첨부하여 부모님께 투명하게 세션 내용을 공유합니다.
    *   **전문가 비공개 메모:** 다음 세션을 위한 치료사 본인만의 개인적인 참고 사항을 안전하게 기록합니다.

### 🛡️ 3. 시스템 관리자 (ADMIN)
*   **📈 시스템 모니터링:** 전체 가입자 수, 활성 유저, 누적 생성 미션 등 플랫폼 시스템 헬스 체크 및 주요 통계를 대시보드에서 조회합니다.
*   **⚙️ 사용자 및 데이터 관리:** 플랫폼 장애 대응 및 고객 지원(CS)을 수행합니다.

---

## 🛠 기술 스택

| 분류 | 기술 |
|------|------|
| **Framework** | Next.js 16.1.6 (App Router, React 19) |
| **UI** | Tailwind CSS v4, Lucide Icons, Recharts |
| **Auth & DB** | Supabase (Auth + PostgreSQL + RLS) |
| **AI** | Google Gemini 1.5 Flash (`@google/generative-ai`) |
| **i18n** | next-intl (로케일별 라우팅 `[locale]`) |
| **PDF** | @react-pdf/renderer (클라이언트 사이드 생성) |

---

## 📁 디렉토리 구조 (권한별 격리 적용)

Next.js App Router의 Route Group(`(폴더명)`)을 바탕으로 **접근 권한별**로 구조를 깔끔하게 나눴습니다.

```text
src/
 ├── app/[locale]/
 │    ├── (auth)/          # 로그인 / 회원가입 라우트
 │    ├── (dashboard)/     # 👪 부모(USER) 메인 대시보드
 │    ├── (therapist)/     # 🩺 치료사(THERAPIST) 전용 대시보드
 │    ├── (admin)/         # 🛡️ 관리자(ADMIN) 전용 대시보드
 │    ├── api/             # 서버리스 API 핸들러 (Gemini 통신 등)
 │    └── layout.tsx       # 글로벌 레이아웃 설정
 ├── components/
 │    ├── layout/          # 헤더, 바텀 내비게이션, 사이드바(관리자/치료사용)
 │    ├── activity/        # 일별/월별 활동 조회 UI
 │    ├── missions/        # 미션 리스트 등
 │    └── ...
 ├── lib/
 │    ├── supabase/        # 서버/클라이언트 미들웨어 클라이언트
 │    └── gemini.ts        # AI SDK 설정
 ├── types/
 │    └── database.ts      # 타입스크립트 DB 모델 (치료사 맵핑 등)
 ├── i18n/                 # next-intl 다국어 지원 라우팅
 └── middleware.ts         # 🔥 보안 및 다국어 라우팅 (비인가 페이지 직접 차단)
```

---

## 🗄 데이터베이스 스키마 확장

사용자 권한(`role`) 및 안심 리포트를 구현하기 위한 핵심 테이블 구조와 관계입니다.

| 테이블 / 타입 | 설명 |
|--------|------|
| `Profile` | 사용자 프로필 (`role`: "USER" \| "ADMIN" \| "THERAPIST") |
| `Child` | 아이 정보 (나이, 장애 유형, 보호자 ID 연결) |
| `TherapistChildLink`| **[신규]** 치료사-아이 간의 열람 권한 연결 매핑 (상태: pending/active) |
| `TherapySessionLog` | **[신규]** 일일 담당 치료사 선생님 안심 리포트 작성 보관용 |
| `Mission_Logs` | AI 생성 미션 수행 내역 로깅 |
| `Mood_Logs` | 아이의 컨디션, 일일 기분 기록 |

---

## 🚀 로컬 개발환경 실행 가이드

### 1. 환경변수 설정
`.env.local` 파일을 저장소 최상단에 생성하고 아래 내용을 입력합니다.
```bash
# Supabase 연동 변수 (필수)
NEXT_PUBLIC_SUPABASE_URL=여기에_발급받은_URL을_입력하세요
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_발급받은_KEY를_입력하세요

# Google Gemini API 키 (필수)
GEMINI_API_KEY=여기에_발급받은_API키를_입력하세요
```

### 2. 패키지 설치
```bash
npm install
```

### 3. 프로젝트 실행
```bash
npm run dev
```
접속: [http://localhost:3000](http://localhost:3000) (자동으로 `/ko` 또는 `/en`으로 리다이렉트 됩니다.)

---

## 🛡️ 권한 (Role) 테스트 방법 (ADMIN / THERAPIST)

회원가입한 유저는 기본적으로 부모 권한(`USER`)을 가집니다. 다른 권한을 테스트하려면 다음 절차를 따르세요:
1. 애플리케이션에서 새로운 계정으로 회원가입을 진행합니다.
2. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인하여 해당 프로젝트로 이동합니다.
3. `Authentication` > `Users` 탭에서 방금 가입한 유저를 선택합니다.
4. 아래쪽으로 스크롤하여 `User Metadata`를 열고 다음 JSON 값을 추가합니다:
   ```json
   {
     "role": "THERAPIST"   // 또는 "ADMIN"
   }
   ```
5. 수정한 후, 앱을 새로고침하고 브라우저에서 수동으로 `/ko/therapist` 또는 `/ko/admin` 링크를 입력해 접속합니다!

---

<p align="center">
  <strong>AblePath</strong> — 모든 아이에게 가능성의 길을 🌈
</p>
