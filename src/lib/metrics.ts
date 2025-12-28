import {
  ANALYZE_TIME_MINUTES,
  DEVELOPER_HOURLY_RATE_KRW,
  FIX_TIME_MINUTES,
  TRIAGE_TIME_MINUTES,
  USD_TO_KRW,
} from "./constants";

/**
 * Calculate total saved minutes based on workflow counts
 */
export function calculateSavedMinutes(
  triageCount: number,
  analyzeCount: number,
  fixSuccessCount: number
): number {
  return (
    triageCount * TRIAGE_TIME_MINUTES +
    analyzeCount * ANALYZE_TIME_MINUTES +
    fixSuccessCount * FIX_TIME_MINUTES
  );
}

/**
 * Calculate cost savings in KRW
 */
export function calculateCostSavings(
  savedMinutes: number,
  totalCostUsd: number
): { savedCost: number; aiCost: number; netSavings: number } {
  const savedCost = (savedMinutes / 60) * DEVELOPER_HOURLY_RATE_KRW;
  const aiCost = totalCostUsd * USD_TO_KRW;
  const netSavings = savedCost - aiCost;
  return { savedCost, aiCost, netSavings };
}

/**
 * Calculate ROI percentage
 */
export function calculateROI(netSavings: number, aiCost: number): number {
  if (aiCost === 0) return 0;
  return ((netSavings - aiCost) / aiCost) * 100;
}

/**
 * Calculate AI filtering rate (invalid + duplicate issues)
 */
export function calculateAIFilteringRate(
  invalidCount: number,
  duplicateCount: number,
  totalIssues: number
): number {
  if (totalIssues === 0) return 0;
  return ((invalidCount + duplicateCount) / totalIssues) * 100;
}

/**
 * Calculate auto resolution rate
 * Auto-resolved = cases that can be closed without human intervention:
 * - triage/invalid: Invalid issues
 * - triage/duplicate: Duplicate issues
 * - triage/needs-info: Waiting for info (auto-labeled)
 * - fix/completed: PR auto-generated
 * - fix/comment-only: Resolved via comment (no code change needed)
 */
export function calculateAutoResolutionRate(
  invalidCount: number,
  duplicateCount: number,
  needsInfoCount: number,
  fixSuccessCount: number,
  commentOnlyCount: number,
  totalIssues: number
): number {
  if (totalIssues === 0) return 0;
  const autoResolved =
    invalidCount +
    duplicateCount +
    needsInfoCount +
    fixSuccessCount +
    commentOnlyCount;
  return (autoResolved / totalIssues) * 100;
}

/**
 * Calculate delta (percentage change) between two values
 */
export function calculateDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}
