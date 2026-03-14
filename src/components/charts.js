/**
 * Pure SVG chart rendering utilities
 */

const CHART_COLORS = {
  primary: '#14b8a6',
  accent: '#f59e0b',
  success: '#22c55e',
  danger: '#ef4444',
  info: '#3b82f6',
  muted: '#64748b',
  grid: '#334155',
  text: '#94a3b8',
  bg: '#0f172a',
};

/**
 * Render a line chart as SVG string
 */
export function renderLineChart(data, options = {}) {
  const {
    width = 800,
    height = 300,
    label = '',
    color = CHART_COLORS.primary,
    showArea = true,
    yFormat = (v) => v.toLocaleString(),
  } = options;

  if (!data || data.length === 0) return '<div class="text-muted text-sm">No data</div>';

  const padding = { top: 30, right: 20, bottom: 40, left: 80 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const minY = Math.min(0, ...data.map(d => d.value));
  const maxY = Math.max(0, ...data.map(d => d.value));
  const rangeY = maxY - minY || 1;

  const scaleX = (i) => padding.left + (i / (data.length - 1)) * chartW;
  const scaleY = (v) => padding.top + chartH - ((v - minY) / rangeY) * chartH;

  // Build line path
  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${scaleX(i).toFixed(1)},${scaleY(d.value).toFixed(1)}`).join(' ');

  // Area path
  const areaPath = showArea ? `${linePath} L${scaleX(data.length - 1).toFixed(1)},${scaleY(0).toFixed(1)} L${scaleX(0).toFixed(1)},${scaleY(0).toFixed(1)} Z` : '';

  // Y-axis gridlines (5 lines)
  const yTicks = 5;
  let gridLines = '';
  let yLabels = '';
  for (let i = 0; i <= yTicks; i++) {
    const v = minY + (rangeY * i) / yTicks;
    const y = scaleY(v);
    gridLines += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="${CHART_COLORS.grid}" stroke-width="0.5" stroke-dasharray="4,4"/>`;
    yLabels += `<text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" fill="${CHART_COLORS.text}" font-size="10">${yFormat(v)}</text>`;
  }

  // X-axis labels (show every Nth)
  const xStep = Math.max(1, Math.floor(data.length / 10));
  let xLabels = '';
  data.forEach((d, i) => {
    if (i % xStep === 0 || i === data.length - 1) {
      xLabels += `<text x="${scaleX(i)}" y="${height - 8}" text-anchor="middle" fill="${CHART_COLORS.text}" font-size="10">${d.label}</text>`;
    }
  });

  // Zero line
  const zeroY = scaleY(0);
  const zeroLine = minY < 0 ? `<line x1="${padding.left}" y1="${zeroY}" x2="${width - padding.right}" y2="${zeroY}" stroke="${CHART_COLORS.muted}" stroke-width="1"/>` : '';

  return `
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      ${gridLines}
      ${zeroLine}
      ${yLabels}
      ${xLabels}
      ${showArea ? `<path d="${areaPath}" fill="${color}" opacity="0.1"/>` : ''}
      <path d="${linePath}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
      ${label ? `<text x="${padding.left}" y="16" fill="${CHART_COLORS.text}" font-size="12" font-weight="600">${label}</text>` : ''}
    </svg>`;
}

/**
 * Render a bar chart as SVG string
 */
export function renderBarChart(data, options = {}) {
  const {
    width = 600,
    height = 300,
    label = '',
    colors = [CHART_COLORS.primary, CHART_COLORS.accent, CHART_COLORS.success, CHART_COLORS.info, CHART_COLORS.danger],
  } = options;

  if (!data || data.length === 0) return '<div class="text-muted text-sm">No data</div>';

  const padding = { top: 30, right: 20, bottom: 60, left: 80 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map(d => Math.abs(d.value)));
  const barWidth = Math.min(40, (chartW / data.length) * 0.7);
  const gap = (chartW - barWidth * data.length) / (data.length + 1);

  let bars = '';
  let labels = '';

  data.forEach((d, i) => {
    const x = padding.left + gap + i * (barWidth + gap);
    const barH = (Math.abs(d.value) / (maxVal || 1)) * chartH;
    const y = d.value >= 0 ? padding.top + chartH - barH : padding.top + chartH;
    const color = colors[i % colors.length];

    bars += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" fill="${color}" rx="3" opacity="0.85"/>`;
    labels += `<text x="${x + barWidth / 2}" y="${height - 8}" text-anchor="middle" fill="${CHART_COLORS.text}" font-size="9" transform="rotate(-30, ${x + barWidth / 2}, ${height - 8})">${d.label}</text>`;
  });

  return `
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="${CHART_COLORS.grid}" stroke-width="1"/>
      ${bars}
      ${labels}
      ${label ? `<text x="${padding.left}" y="16" fill="${CHART_COLORS.text}" font-size="12" font-weight="600">${label}</text>` : ''}
    </svg>`;
}

/**
 * Render a KPI card with optional sparkline
 */
export function renderKPICard(label, value, unit, colorClass = 'kpi-primary') {
  return `
    <div class="kpi-card ${colorClass}">
      <div class="kpi-label">${label}</div>
      <div class="kpi-value">${value}</div>
      ${unit ? `<div class="kpi-unit">${unit}</div>` : ''}
    </div>`;
}
