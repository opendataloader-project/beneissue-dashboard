import type { WorkflowRun } from "@/types/metrics";
import { calculateDelta, calculateROIMetrics } from "@/lib/roi-calculator";

// Helper: 기본 WorkflowRun 생성
function createMockRun(overrides: Partial<WorkflowRun> = {}): WorkflowRun {
  return {
    id: "test-id",
    repo: "test-repo",
    issue_number: 1,
    workflow_type: "triage",
    issue_created_at: "2025-01-01T00:00:00Z",
    workflow_started_at: "2025-01-01T00:00:00Z",
    workflow_completed_at: "2025-01-01T00:01:00Z",
    triage_decision: "valid",
    triage_reason: null,
    duplicate_of: null,
    fix_decision: "auto_eligible",
    priority: "P1",
    story_points: 2,
    assignee: null,
    fix_success: true,
    pr_url: null,
    fix_error: null,
    input_tokens: 1_000_000,
    output_tokens: 500_000,
    created_at: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("calculateROIMetrics", () => {
  describe("Happy Path", () => {
    it("should calculate ROI metrics for a single auto-resolved issue", () => {
      // Given
      const runs = [createMockRun({ fix_decision: "auto_eligible" })];

      // When
      const result = calculateROIMetrics(runs, "application_developer");

      // Then
      expect(result.totalAutoResolvedIssues).toBe(1);
      expect(result.totalStoryPoints).toBe(2);
      expect(result.totalEstimatedHours).toBe(12); // 2 SP = 12 hours
      expect(result.totalHumanCostSaved).toBeCloseTo(30.09 * 12, 1); // hourlyRate * hours
      expect(result.totalAICost).toBeGreaterThan(0);
      expect(result.netSavings).toBeGreaterThan(0);
    });

    it("should calculate costs correctly for triage workflow (Haiku pricing)", () => {
      // Given: 1M input + 500K output tokens with Haiku pricing
      const runs = [
        createMockRun({
          workflow_type: "triage",
          input_tokens: 1_000_000,
          output_tokens: 500_000,
        }),
      ];

      // When
      const result = calculateROIMetrics(runs, "application_developer");

      // Then: Haiku = $1/MTok input, $5/MTok output
      // (1 * 1) + (0.5 * 5) = 1 + 2.5 = $3.5
      expect(result.totalAICost).toBeCloseTo(3.5, 2);
    });

    it("should calculate costs correctly for analyze workflow (Sonnet pricing)", () => {
      // Given: 1M input + 500K output tokens with Sonnet pricing
      const runs = [
        createMockRun({
          workflow_type: "analyze",
          input_tokens: 1_000_000,
          output_tokens: 500_000,
        }),
      ];

      // When
      const result = calculateROIMetrics(runs, "application_developer");

      // Then: Sonnet = $3/MTok input, $15/MTok output
      // (1 * 3) + (0.5 * 15) = 3 + 7.5 = $10.5
      expect(result.totalAICost).toBeCloseTo(10.5, 2);
    });

    it("should aggregate multiple runs for the same issue", () => {
      // Given: same issue, multiple workflow runs
      const runs = [
        createMockRun({
          workflow_type: "triage",
          input_tokens: 500_000,
          output_tokens: 100_000,
        }),
        createMockRun({
          workflow_type: "analyze",
          input_tokens: 500_000,
          output_tokens: 100_000,
        }),
        createMockRun({
          workflow_type: "fix",
          input_tokens: 500_000,
          output_tokens: 100_000,
        }),
      ];

      // When
      const result = calculateROIMetrics(runs, "application_developer");

      // Then: same issue should count as 1, but AI costs should sum
      expect(result.totalAutoResolvedIssues).toBe(1);
      expect(result.totalAICost).toBeGreaterThan(0);
    });

    it("should handle multiple different issues correctly", () => {
      // Given: 3 different issues
      const runs = [
        createMockRun({ issue_number: 1, story_points: 1 }),
        createMockRun({ issue_number: 2, story_points: 2 }),
        createMockRun({ issue_number: 3, story_points: 3 }),
      ];

      // When
      const result = calculateROIMetrics(runs, "application_developer");

      // Then
      expect(result.totalAutoResolvedIssues).toBe(3);
      expect(result.totalStoryPoints).toBe(6); // 1 + 2 + 3
    });
  });

  describe("Edge Cases", () => {
    it("should return zero metrics for empty runs array", () => {
      // Given
      const runs: WorkflowRun[] = [];

      // When
      const result = calculateROIMetrics(runs, "application_developer");

      // Then
      expect(result.totalAutoResolvedIssues).toBe(0);
      expect(result.totalStoryPoints).toBe(0);
      expect(result.totalEstimatedHours).toBe(0);
      expect(result.totalHumanCostSaved).toBe(0);
      expect(result.totalAICost).toBe(0);
      expect(result.netSavings).toBe(0);
      expect(result.roiPercentage).toBe(0);
    });

    it("should use default story points (2) when null", () => {
      // Given
      const runs = [createMockRun({ story_points: null })];

      // When
      const result = calculateROIMetrics(runs, "application_developer");

      // Then: default 2 SP = 12 hours
      expect(result.totalStoryPoints).toBe(2);
      expect(result.totalEstimatedHours).toBe(12);
    });

    it("should handle zero tokens correctly", () => {
      // Given
      const runs = [
        createMockRun({
          input_tokens: 0,
          output_tokens: 0,
        }),
      ];

      // When
      const result = calculateROIMetrics(runs, "application_developer");

      // Then
      expect(result.totalAICost).toBe(0);
    });

    it("should use latest non-null story points when multiple runs exist", () => {
      // Given: first run has SP=null, second has SP=5
      const runs = [
        createMockRun({ story_points: null, workflow_type: "triage" }),
        createMockRun({ story_points: 5, workflow_type: "fix" }),
      ];

      // When
      const result = calculateROIMetrics(runs, "application_developer");

      // Then: should use 5 SP
      expect(result.totalStoryPoints).toBe(5);
      expect(result.totalEstimatedHours).toBe(64); // 5 SP = 64 hours
    });
  });

  describe("Error Cases - Manual Required (Filtered Out)", () => {
    it("should exclude manual_required issues from ROI calculation", () => {
      // Given
      const runs = [createMockRun({ fix_decision: "manual_required" })];

      // When
      const result = calculateROIMetrics(runs, "application_developer");

      // Then: manual_required should be excluded
      expect(result.totalAutoResolvedIssues).toBe(0);
    });

    it("should only count auto-resolved issues when mixed", () => {
      // Given
      const runs = [
        createMockRun({ issue_number: 1, fix_decision: "auto_eligible" }),
        createMockRun({ issue_number: 2, fix_decision: "manual_required" }),
        createMockRun({ issue_number: 3, fix_decision: "comment_only" }),
      ];

      // When
      const result = calculateROIMetrics(runs, "application_developer");

      // Then: auto_eligible and comment_only are counted
      expect(result.totalAutoResolvedIssues).toBe(2);
    });
  });

  describe("Developer Roles", () => {
    it("should apply correct hourly rate for each developer role", () => {
      // Given
      const runs = [createMockRun({ story_points: 1 })]; // 1 SP = 4 hours

      // When & Then: Check different roles
      const appDev = calculateROIMetrics(runs, "application_developer");
      expect(appDev.totalHumanCostSaved).toBeCloseTo(30.09 * 4, 1);

      const sysDev = calculateROIMetrics(runs, "system_developer");
      expect(sysDev.totalHumanCostSaved).toBeCloseTo(26.44 * 4, 1);

      const pm = calculateROIMetrics(runs, "it_pm");
      expect(pm.totalHumanCostSaved).toBeCloseTo(39.64 * 4, 1);

      const architect = calculateROIMetrics(runs, "it_architect");
      expect(architect.totalHumanCostSaved).toBeCloseTo(43.98 * 4, 1);

      const analyst = calculateROIMetrics(runs, "data_analyst");
      expect(analyst.totalHumanCostSaved).toBeCloseTo(33.6 * 4, 1);
    });
  });

  describe("Monthly Trend", () => {
    it("should generate 12 months of trend data", () => {
      // Given
      const runs = [createMockRun()];

      // When
      const result = calculateROIMetrics(runs, "application_developer");

      // Then
      expect(result.monthlyTrend).toHaveLength(12);
    });

    it("should calculate correct ROI percentage for each month", () => {
      // Given: run in current month
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const runs = [
        createMockRun({
          workflow_started_at: now.toISOString(),
        }),
      ];

      // When
      const result = calculateROIMetrics(runs, "application_developer");

      // Then: find current month data
      const currentMonthData = result.monthlyTrend.find(
        (t) => t.period === currentMonth
      );
      expect(currentMonthData).toBeDefined();
      expect(currentMonthData!.issueCount).toBe(1);
      expect(currentMonthData!.roiPercentage).toBeGreaterThan(0);
    });
  });

  describe("Savings Breakdown", () => {
    it("should group savings by story points", () => {
      // Given
      const runs = [
        createMockRun({ issue_number: 1, story_points: 1 }),
        createMockRun({ issue_number: 2, story_points: 1 }),
        createMockRun({ issue_number: 3, story_points: 3 }),
      ];

      // When
      const result = calculateROIMetrics(runs, "application_developer");

      // Then
      const sp1 = result.savingsBreakdown.find((b) => b.storyPoints === 1);
      const sp3 = result.savingsBreakdown.find((b) => b.storyPoints === 3);

      expect(sp1).toBeDefined();
      expect(sp1!.issueCount).toBe(2);
      expect(sp3).toBeDefined();
      expect(sp3!.issueCount).toBe(1);
    });

    it("should calculate correct percentages that sum to 100%", () => {
      // Given
      const runs = [
        createMockRun({ issue_number: 1, story_points: 1 }),
        createMockRun({ issue_number: 2, story_points: 2 }),
        createMockRun({ issue_number: 3, story_points: 3 }),
      ];

      // When
      const result = calculateROIMetrics(runs, "application_developer");

      // Then
      const totalPercentage = result.savingsBreakdown.reduce(
        (sum, b) => sum + b.percentage,
        0
      );
      expect(totalPercentage).toBeCloseTo(100, 0);
    });

    it("should sort breakdown by story points ascending", () => {
      // Given
      const runs = [
        createMockRun({ issue_number: 1, story_points: 5 }),
        createMockRun({ issue_number: 2, story_points: 1 }),
        createMockRun({ issue_number: 3, story_points: 3 }),
      ];

      // When
      const result = calculateROIMetrics(runs, "application_developer");

      // Then
      const points = result.savingsBreakdown.map((b) => b.storyPoints);
      expect(points).toEqual([1, 3, 5]);
    });
  });
});

describe("calculateDelta", () => {
  describe("Happy Path", () => {
    it("should calculate positive delta correctly", () => {
      // Given: 100 -> 150 (50% increase)
      // When
      const result = calculateDelta(150, 100);

      // Then
      expect(result).toBe(50);
    });

    it("should calculate negative delta correctly", () => {
      // Given: 100 -> 75 (25% decrease)
      // When
      const result = calculateDelta(75, 100);

      // Then
      expect(result).toBe(-25);
    });

    it("should return 0 for no change", () => {
      // Given
      const result = calculateDelta(100, 100);

      // Then
      expect(result).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should return 100 when previous is 0 and current is positive", () => {
      // Given: 0 -> 50
      // When
      const result = calculateDelta(50, 0);

      // Then
      expect(result).toBe(100);
    });

    it("should return undefined when both are 0", () => {
      // Given
      const result = calculateDelta(0, 0);

      // Then
      expect(result).toBeUndefined();
    });

    it("should handle negative previous value correctly", () => {
      // Given: -100 -> 50 (150% increase relative to abs(-100))
      // When
      const result = calculateDelta(50, -100);

      // Then: (50 - (-100)) / |-100| * 100 = 150
      expect(result).toBe(150);
    });

    it("should handle decimal values", () => {
      // Given: 10.5 -> 21 (100% increase)
      // When
      const result = calculateDelta(21, 10.5);

      // Then
      expect(result).toBe(100);
    });
  });

  describe("Boundary Cases", () => {
    it("should round to one decimal place", () => {
      // Given: values that would produce many decimal places
      const result = calculateDelta(100, 33);

      // Then: should be rounded
      expect(result).toBe(203); // 203.03... -> 203.0
    });

    it("should handle very small changes", () => {
      // Given
      const result = calculateDelta(100.1, 100);

      // Then
      expect(result).toBe(0.1);
    });
  });
});
