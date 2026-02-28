<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Supabase-Auth_&_DB-3FCF8E?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Gemini_1.5_Flash-AI-4285F4?logo=google" alt="Gemini" />
</p>

# 🌈 AblePath

**전 세계 발달 장애 아동 가정을 위한 AI 기반 홈 케어 솔루션**

전문 치료 시설 접근이 어려운 가정에 저비용·고효율 발달 지원 가이드를 제공합니다.  
Gemini AI 전문가가 아이의 상태를 분석하고, 집에서 할 수 있는 놀이 치료 미션을 매일 제안합니다.

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| **🤖 AI 맞춤 미션** | Gemini 1.5 Flash가 아이의 발달 유형·고민을 분석하여 언어·감각통합·인지 3영역 놀이 치료 미션 생성 |
| **📋 3단계 위자드 폼** | 기본 정보 → 발달 유형 → 현재 고민을 입력하면 즉시 전문가 수준의 맞춤 미션 제공 |
| **😊 기분 기록** | 매일 아이의 기분을 기록하여 정서 추이 파악 |
| **📊 활동 기록 & 통계** | 타임라인, 주간 차트, 월간 통계 + AI 성취 요약 |
| **📄 PDF 리포트** | @react-pdf/renderer 기반 전문 의료 문서 스타일의 월간 발달 리포트 (Radar Chart, 세부 지표, 전문가 제언) |
| **🌍 다국어 지원** | 한국어, English (next-intl, PDF 내부 텍스트 포함) |
| **🔒 개인정보 보호** | 비식별화된 데이터만 AI에 전달, Supabase RLS로 데이터 격리 |

---

## 🛠 기술 스택

| 분류 | 기술 |
|------|------|
| **Framework** | Next.js 16.1.6 (App Router, React Compiler, Turbopack) |
| **UI** | Tailwind CSS v4, Lucide Icons, Recharts |
| **Auth & DB** | Supabase (Auth + PostgreSQL + RLS) |
| **AI** | Google Gemini 1.5 Flash (`@google/generative-ai`) |
| **i18n** | next-intl (로케일별 라우팅 `[locale]`) |
| **PDF** | @react-pdf/renderer (클라이언트 사이드 생성) |
| **Deployment** | Vercel |

---

## 📁 프로젝트 구조

```
ablepath/
├── src/
│   ├── app/[locale]/
│   │   ├── (auth)/          # 로그인 / 회원가입
│   │   ├── (dashboard)/     # 메인 앱
│   │   │   ├── page.tsx           # 대시보드
│   │   │   ├── missions/          # AI 미션 생성 (3단계 위자드)
│   │   │   ├── mood/              # 기분 기록
│   │   │   ├── activity/          # 활동 기록 & 월간 통계
│   │   │   ├── report/            # 주간 리포트 & PDF 다운로드
│   │   │   ├── ai-guide/          # AI 가이드 채팅
│   │   │   └── settings/          # 설정
│   │   └── layout.tsx
│   ├── components/
│   │   ├── layout/           # Sidebar, BottomNav
│   │   ├── missions/         # 미션 위자드 폼
│   │   ├── activity/         # 활동 기록, 월간 통계
│   │   ├── reports/          # PDF 리포트 (Template + Generator)
│   │   ├── report/           # 주간 차트, 무드 요약
│   │   └── ...
│   ├── lib/
│   │   ├── gemini.ts         # Gemini AI 클라이언트 (구조화된 JSON 출력)
│   │   └── supabase/         # Supabase 클라이언트 (server / client)
│   ├── i18n/                 # next-intl 설정
│   └── middleware.ts         # 인증 & 로케일 미들웨어
├── messages/
│   ├── ko.json               # 한국어
│   └── en.json               # English
├── public/                   # 정적 파일
└── package.json
```

---

## 🚀 로컬 실행 방법

### 1. 사전 요구사항

- **Node.js** 20+
- **npm** 10+
- [Supabase](https://supabase.com) 프로젝트 (무료 티어)
- [Google AI Studio](https://aistudio.google.com) API 키 (Gemini 1.5 Flash, 무료)

### 2. 저장소 클론 & 의존성 설치

```bash
git clone https://github.com/<your-username>/ablepath.git
cd ablepath
npm install
```

### 3. 환경변수 설정

`.env.local` 파일을 프로젝트 루트에 생성합니다:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Gemini AI
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Supabase 데이터베이스 설정

Supabase 대시보드의 **SQL Editor**에서 `supabase/schema.sql` 스크립트를 실행하여 테이블, RLS 정책, 인덱스를 생성합니다.

### 5. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인합니다.

### 6. 빌드 & 프로덕션

```bash
npm run build
npm start
```

---

## 🌐 Vercel 배포

1. [Vercel](https://vercel.com)에서 GitHub 저장소를 연결합니다.
2. **Root Directory**를 `ablepath` (또는 저장소 루트)로 설정합니다.
3. **Environment Variables**에 위의 `.env.local` 값을 추가합니다.
4. 배포 후 `NEXT_PUBLIC_APP_URL`을 실제 도메인으로 변경합니다.

---

## 🗄 데이터베이스 스키마

| 테이블 | 설명 |
|--------|------|
| `profiles` | 사용자 프로필 (display_name, avatar_url) |
| `children` | 아이 정보 (name, birth_date, gender, disability_type) |
| `missions` | AI 생성 미션 (category, title, guide, materials) |
| `mission_logs` | 미션 수행 로그 (status, completed_at) |
| `mood_logs` | 일일 기분 기록 |
| `ai_chat_logs` | AI 대화 로그 (JSON 응답 포함) |

> 모든 테이블에 RLS(Row Level Security) 정책이 적용되어 사용자 간 데이터가 격리됩니다.

---

## 📜 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (Turbopack) |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 실행 |

---

## 📄 라이선스

MIT License

---

<p align="center">
  <strong>AblePath</strong> — 모든 아이에게 가능성의 길을 🌈
</p>
# fulfilled-ablepath
