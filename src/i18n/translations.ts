export const translations = {
  ko: {
    // Header
    dashboard: "대시보드",

    // Menu
    dataSource: "데이터 소스",
    demo: "데모",
    demoDesc: "고정 샘플 데이터",
    live: "라이브",
    liveDesc: "실제 데이터베이스",
    language: "언어",
    korean: "한국어",
    english: "English",

    // Home Page
    liveMetrics: "Live Metrics",
    heroTitle1: "AI-Powered Issue",
    heroTitle2: "Automation",
    heroSubtitle:
      "GitHub 이슈를 자동으로 분류하고 분석하고 수정합니다. 개발자 시간을 절약하고 ROI를 극대화하세요.",
    totalProcessed: "총 처리량",
    cumulativeProcessed: "누적 처리량",
    autoResolutionRate: "자동 해결율",
    aiDirectFix: "AI가 직접 수정",
    avgResponseTime: "평균 응답 시간",
    toFirstResponse: "첫 응답까지",
    totalAICost: "총 AI 비용",
    totalAPICost: "총 API 비용",
    issuesUnit: "건",
    secondsUnit: "초",

    // Features
    autoClassification: "자동 분류",
    autoClassificationDesc:
      "이슈가 등록되면 AI가 즉시 유효성을 판단하고 중복 여부를 확인합니다.",
    deepAnalysis: "심층 분석",
    deepAnalysisDesc:
      "코드베이스를 분석하여 우선순위, 스토리 포인트, 담당자를 자동 지정합니다.",
    autoFix: "자동 수정",
    autoFixDesc: "간단한 버그는 AI가 직접 수정하고 PR을 생성합니다.",
    savedPerIssue: "절약 / 이슈",

    // Dashboard Page
    dashboardTitle: "Dashboard",
    dashboardDesc: "AI 이슈 자동화 성능 현황",
    perIssue: "건당",
    processingTimeByStep: "처리 단계별 평균 시간",
    processingTimeByStepDesc: "각 워크플로우 단계의 평균 처리 시간",
    triageDesc: "이슈 유효성 검증",
    analyzeDesc: "코드 분석 및 우선순위 결정",
    fixDesc: "PR 생성 및 코드 수정",
    vsLastMonth: "전월 대비",

    // Period Filter
    today: "오늘",
    thisWeek: "이번 주",
    thisMonth: "이번 달",
    last90Days: "최근 90일",
    lastYear: "1년",
    all: "전체",

    // Daily Trend Chart
    dailyTrendTitle: "일별 처리량 추이",
    dailyTrendDesc: "최근 14일간 워크플로우 단계별 처리량",
    triage: "분류",
    analyze: "분석",
    fix: "수정",
    countUnit: "건",

    // Decision Distribution Chart
    decisionDistTitle: "분류 결정 분포",
    decisionDistDesc: "AI 분류 결과별 이슈 비율",
    filteringRate: "필터링율",
    valid: "유효",
    invalid: "무효",
    duplicate: "중복",
    needsInfo: "정보 필요",

    // Resolution Distribution Chart (2분류)
    resolutionDistTitle: "결과 분포",
    resolutionDistDesc: "자동 해결 vs 수동 필요 비율",
    autoResolved: "자동 해결",
    manualRequired: "수동 필요",
    autoResolvedMessage: "는 사람 개입 없이 처리됨",

    // Trend Chart
    trendChartTitle: "처리량 추이",
    trendChartDesc: "자동 해결 / 수동 필요 건수와 자동 해결율",

    // Cost Trend Chart
    costTrendChartTitle: "비용 추이",
    costTrendChartDesc: "Input / Output 토큰 비용",
    inputCost: "Input 비용",
    outputCost: "Output 비용",
    totalCost: "총 비용",

    // Monthly Trend Chart
    monthlyTrendTitle: "월별 처리량 추이",
    monthlyTrendDesc: "최근 6개월간 AI가 처리한 이슈 수",
    processedLabel: "처리량",
    processedIssues: "처리된 이슈",

    // Period Filter (기획서)
    oneWeek: "1주",
    oneMonth: "1달",
    ninetyDays: "90일",
    oneYear: "1년",
    allTime: "전체",
    custom: "사용자 지정",

    // Public Stats
    costPerIssue: "건당 비용",

    // Time units
    seconds: "초",
    minutes: "분",
    hours: "시간",

    // Empty State
    noDataAvailable: "데이터 없음",
    noDataDesc: "표시할 데이터가 없습니다. 나중에 다시 확인해주세요.",

    // Footer
    footerTagline: "AI-Powered Issue Automation",
    allSystemsOperational: "All systems operational",
    allRightsReserved: "All rights reserved.",

    // Common
    loading: "로딩 중...",
    error: "오류",
  },
  en: {
    // Header
    dashboard: "Dashboard",

    // Menu
    dataSource: "Data Source",
    demo: "Demo",
    demoDesc: "Fixed sample data",
    live: "Live",
    liveDesc: "Real database",
    language: "Language",
    korean: "한국어",
    english: "English",

    // Home Page
    liveMetrics: "Live Metrics",
    heroTitle1: "AI-Powered Issue",
    heroTitle2: "Automation",
    heroSubtitle:
      "Automatically classify, analyze, and fix GitHub issues. Save developer time and maximize ROI.",
    totalProcessed: "Total Processed",
    cumulativeProcessed: "Cumulative total",
    autoResolutionRate: "Auto Resolution Rate",
    aiDirectFix: "Fixed by AI",
    avgResponseTime: "Avg Response Time",
    toFirstResponse: "To first response",
    totalAICost: "Total AI Cost",
    totalAPICost: "Total API cost",
    issuesUnit: "",
    secondsUnit: "s",

    // Features
    autoClassification: "Auto Classification",
    autoClassificationDesc:
      "When an issue is created, AI immediately validates and checks for duplicates.",
    deepAnalysis: "Deep Analysis",
    deepAnalysisDesc:
      "Analyzes codebase to automatically assign priority, story points, and assignees.",
    autoFix: "Auto Fix",
    autoFixDesc:
      "Simple bugs are fixed by AI and PRs are automatically created.",
    savedPerIssue: "Saved / Issue",

    // Dashboard Page
    dashboardTitle: "Dashboard",
    dashboardDesc: "AI issue automation performance",
    perIssue: "per issue",
    processingTimeByStep: "Average Time by Step",
    processingTimeByStepDesc: "Average processing time for each workflow step",
    triageDesc: "Issue validation",
    analyzeDesc: "Code analysis & prioritization",
    fixDesc: "PR creation & code fix",
    vsLastMonth: "vs last month",

    // Period Filter
    today: "Today",
    thisWeek: "This Week",
    thisMonth: "This Month",
    last90Days: "Last 90 Days",
    lastYear: "1 Year",
    all: "All",

    // Daily Trend Chart
    dailyTrendTitle: "Daily Processing Trend",
    dailyTrendDesc: "Workflow stage processing over the last 14 days",
    triage: "Triage",
    analyze: "Analyze",
    fix: "Fix",
    countUnit: "",

    // Decision Distribution Chart
    decisionDistTitle: "Decision Distribution",
    decisionDistDesc: "Issue ratio by AI classification result",
    filteringRate: "Filtering Rate",
    valid: "Valid",
    invalid: "Invalid",
    duplicate: "Duplicate",
    needsInfo: "Needs Info",

    // Resolution Distribution Chart (2分類)
    resolutionDistTitle: "Resolution Distribution",
    resolutionDistDesc: "Auto-resolved vs Manual required ratio",
    autoResolved: "Auto Resolved",
    manualRequired: "Manual Required",
    autoResolvedMessage: "processed without human intervention",

    // Trend Chart
    trendChartTitle: "Processing Trend",
    trendChartDesc: "Auto-resolved / Manual required counts and auto-resolution rate",

    // Cost Trend Chart
    costTrendChartTitle: "Cost Trend",
    costTrendChartDesc: "Input / Output token costs",
    inputCost: "Input Cost",
    outputCost: "Output Cost",
    totalCost: "Total Cost",

    // Monthly Trend Chart
    monthlyTrendTitle: "Monthly Processing Trend",
    monthlyTrendDesc: "Issues processed by AI over the last 6 months",
    processedLabel: "Processed",
    processedIssues: "Issues Processed",

    // Period Filter (spec)
    oneWeek: "1 Week",
    oneMonth: "1 Month",
    ninetyDays: "90 Days",
    oneYear: "1 Year",
    allTime: "All",
    custom: "Custom",

    // Public Stats
    costPerIssue: "Cost per issue",

    // Time units
    seconds: "s",
    minutes: "m",
    hours: "h",

    // Empty State
    noDataAvailable: "No Data Available",
    noDataDesc:
      "No data to display. Please check back later or configure your data source.",

    // Footer
    footerTagline: "AI-Powered Issue Automation",
    allSystemsOperational: "All systems operational",
    allRightsReserved: "All rights reserved.",

    // Common
    loading: "Loading...",
    error: "Error",
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof (typeof translations)["ko"];
