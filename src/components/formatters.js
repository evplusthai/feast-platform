/**
 * Format a number as Thai Baht currency
 */
export function fmtCurrency(n, decimals = 0) {
  if (n == null || isNaN(n)) return '-';
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  if (n < 0) return `(${formatted})`;
  return formatted;
}

/**
 * Format number with thousands separator
 */
export function fmtNumber(n, decimals = 0) {
  if (n == null || isNaN(n)) return '-';
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format as percentage
 */
export function fmtPercent(n, decimals = 1) {
  if (n == null || isNaN(n)) return '-';
  return `${(n * 100).toFixed(decimals)}%`;
}

/**
 * Format date as YYYY-MM-DD
 */
export function fmtDate(d) {
  if (!d) return '-';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toISOString().split('T')[0];
}

/**
 * Format month index to month name + year
 */
export function fmtMonthYear(monthIndex, startDate, lang = 'en') {
  const start = new Date(startDate);
  const date = new Date(start.getFullYear(), start.getMonth() + monthIndex, 1);
  const monthNames = {
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    th: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
  };
  const year = lang === 'th' ? date.getFullYear() + 543 : date.getFullYear();
  return `${monthNames[lang][date.getMonth()]} ${year}`;
}

/**
 * Format year label from month index
 */
export function fmtYear(monthIndex, startDate, lang = 'en') {
  const start = new Date(startDate);
  const date = new Date(start.getFullYear(), start.getMonth() + monthIndex, 1);
  const year = lang === 'th' ? date.getFullYear() + 543 : date.getFullYear();
  return `${year}`;
}

/**
 * Get CSS class for profit/loss coloring
 */
export function profitClass(value) {
  if (value == null || isNaN(value) || value === 0) return 'cell-zero';
  return value > 0 ? 'cell-profit' : 'cell-loss';
}

/**
 * Escape HTML to prevent XSS
 */
export function escHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Generate a unique ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Format large numbers with K/M/B suffix
 */
export function fmtCompact(n) {
  if (n == null || isNaN(n)) return '-';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(1)}K`;
  return `${sign}${abs.toFixed(0)}`;
}
