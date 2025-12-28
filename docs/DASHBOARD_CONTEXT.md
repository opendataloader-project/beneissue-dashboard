# Beneissue 메트릭 대시보드 구현 계획

## 개요

AI 이슈 자동화 성능을 측정하고 시각화하는 웹 대시보드

**목적:**
- 투자자/파트너에게 AX 성과 증명
- 경영진에게 비즈니스 언어로 ROI 설명
- 내부 성능 모니터링

**URL:** `beneissue.opendataloader.org`

---

## 아키텍처

```
[GitHub Actions]
       │
       ▼
[beneissue Python] ──POST──▶ [Supabase PostgreSQL]
                                      │
                              ◀──SELECT──
                                      │
                              [Next.js + Vercel]
                              (API Routes = 비즈니스 로직)
                                      │
                                      ▼
                        beneissue.opendataloader.org
```

**핵심 설계:**
- Python → Supabase 직접 쓰기 (service_key)
- Next.js → Supabase 읽기 전용 (anon_key)
- 별도 백엔드 서버 불필요 (서버리스)

---

## 배포 구조

| 레포 | 도메인 | 역할 |
|------|--------|------|
| `opendataloader/beneissue` | - | Python CLI, 메트릭 수집 |
| `opendataloader/beneissue-dashboard` | beneissue.opendataloader.org | 대시보드 UI |

---

## 기술 스택

| 항목 | 선택 |
|------|------|
| 프론트엔드 | Next.js 15 + shadcn/ui + Recharts |
| DB | Supabase PostgreSQL |
| 호스팅 | Vercel (무료) |
| 인증 | API Key (로그인 불필요) |

**무료 한도:**
- Vercel: 100GB/월 대역폭
- Supabase: 500MB DB, 50K 요청/월

---

## 대시보드 페이지

| 경로 | 인증 | 용도 |
|------|------|------|
| `/` | 없음 | Public Stats (집계 지표만) |
| `/dashboard` | API Key | Executive Dashboard (ROI, 비용절감) |
| `/ops` | API Key | Operations Dashboard (기술 지표) |

---

## 메트릭 정의

### Executive (경영진용)

| 지표 | 계산 |
|------|------|
| 시간 절감 | `triage×5분 + analyze×30분 + fix×120분` |
| 비용 절감 | `절감시간 × 시급(5만원) - AI비용` |
| ROI | `(절감비용 - AI비용) / AI비용 × 100` |
| 처리량 | 총 처리 이슈 수 |

### Operations (운영팀용)

| 지표 | 계산 |
|------|------|
| AI 필터링율 | `(invalid + duplicate) / total × 100` |
| 자동 해결율 | `(invalid + duplicate + needs_info + fix_completed + comment_only) / total × 100` |
| 평균 응답 시간 | `avg(first_response - issue_created)` |
| 토큰 사용량 | 누적 input/output 토큰 |

**자동 해결 = 인간 개입 없이 종료 가능한 케이스:**
- `triage/invalid` - 유효하지 않은 이슈
- `triage/duplicate` - 중복 이슈
- `triage/needs-info` - 정보 요청 후 대기
- `fix/completed` - PR 자동 생성 완료
- `fix/comment-only` - 코멘트로 해결 (코드 변경 불필요)

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
│  │ [차트]               │ │ [파이차트]            │ │
│  └─────────────────────┘ └───────────────────────┘ │
│                                                     │
│  "이번 달 AI가 1,247건 처리, 152시간 절약, ROI 847%" │
└─────────────────────────────────────────────────────┘
```
