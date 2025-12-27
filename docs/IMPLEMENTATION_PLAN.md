# Beneissue Dashboard 구현 계획

## 개요
AI 이슈 자동화 성능을 시각화하는 3페이지 웹 대시보드

## 페이지 구조
| 경로 | 용도 | 인증 |
|------|------|------|
| `/` | Public Stats - 투자자/파트너용 집계 지표 | 없음 |
| `/dashboard` | Executive Dashboard - ROI, 비용절감 | MVP: 없음 |
| `/ops` | Operations Dashboard - 기술 지표 | MVP: 없음 |

## 현재 프로젝트 상태
- Next.js 16.1.1 + React 19 (Pages Router)
- Tailwind CSS v4 + shadcn/ui 설정 완료
- lucide-react 아이콘 설치됨
- `src/lib/utils.ts`에 `cn()` 유틸리티 존재

## 구현 순서

### Phase 1: 의존성 설치
```bash
pnpm add recharts @supabase/supabase-js jotai date-fns
npx shadcn@latest add card button badge skeleton
```

**상태 관리**: Jotai 사용 (atomic state management)

### Phase 2: 타입 및 유틸리티
1. `src/types/metrics.ts` - 메트릭 타입 정의
2. `src/lib/constants.ts` - 비즈니스 상수 (시급, 환율 등)
3. `src/lib/metrics.ts` - 메트릭 계산 함수
4. `src/lib/format.ts` - 숫자/날짜 포맷팅
5. `src/data/mock.ts` - 개발용 목업 데이터
6. `src/store/atoms.ts` - Jotai atoms (메트릭 상태, 날짜 필터 등)

### Phase 3: Public Stats 페이지 (`/`)
**목표**: 투자자에게 보여줄 랜딩 페이지

**구성요소**:
- Hero 섹션 + 타이틀
- 4개 StatCard: 총 처리이슈, 평균응답시간, 자동해결율, ROI
- 월별 추이 차트 (Line Chart)
- 푸터

**파일**:
- `src/pages/index.tsx` (기존 파일 대체)
- `src/components/stats/stat-card.tsx`
- `src/components/charts/trend-line-chart.tsx`
- `src/components/layout/header.tsx`
- `src/components/layout/footer.tsx`

### Phase 4: Executive Dashboard (`/dashboard`)
**목표**: 경영진용 ROI/비용절감 대시보드

**구성요소**:
- 4개 KPICard (delta 표시): ROI, 시간절감, 비용절감, 처리건수
- 월별 비용절감 추이 차트
- AI 처리 분포 파이차트
- 요약 문장

**파일**:
- `src/pages/dashboard.tsx`
- `src/components/stats/kpi-card.tsx`
- `src/components/charts/cost-savings-chart.tsx`
- `src/components/charts/distribution-pie.tsx`
- `src/components/layout/dashboard-layout.tsx`

### Phase 5: Operations Dashboard (`/ops`)
**목표**: 운영팀용 기술 지표 대시보드

**구성요소**:
- 4개 KPICard: AI필터링율, 자동해결율, 평균응답시간, AI비용
- 일별 처리량 추이 차트
- 결정 분포 도넛차트
- 처리 단계별 시간

**파일**:
- `src/pages/ops.tsx`
- `src/components/charts/daily-trend-chart.tsx`
- `src/components/charts/decision-distribution.tsx`

### Phase 6: API 연동 (선택)
- `src/lib/supabase.ts` - Supabase 클라이언트
- `src/pages/api/metrics/public.ts`
- `src/pages/api/metrics/executive.ts`
- `src/pages/api/metrics/operations.ts`

## 메트릭 계산 공식
```typescript
// 시간 절감 (분)
savedMinutes = triageCount * 5 + analyzeCount * 30 + fixSuccessCount * 120

// 비용 절감 (원)
savedCost = (savedMinutes / 60) * 50000  // 5만원/시간
aiCost = totalCostUsd * 1400
netSavings = savedCost - aiCost

// ROI (%)
roi = ((netSavings - aiCost) / aiCost) * 100

// AI 필터링율 (%)
aiFilteringRate = ((invalidCount + duplicateCount) / totalIssues) * 100

// 자동 해결율 (%)
autoResolutionRate = (fixSuccessCount / fixAttemptedCount) * 100
```

## 디자인 방향
frontend-design 스킬 활용하여 창의적인 디자인 적용:
- 독특한 폰트 선택 (Inter, Roboto 제외)
- 대담한 색상 팔레트
- 미세 인터랙션과 애니메이션
- 기억에 남는 비주얼 아이덴티티

## 수정할 주요 파일
- `src/pages/index.tsx` - Public Stats로 교체
- `src/styles/globals.css` - 커스텀 색상/폰트 추가
- `src/pages/_document.tsx` - 커스텀 폰트 로드

## 새로 생성할 파일
```
src/
├── components/
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── dashboard-layout.tsx
│   ├── stats/
│   │   ├── stat-card.tsx
│   │   └── kpi-card.tsx
│   └── charts/
│       ├── trend-line-chart.tsx
│       ├── distribution-pie.tsx
│       ├── cost-savings-chart.tsx
│       └── daily-trend-chart.tsx
├── pages/
│   ├── dashboard.tsx
│   └── ops.tsx
├── lib/
│   ├── constants.ts
│   ├── metrics.ts
│   ├── format.ts
│   └── supabase.ts
├── types/
│   └── metrics.ts
├── data/
│   └── mock.ts
└── store/
    └── atoms.ts
```
