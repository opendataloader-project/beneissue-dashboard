/**
 * Format number with Korean locale
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(Math.round(value));
}

/**
 * Format currency in KRW with appropriate scale
 */
export function formatCurrencyKRW(value: number): string {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(1)}억원`;
  }
  if (value >= 10000) {
    return `${Math.round(value / 10000)}만원`;
  }
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format currency in USD
 */
export function formatCurrencyUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format delta with sign
 */
export function formatDelta(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Format seconds to human readable
 */
export function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}초`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}분`;
  return `${(seconds / 3600).toFixed(1)}시간`;
}

/**
 * Format hours
 */
export function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}분`;
  return `${Math.round(hours)}시간`;
}

/**
 * Format month string (YYYY-MM) to Korean
 */
export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  return `${year}년 ${parseInt(month)}월`;
}

/**
 * Format date string (YYYY-MM-DD) to short format
 */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
