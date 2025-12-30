import type {
  DeveloperRate,
  DeveloperRole,
  StoryPointMapping,
} from "@/types/roi";

/**
 * 한국SW협회 2025년 SW기술자 평균임금
 * 출처: https://www.sw.or.kr/site/sw/ex/board/View.do?cbIdx=304&bcIdx=57938
 *
 * 인건비 = 기본급 + 제수당 + 상여금 + 퇴직급여충당금 + 4대보험 포함
 * 시간평균임금 = 일평균임금 ÷ 8시간
 * 일평균임금 = 월평균임금 ÷ 20.6일 (2024년 평균근무일수)
 */
export const DEVELOPER_RATES: Record<DeveloperRole, DeveloperRate> = {
  application_developer: {
    role: "application_developer",
    labelKo: "응용SW개발자",
    labelEn: "Application Developer",
    hourlyRateKRW: 42133,
    hourlyRateUSD: 30.09, // KRW / 1400
  },
  system_developer: {
    role: "system_developer",
    labelKo: "시스템SW개발자",
    labelEn: "System Developer",
    hourlyRateKRW: 37009,
    hourlyRateUSD: 26.44,
  },
  it_pm: {
    role: "it_pm",
    labelKo: "IT PM",
    labelEn: "IT PM",
    hourlyRateKRW: 55494,
    hourlyRateUSD: 39.64,
  },
  it_architect: {
    role: "it_architect",
    labelKo: "IT아키텍트",
    labelEn: "IT Architect",
    hourlyRateKRW: 61576,
    hourlyRateUSD: 43.98,
  },
  data_analyst: {
    role: "data_analyst",
    labelKo: "데이터분석가",
    labelEn: "Data Analyst",
    hourlyRateKRW: 47034,
    hourlyRateUSD: 33.6,
  },
};

/**
 * Story Points → 작업 시간 변환 매핑
 *
 * 기준:
 * - 1 SP: <1일 (매우 간단한 작업)
 * - 2 SP: 1-2일 (간단한 작업) - 기본값
 * - 3 SP: 3-5일 (일반적인 작업)
 * - 5 SP: 6-10일 (큰 작업, 복잡도 있음)
 * - 8 SP: 10일+ (매우 복잡한 작업)
 *
 * avgHours = 1일 8시간 기준 중간값 계산
 */
export const STORY_POINT_MAPPINGS: StoryPointMapping[] = [
  {
    points: 1,
    minDays: 0,
    maxDays: 1,
    avgHours: 4,
    descriptionKo: "1일 미만",
    descriptionEn: "Less than 1 day",
  },
  {
    points: 2,
    minDays: 1,
    maxDays: 2,
    avgHours: 12,
    descriptionKo: "1-2일",
    descriptionEn: "1-2 days",
  },
  {
    points: 3,
    minDays: 3,
    maxDays: 5,
    avgHours: 32,
    descriptionKo: "3-5일",
    descriptionEn: "3-5 days",
  },
  {
    points: 5,
    minDays: 6,
    maxDays: 10,
    avgHours: 64,
    descriptionKo: "6-10일",
    descriptionEn: "6-10 days",
  },
  {
    points: 8,
    minDays: 10,
    maxDays: Infinity,
    avgHours: 96,
    descriptionKo: "10일 이상",
    descriptionEn: "10+ days",
  },
];

// Story Points NULL일 때 기본값
export const DEFAULT_STORY_POINTS = 2;

// USD → KRW 환율 (기본값)
export const DEFAULT_USD_TO_KRW = 1400;

// 개발자 역할 목록 (드롭다운용)
export const DEVELOPER_ROLE_OPTIONS: DeveloperRole[] = [
  "application_developer",
  "system_developer",
  "it_pm",
  "it_architect",
  "data_analyst",
];

/**
 * Story Points로 평균 시간(hours) 반환
 */
export function getHoursFromStoryPoints(storyPoints: number): number {
  const mapping = STORY_POINT_MAPPINGS.find((m) => m.points === storyPoints);
  if (mapping) {
    return mapping.avgHours;
  }
  // 매핑에 없는 경우 기본값(2SP) 사용
  return STORY_POINT_MAPPINGS[1].avgHours;
}
