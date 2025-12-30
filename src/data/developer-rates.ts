import type {
  DeveloperRate,
  DeveloperRole,
  StoryPointMapping,
} from "@/types/roi";

/**
 * Korea SW Association 2025 SW Engineer Average Wages
 * Source: https://www.sw.or.kr/site/sw/ex/board/View.do?cbIdx=304&bcIdx=57938
 *
 * Labor cost = Base salary + Allowances + Bonuses + Retirement fund + Social insurance
 * Hourly wage = Daily wage / 8 hours
 * Daily wage = Monthly wage / 20.6 days (2024 average working days)
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
 * Story Points to Work Hours Mapping
 *
 * Criteria:
 * - 1 SP: <1 day (very simple task)
 * - 2 SP: 1-2 days (simple task) - default
 * - 3 SP: 3-5 days (typical task)
 * - 5 SP: 6-10 days (large task with complexity)
 * - 8 SP: 10+ days (very complex task)
 *
 * avgHours = median value based on 8 hours per day
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

// Default value when Story Points is NULL
export const DEFAULT_STORY_POINTS = 2;

// USD to KRW exchange rate (default)
export const DEFAULT_USD_TO_KRW = 1400;

// Developer role list (for dropdown)
export const DEVELOPER_ROLE_OPTIONS: DeveloperRole[] = [
  "application_developer",
  "system_developer",
  "it_pm",
  "it_architect",
  "data_analyst",
];

/**
 * Returns average hours from Story Points
 */
export function getHoursFromStoryPoints(storyPoints: number): number {
  const mapping = STORY_POINT_MAPPINGS.find((m) => m.points === storyPoints);
  if (mapping) {
    return mapping.avgHours;
  }
  // Use default value (2SP) if mapping not found
  return STORY_POINT_MAPPINGS[1].avgHours;
}
