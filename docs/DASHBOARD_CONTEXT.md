# beneissue-dashboard 개발 컨텍스트

이 문서는 `beneissue-dashboard` 레포에서 Claude Code로 개발을 시작할 때 참조할 컨텍스트입니다.

## 개요

AI 이슈 자동화 성능을 측정하고 시각화하는 웹 대시보드

**목적:**
- 투자자/파트너에게 AX 성과 증명
- 경영진에게 비즈니스 언어로 ROI 설명
- 내부 성능 모니터링

## 프로젝트 개요

beneissue의 메트릭을 시각화하는 웹 대시보드.

## 아키텍처

```
[GitHub Actions]
       │
       ▼
[beneissue Python] ──POST──▶ [Supabase PostgreSQL]
                                      │
                              ◀──SELECT──
                                      │
                              [Next.js + Vercel]  ← 이 레포
                              (API Routes = 비즈니스 로직)
                                      │
                                      ▼
                        beneissue.opendataloader.org
```

## 기술 스택

- **Framework:** Next.js 16 (Page Router)
- **UI:** shadcn/ui + Tailwind CSS
- **Charts:** Recharts
- **DB:** Supabase PostgreSQL (읽기 전용)
- **Hosting:** Vercel
- **Auth:** API Key (로그인 불필요)

## 페이지 구조

| 경로 | 인증 | 용도 |
|------|------|------|
| `/` | 없음 | Public Stats (집계 지표만) |
| `/dashboard` | API Key | Executive Dashboard (ROI, 비용절감) |
| `/ops` | API Key | Operations Dashboard (기술 지표) |

## Supabase 테이블 스키마

### workflow_runs
```sql
CREATE TABLE workflow_runs (
    id UUID PRIMARY KEY,
    repo VARCHAR(255) NOT NULL,
    issue_number INTEGER NOT NULL,
    workflow_type VARCHAR(20),           -- triage/analyze/fix/full

    -- Timestamps
    issue_created_at TIMESTAMPTZ,
    workflow_started_at TIMESTAMPTZ,
    workflow_completed_at TIMESTAMPTZ,

    -- Triage
    triage_decision VARCHAR(20),         -- valid/invalid/duplicate/needs_info
    triage_reason TEXT,
    duplicate_of INTEGER,

    -- Analyze
    fix_decision VARCHAR(20),            -- auto_eligible/manual_required/comment_only
    priority VARCHAR(5),                 -- P0/P1/P2
    story_points INTEGER,
    assignee VARCHAR(100),

    -- Fix
    fix_success BOOLEAN,
    pr_url VARCHAR(500),
    fix_error TEXT,

    -- Token usage
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    total_cost_usd DECIMAL(10, 6) DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### daily_metrics
```sql
CREATE TABLE daily_metrics (
    id UUID PRIMARY KEY,
    date DATE NOT NULL,
    repo VARCHAR(255),

    total_issues INTEGER DEFAULT 0,
    triage_count INTEGER DEFAULT 0,
    analyze_count INTEGER DEFAULT 0,
    fix_count INTEGER DEFAULT 0,

    ai_filtered_count INTEGER DEFAULT 0,
    valid_count INTEGER DEFAULT 0,
    duplicate_count INTEGER DEFAULT 0,
    needs_info_count INTEGER DEFAULT 0,

    fix_attempted_count INTEGER DEFAULT 0,
    fix_success_count INTEGER DEFAULT 0,

    avg_first_response_seconds DECIMAL,
    total_cost_usd DECIMAL(10, 4) DEFAULT 0,

    UNIQUE(date, repo)
);
```

## 메트릭 계산 공식

### Executive (경영진용)
```typescript
// 시간 절감 (분)
const savedMinutes =
  triageCount * 5 +      // 이슈 분류 5분
  analyzeCount * 30 +    // 이슈 분석 30분
  fixSuccessCount * 120; // 코드 수정 120분

// 비용 절감 (원)
const developerHourlyRate = 50000; // 5만원/시간
const savedCost = (savedMinutes / 60) * developerHourlyRate;
const aiCost = totalCostUsd * 1400; // 환율
const netSavings = savedCost - aiCost;

// ROI (%)
const roi = ((netSavings - aiCost) / aiCost) * 100;
```

### Operations (운영팀용)
```typescript
// AI 필터링율 (%)
const aiFilteringRate = ((invalidCount + duplicateCount) / totalIssues) * 100;

// 자동 해결율 (%)
const autoResolutionRate = (fixSuccessCount / fixAttemptedCount) * 100;
```

## 환경 변수

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx  # 읽기 전용
DASHBOARD_API_KEY=xxx              # /dashboard, /ops 접근용
```

## 프로젝트 초기 설정

```bash
npx create-next-app@latest beneissue-dashboard --typescript --tailwind --app
cd beneissue-dashboard
npx shadcn@latest init
npx shadcn@latest add card button table
npm install @supabase/supabase-js recharts
```

## 디렉토리 구조

```
beneissue-dashboard/
├── app/
│   ├── page.tsx              # / - Public Stats
│   ├── dashboard/
│   │   └── page.tsx          # /dashboard - Executive
│   ├── ops/
│   │   └── page.tsx          # /ops - Operations
│   └── api/
│       └── metrics/
│           └── route.ts      # 비즈니스 로직
├── components/
│   ├── ui/                   # shadcn
│   └── charts/
│       ├── roi-card.tsx
│       ├── trend-chart.tsx
│       └── distribution-pie.tsx
├── lib/
│   ├── supabase.ts           # Supabase 클라이언트
│   └── metrics.ts            # 메트릭 계산 함수
└── middleware.ts             # API Key 인증
```

## 접근 제어

| 데이터 | 공개 여부 |
|--------|----------|
| 총 건수, ROI, 평균값 | 공개 (`/`) |
| 이슈 제목/내용, PR URL | 비공개 (`/dashboard`) |
| 레포명, 사용자명 | 비공개 (`/dashboard`) |

## 와이어프레임

### Public Stats (/)
```
┌─────────────────────────────────────────────────────┐
│  Beneissue - AI Issue Automation                    │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │  12,847  │ │   45초   │ │   32%    │ │  847%  │ │
│  │ 처리이슈  │ │ 평균응답  │ │ 자동해결  │ │  ROI   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│  [────────────────────────] 월별 추이               │
└─────────────────────────────────────────────────────┘
```

### Executive Dashboard (/dashboard)
```
┌─────────────────────────────────────────────────────┐
│  Executive Dashboard              [이번 달▾] [Export]│
├─────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ 847% ROI │ │ 152시간  │ │₩7,600,000│ │ 1,247건│ │
│  │ ▲+23%   │ │ ▲+15%   │ │ ▲+18%   │ │ ▲+31% │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│                                                     │
│  ┌─────────────────────┐ ┌───────────────────────┐ │
│  │ 월별 비용 절감 추이    │ │ AI 처리 분포          │ │
│  │ [라인차트]           │ │ [파이차트]            │ │
│  └─────────────────────┘ └───────────────────────┘ │
│                                                     │
│  "이번 달 AI가 1,247건 처리, 152시간 절약, ROI 847%" │
└─────────────────────────────────────────────────────┘
```

## 구현 우선순위

1. Supabase 클라이언트 설정 (`lib/supabase.ts`)
2. Public Stats 페이지 (`/`)
3. 메트릭 계산 함수 (`lib/metrics.ts`)
4. Executive Dashboard (`/dashboard`)
5. API Key 미들웨어 (`middleware.ts`)
6. Operations Dashboard (`/ops`)
7. Vercel 배포

## 참고

- 전체 계획: `beneissue/docs/DASHBOARD_PLAN.md`
- Supabase SQL: `beneissue/scripts/sql/001_create_tables.sql`
- Python 메트릭 수집: `beneissue/src/beneissue/metrics/`
