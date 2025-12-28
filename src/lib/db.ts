import { supabase, isSupabaseConfigured } from './supabase';
import type { DailyMetrics, WorkflowRun } from '@/types/metrics';

/**
 * Fetch daily metrics for a date range
 */
export async function fetchDailyMetrics(
  startDate: string,
  endDate: string
): Promise<DailyMetrics[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('daily_metrics')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching daily metrics:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch aggregated metrics for a specific month
 */
export async function fetchMonthlyAggregates(year: number, month: number) {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month

  const { data, error } = await supabase
    .from('daily_metrics')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) {
    console.error('Error fetching monthly aggregates:', error);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  // Aggregate the daily data
  const aggregated = data.reduce(
    (acc, day) => {
      const hasResponseTime = day.avg_first_response_seconds != null && day.avg_first_response_seconds > 0;
      const newResponseCount = acc.responseCount + (hasResponseTime ? 1 : 0);
      const newTotalResponseSeconds = acc.totalResponseSeconds + (hasResponseTime ? day.avg_first_response_seconds : 0);

      return {
        totalRuns: acc.totalRuns + (day.total_runs || 0),
        uniqueIssues: acc.uniqueIssues + (day.unique_issues || 0),
        triageCount: acc.triageCount + (day.triage_count || 0),
        analyzeCount: acc.analyzeCount + (day.analyze_count || 0),
        fixCount: acc.fixCount + (day.fix_count || 0),
        aiFilteredCount: acc.aiFilteredCount + (day.ai_filtered_count || 0),
        validCount: acc.validCount + (day.valid_count || 0),
        duplicateCount: acc.duplicateCount + (day.duplicate_count || 0),
        needsInfoCount: acc.needsInfoCount + (day.needs_info_count || 0),
        fixAttemptedCount: acc.fixAttemptedCount + (day.fix_attempted_count || 0),
        fixSuccessCount: acc.fixSuccessCount + (day.fix_success_count || 0),
        commentOnlyCount: acc.commentOnlyCount + (day.comment_only_count || 0),
        totalCostUsd: acc.totalCostUsd + (day.total_input_cost || 0) + (day.total_output_cost || 0),
        totalResponseSeconds: newTotalResponseSeconds,
        responseCount: newResponseCount,
      };
    },
    {
      totalRuns: 0,
      uniqueIssues: 0,
      triageCount: 0,
      analyzeCount: 0,
      fixCount: 0,
      aiFilteredCount: 0,
      validCount: 0,
      duplicateCount: 0,
      needsInfoCount: 0,
      fixAttemptedCount: 0,
      fixSuccessCount: 0,
      commentOnlyCount: 0,
      totalCostUsd: 0,
      totalResponseSeconds: 0,
      responseCount: 0,
    }
  );

  return {
    ...aggregated,
    avgResponseSeconds:
      aggregated.responseCount > 0
        ? aggregated.totalResponseSeconds / aggregated.responseCount
        : 0,
  };
}

/**
 * Fetch total cumulative metrics
 */
export async function fetchTotalMetrics() {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const { data, error } = await supabase.from('daily_metrics').select('*');

  if (error) {
    console.error('Error fetching total metrics:', error);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  const aggregated = data.reduce(
    (acc, day) => ({
      totalRuns: acc.totalRuns + (day.total_runs || 0),
      uniqueIssues: acc.uniqueIssues + (day.unique_issues || 0),
      triageCount: acc.triageCount + (day.triage_count || 0),
      analyzeCount: acc.analyzeCount + (day.analyze_count || 0),
      fixCount: acc.fixCount + (day.fix_count || 0),
      aiFilteredCount: acc.aiFilteredCount + (day.ai_filtered_count || 0),
      fixAttemptedCount: acc.fixAttemptedCount + (day.fix_attempted_count || 0),
      fixSuccessCount: acc.fixSuccessCount + (day.fix_success_count || 0),
      commentOnlyCount: acc.commentOnlyCount + (day.comment_only_count || 0),
      validCount: acc.validCount + (day.valid_count || 0),
      duplicateCount: acc.duplicateCount + (day.duplicate_count || 0),
      needsInfoCount: acc.needsInfoCount + (day.needs_info_count || 0),
      totalCostUsd: acc.totalCostUsd + (day.total_input_cost || 0) + (day.total_output_cost || 0),
      totalResponseSeconds:
        acc.totalResponseSeconds + (day.avg_first_response_seconds || 0),
      responseCount:
        acc.responseCount + (day.avg_first_response_seconds ? 1 : 0),
    }),
    {
      totalRuns: 0,
      uniqueIssues: 0,
      triageCount: 0,
      analyzeCount: 0,
      fixCount: 0,
      aiFilteredCount: 0,
      fixAttemptedCount: 0,
      fixSuccessCount: 0,
      commentOnlyCount: 0,
      validCount: 0,
      duplicateCount: 0,
      needsInfoCount: 0,
      totalCostUsd: 0,
      totalResponseSeconds: 0,
      responseCount: 0,
    }
  );

  return {
    ...aggregated,
    avgResponseSeconds:
      aggregated.responseCount > 0
        ? aggregated.totalResponseSeconds / aggregated.responseCount
        : 0,
  };
}

/**
 * Fetch monthly trend data for the last N months
 */
export async function fetchMonthlyTrend(months: number = 6) {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const now = new Date();
  const results = [];

  for (let i = months - 1; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;

    const monthData = await fetchMonthlyAggregates(year, month);
    if (monthData) {
      results.push({
        month: `${year}-${String(month).padStart(2, '0')}`,
        ...monthData,
      });
    }
  }

  return results;
}

/**
 * Fetch workflow runs for detailed analysis
 */
export async function fetchWorkflowRuns(
  limit: number = 100
): Promise<WorkflowRun[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('workflow_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching workflow runs:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch average processing times by workflow type
 */
export async function fetchProcessingTimes() {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const { data, error } = await supabase.from('workflow_runs').select(`
      workflow_type,
      workflow_started_at,
      workflow_completed_at
    `);

  if (error) {
    console.error('Error fetching processing times:', error);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  // Calculate average processing time per workflow type
  const timesByType: Record<string, { total: number; count: number }> = {};

  data.forEach((run) => {
    if (run.workflow_started_at && run.workflow_completed_at && run.workflow_type) {
      const start = new Date(run.workflow_started_at).getTime();
      const end = new Date(run.workflow_completed_at).getTime();
      const durationSeconds = (end - start) / 1000;

      if (!timesByType[run.workflow_type]) {
        timesByType[run.workflow_type] = { total: 0, count: 0 };
      }
      timesByType[run.workflow_type].total += durationSeconds;
      timesByType[run.workflow_type].count += 1;
    }
  });

  return {
    triageSeconds: timesByType['triage']
      ? Math.round(timesByType['triage'].total / timesByType['triage'].count)
      : 0,
    analyzeSeconds: timesByType['analyze']
      ? Math.round(timesByType['analyze'].total / timesByType['analyze'].count)
      : 0,
    fixSeconds: timesByType['fix']
      ? Math.round(timesByType['fix'].total / timesByType['fix'].count)
      : 0,
  };
}
