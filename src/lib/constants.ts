// Business constants
export const DEVELOPER_HOURLY_RATE_KRW = 50000; // 5만원/시간
export const USD_TO_KRW = 1400;

// Time estimates in minutes for each workflow type
export const TRIAGE_TIME_MINUTES = 5;
export const ANALYZE_TIME_MINUTES = 30;
export const FIX_TIME_MINUTES = 120;

// Chart colors
export const CHART_COLORS = {
  primary: 'hsl(var(--chart-1))',
  secondary: 'hsl(var(--chart-2))',
  tertiary: 'hsl(var(--chart-3))',
  quaternary: 'hsl(var(--chart-4))',
  quinary: 'hsl(var(--chart-5))',
} as const;

// Decision type labels (Korean)
export const DECISION_LABELS = {
  valid: '유효',
  invalid: '무효',
  duplicate: '중복',
  needsInfo: '정보 필요',
} as const;

// Workflow type labels (Korean)
export const WORKFLOW_LABELS = {
  triage: '분류',
  analyze: '분석',
  fix: '수정',
} as const;
