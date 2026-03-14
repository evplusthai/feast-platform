import { t, getLang } from '../i18n.js';
import { fmtCurrency, fmtPercent, fmtMonthYear, fmtCompact, profitClass } from '../components/formatters.js';
import { renderLineChart, renderBarChart, renderKPICard } from '../components/charts.js';

export function renderResults(results, assumptions, appState) {
  if (!results) return renderNoResults();

  const { summary, pnl, balanceSheet, cashFlow, dcf } = results;

  return `
    <div class="animate-slide-up">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-semibold">${t('results.title')}</h2>
        <div class="export-actions">
          <button class="btn btn-secondary btn-sm" id="btn-export-excel">${t('results.exportExcel')}</button>
          <button class="btn btn-ghost btn-sm" id="btn-print" onclick="window.print()">${t('results.print')}</button>
        </div>
      </div>

      <div class="tabs" id="result-tabs">
        <button class="tab active" data-tab="summary">${t('results.execSummary')}</button>
        <button class="tab" data-tab="pnl">${t('results.pnl')}</button>
        <button class="tab" data-tab="bs">${t('results.balanceSheet')}</button>
        <button class="tab" data-tab="cf">${t('results.cashFlow')}</button>
        <button class="tab" data-tab="dcf">${t('results.dcf')}</button>
        <button class="tab" data-tab="charts">${t('results.charts')}</button>
      </div>

      <div id="tab-summary" class="tab-content active">
        ${renderExecSummary(results, assumptions)}
      </div>
      <div id="tab-pnl" class="tab-content">
        ${renderPnLTab(results, assumptions)}
      </div>
      <div id="tab-bs" class="tab-content">
        ${renderBalanceSheetTab(results, assumptions)}
      </div>
      <div id="tab-cf" class="tab-content">
        ${renderCashFlowTab(results, assumptions)}
      </div>
      <div id="tab-dcf" class="tab-content">
        ${renderDCFTab(results, assumptions)}
      </div>
      <div id="tab-charts" class="tab-content">
        ${renderChartsTab(results, assumptions)}
      </div>
    </div>`;
}

function renderNoResults() {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">&#128200;</div>
      <h3>${t('results.noResults')}</h3>
      <p>${t('results.noResultsDesc')}</p>
    </div>`;
}

// ── Executive Summary ──
function renderExecSummary(results, a) {
  const s = results.summary;
  const irrDisplay = s.irr != null ? fmtPercent(s.irr) : t('common.na');
  const paybackDisplay = s.paybackPeriodMonths != null
    ? `${s.paybackYears}Y ${s.paybackRemainingMonths}M`
    : t('common.never');

  return `
    <div class="kpi-grid">
      ${renderKPICard(t('fin.totalInvestment'), `${fmtCurrency(s.totalInvestment)}`, t('fin.thb'), 'kpi-primary')}
      ${renderKPICard(t('fin.npv'), `${fmtCurrency(s.npv)}`, t('fin.thb'), s.npv >= 0 ? 'kpi-success' : 'kpi-danger')}
      ${renderKPICard(t('fin.irr'), irrDisplay, '', s.irr != null && s.irr > 0 ? 'kpi-success' : 'kpi-danger')}
      ${renderKPICard(t('fin.paybackPeriod'), paybackDisplay, '', 'kpi-accent')}
      ${renderKPICard(t('fin.netProfit') + ' (Y1)', `${fmtCurrency(s.year1NetProfit)}`, t('fin.thb'), s.year1NetProfit >= 0 ? 'kpi-success' : 'kpi-danger')}
      ${renderKPICard(t('fin.netProfitMargin'), fmtPercent(s.netProfitPercent), '', 'kpi-info')}
    </div>

    <div class="card mt-6">
      <h3 class="card-title mb-4">${t('results.pnl')} - ${t('results.annual')}</h3>
      ${renderAnnualSummaryTable(results, a)}
    </div>`;
}

// ── Annual Summary Table ──
function renderAnnualSummaryTable(results, a) {
  const { pnl, totalMonths } = results;
  const numYears = Math.ceil(totalMonths / 12);
  const lang = getLang();

  // Aggregate annual data
  const annualData = [];
  for (let y = 0; y < numYears; y++) {
    const startM = y * 12;
    const endM = Math.min(startM + 12, totalMonths);
    const yearPnl = pnl.slice(startM, endM);

    annualData.push({
      label: `Y${y + 1}`,
      revenue: yearPnl.reduce((s, p) => s + p.totalRevenue, 0),
      costs: yearPnl.reduce((s, p) => s + p.totalCosts, 0),
      ebitda: yearPnl.reduce((s, p) => s + p.ebitda, 0),
      depreciation: yearPnl.reduce((s, p) => s + p.totalDepreciation, 0),
      interest: yearPnl.reduce((s, p) => s + p.interestExpense, 0),
      tax: yearPnl.reduce((s, p) => s + p.incomeTax, 0),
      netProfit: yearPnl.reduce((s, p) => s + p.netProfit, 0),
    });
  }

  const total = {
    label: t('fin.total'),
    revenue: annualData.reduce((s, d) => s + d.revenue, 0),
    costs: annualData.reduce((s, d) => s + d.costs, 0),
    ebitda: annualData.reduce((s, d) => s + d.ebitda, 0),
    depreciation: annualData.reduce((s, d) => s + d.depreciation, 0),
    interest: annualData.reduce((s, d) => s + d.interest, 0),
    tax: annualData.reduce((s, d) => s + d.tax, 0),
    netProfit: annualData.reduce((s, d) => s + d.netProfit, 0),
  };

  const headers = annualData.map(d => `<th>${d.label}</th>`).join('') + `<th>${t('fin.total')}</th>`;
  const row = (label, key, indent = '') => {
    const cells = annualData.map(d => `<td class="${profitClass(d[key])}">${fmtCurrency(d[key])}</td>`).join('');
    return `<tr class="${indent}"><td>${label}</td>${cells}<td class="font-bold ${profitClass(total[key])}">${fmtCurrency(total[key])}</td></tr>`;
  };

  return `
    <div class="fin-table-container">
      <table class="fin-table">
        <thead><tr><th></th>${headers}</tr></thead>
        <tbody>
          ${row(t('fin.totalRevenue'), 'revenue')}
          ${row(t('fin.totalCosts'), 'costs')}
          <tr class="row-subtotal"><td>${t('fin.ebitda')}</td>${annualData.map(d => `<td class="${profitClass(d.ebitda)}">${fmtCurrency(d.ebitda)}</td>`).join('')}<td class="font-bold ${profitClass(total.ebitda)}">${fmtCurrency(total.ebitda)}</td></tr>
          ${row(t('fin.depreciation'), 'depreciation')}
          ${row(t('fin.interest'), 'interest')}
          ${row(t('fin.tax'), 'tax')}
          <tr class="row-total"><td>${t('fin.netProfit')}</td>${annualData.map(d => `<td class="${profitClass(d.netProfit)}">${fmtCurrency(d.netProfit)}</td>`).join('')}<td class="font-bold ${profitClass(total.netProfit)}">${fmtCurrency(total.netProfit)}</td></tr>
          <tr><td>${t('fin.netProfitMargin')}</td>${annualData.map(d => `<td>${d.revenue > 0 ? fmtPercent(d.netProfit / d.revenue) : '-'}</td>`).join('')}<td class="font-bold">${total.revenue > 0 ? fmtPercent(total.netProfit / total.revenue) : '-'}</td></tr>
        </tbody>
      </table>
    </div>`;
}

// ── P&L Tab ──
function renderPnLTab(results, a) {
  const { pnl, totalMonths } = results;
  const lang = getLang();
  const startDate = a.startDate;

  const headers = pnl.map(p => `<th>${fmtMonthYear(p.month - 1, startDate, lang)}</th>`).join('');

  const makeRow = (label, key, cssClass = '') => {
    const cells = pnl.map(p => `<td class="${profitClass(p[key])}">${fmtCurrency(p[key])}</td>`).join('');
    return `<tr class="${cssClass}"><td>${label}</td>${cells}</tr>`;
  };

  return `
    <div class="fin-table-container">
      <table class="fin-table">
        <thead><tr><th>${t('results.pnl')}</th>${headers}</tr></thead>
        <tbody>
          <tr class="row-header"><td colspan="${totalMonths + 1}">${t('fin.revenue')}</td></tr>
          ${makeRow(t('fin.serviceRevenue'), 'serviceRevenue', 'indent-1')}
          ${makeRow(t('fin.chargerRental'), 'chargerRental', 'indent-1')}
          ${makeRow(t('fin.otherIncome'), 'otherIncome', 'indent-1')}
          ${makeRow(t('fin.totalRevenue'), 'totalRevenue', 'row-subtotal')}

          <tr class="row-header"><td colspan="${totalMonths + 1}">${t('fin.costs')}</td></tr>
          ${makeRow(t('fin.fuelCost'), 'fuelCost', 'indent-1')}
          ${makeRow(t('fin.driverCost'), 'driverCost', 'indent-1')}
          ${makeRow(t('fin.monitorCost'), 'monitorCost', 'indent-1')}
          ${makeRow(t('fin.tireCost'), 'tireCost', 'indent-1')}
          ${makeRow(t('fin.insuranceCost'), 'insuranceCost', 'indent-1')}
          ${makeRow(t('fin.maintenanceCost'), 'maintenanceCost', 'indent-1')}
          ${makeRow(t('fin.otherCosts'), 'otherCosts', 'indent-1')}
          ${makeRow(t('fin.totalCosts'), 'totalCosts', 'row-subtotal')}

          ${makeRow(t('fin.ebitda'), 'ebitda', 'row-subtotal')}
          ${makeRow(t('fin.depreciation'), 'totalDepreciation')}
          ${makeRow(t('fin.ebit'), 'ebit')}
          ${makeRow(t('fin.interest'), 'interestExpense')}
          ${makeRow(t('fin.ebt'), 'ebt')}
          ${makeRow(t('fin.tax'), 'incomeTax')}
          ${makeRow(t('fin.netProfit'), 'netProfit', 'row-total')}
        </tbody>
      </table>
    </div>`;
}

// ── Balance Sheet Tab ──
function renderBalanceSheetTab(results, a) {
  const { balanceSheet, totalMonths } = results;
  const lang = getLang();

  const headers = balanceSheet.map(b => `<th>${fmtMonthYear(b.month - 1, a.startDate, lang)}</th>`).join('');

  const makeRow = (label, key, cssClass = '') => {
    const cells = balanceSheet.map(b => `<td class="${profitClass(b[key])}">${fmtCurrency(b[key])}</td>`).join('');
    return `<tr class="${cssClass}"><td>${label}</td>${cells}</tr>`;
  };

  return `
    <div class="fin-table-container">
      <table class="fin-table">
        <thead><tr><th>${t('results.balanceSheet')}</th>${headers}</tr></thead>
        <tbody>
          <tr class="row-header"><td colspan="${totalMonths + 1}">${t('bs.assets')}</td></tr>
          ${makeRow(t('bs.cash'), 'cash', 'indent-1')}
          ${makeRow(t('bs.fixedAssets'), 'netFixedAssets', 'indent-1')}
          ${makeRow(t('bs.totalAssets'), 'totalAssets', 'row-subtotal')}

          <tr class="row-header"><td colspan="${totalMonths + 1}">${t('bs.liabilities')}</td></tr>
          ${makeRow(t('bs.stDebt'), 'stDebt', 'indent-1')}
          ${makeRow(t('bs.ltDebt'), 'ltDebt', 'indent-1')}
          ${makeRow(t('bs.totalLiabilities'), 'totalLiabilities', 'row-subtotal')}

          <tr class="row-header"><td colspan="${totalMonths + 1}">${t('bs.equity')}</td></tr>
          ${makeRow(t('bs.paidInCapital'), 'paidInCapital', 'indent-1')}
          ${makeRow(t('bs.retainedEarnings'), 'retainedEarnings', 'indent-1')}
          ${makeRow(t('bs.totalEquity'), 'totalEquity', 'row-total')}
        </tbody>
      </table>
    </div>`;
}

// ── Cash Flow Tab ──
function renderCashFlowTab(results, a) {
  const { cashFlow, totalMonths } = results;
  const lang = getLang();

  const headers = cashFlow.map(c => `<th>${fmtMonthYear(c.month - 1, a.startDate, lang)}</th>`).join('');

  const makeRow = (label, key, cssClass = '') => {
    const cells = cashFlow.map(c => `<td class="${profitClass(c[key])}">${fmtCurrency(c[key])}</td>`).join('');
    return `<tr class="${cssClass}"><td>${label}</td>${cells}</tr>`;
  };

  return `
    <div class="fin-table-container">
      <table class="fin-table">
        <thead><tr><th>${t('results.cashFlow')}</th>${headers}</tr></thead>
        <tbody>
          <tr class="row-header"><td colspan="${totalMonths + 1}">${t('cf.operating')}</td></tr>
          ${makeRow(t('fin.netProfit'), 'netProfit', 'indent-1')}
          ${makeRow(t('fin.depreciation'), 'addBackDepreciation', 'indent-1')}
          ${makeRow(t('cf.wht'), 'whtPaid', 'indent-1')}
          ${makeRow(t('cf.operating'), 'operatingCF', 'row-subtotal')}

          <tr class="row-header"><td colspan="${totalMonths + 1}">${t('cf.investing')}</td></tr>
          ${makeRow(t('cf.capex'), 'capitalExpenditure', 'indent-1')}
          ${makeRow(t('cf.terminalValue'), 'terminalValue', 'indent-1')}
          ${makeRow(t('cf.investing'), 'investingCF', 'row-subtotal')}

          <tr class="row-header"><td colspan="${totalMonths + 1}">${t('cf.financing')}</td></tr>
          ${makeRow(t('cf.equityContribution'), 'equityContribution', 'indent-1')}
          ${makeRow(t('cf.loanDrawdown'), 'ltLoanDrawdown', 'indent-1')}
          ${makeRow(t('cf.loanRepayment'), 'ltLoanRepayment', 'indent-1')}
          ${makeRow(t('cf.financing'), 'financingCF', 'row-subtotal')}

          ${makeRow(t('cf.netCashChange'), 'netCashChange', 'row-total')}
          ${makeRow(t('cf.cumulativeCash'), 'cumulativeCash', 'row-total')}
        </tbody>
      </table>
    </div>`;
}

// ── DCF Tab ──
function renderDCFTab(results, a) {
  const { dcf, totalMonths } = results;
  const lang = getLang();
  const s = results.summary;

  const irrDisplay = s.irr != null ? fmtPercent(s.irr) : t('common.na');
  const paybackDisplay = s.paybackPeriodMonths != null
    ? `${s.paybackYears}Y ${s.paybackRemainingMonths}M`
    : t('common.never');

  // Sensitivity analysis: vary WACC by +/- 1%, 2%
  const sensitivities = [-0.02, -0.01, 0, 0.01, 0.02].map(delta => {
    const waccAdj = a.wacc + delta;
    const monthlyWacc = waccAdj / 12;
    let npv = 0;
    for (let m = 0; m < dcf.monthly.length; m++) {
      npv += dcf.monthly[m].freeCashFlow / Math.pow(1 + monthlyWacc, m + 1);
    }
    return { wacc: waccAdj, npv, isCurrent: delta === 0 };
  });

  return `
    <div class="kpi-grid mb-6">
      ${renderKPICard(t('fin.npv'), fmtCurrency(s.npv), t('fin.thb'), s.npv >= 0 ? 'kpi-success' : 'kpi-danger')}
      ${renderKPICard(t('fin.irr'), irrDisplay, '', s.irr != null && s.irr > 0 ? 'kpi-success' : 'kpi-danger')}
      ${renderKPICard(t('fin.paybackPeriod'), paybackDisplay, '', 'kpi-accent')}
    </div>

    <div class="card mb-6">
      <h3 class="card-title mb-4">${t('dcf.sensitivity')}</h3>
      <div class="table-container">
        <table class="sensitivity-table">
          <thead>
            <tr>
              <th>${t('dcf.waccLabel')}</th>
              ${sensitivities.map(s => `<th class="${s.isCurrent ? 'current-value' : ''}">${fmtPercent(s.wacc)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${t('fin.npv')}</td>
              ${sensitivities.map(s => `<td class="${s.isCurrent ? 'current-value' : ''} ${profitClass(s.npv)}">${fmtCurrency(s.npv)}</td>`).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <h3 class="card-title mb-4">${t('dcf.cumulativeNPV')}</h3>
      <div class="chart-container">
        ${renderLineChart(
          dcf.monthly.map((d, i) => ({ label: `M${d.month}`, value: d.cumulativeNPV })),
          { label: t('dcf.cumulativeNPV'), color: '#14b8a6', yFormat: v => fmtCompact(v) }
        )}
      </div>
    </div>`;
}

// ── Charts Tab ──
function renderChartsTab(results, a) {
  const { pnl, cashFlow, costs, revenue, totalMonths } = results;

  // Annual profit trend
  const numYears = Math.ceil(totalMonths / 12);
  const annualProfits = [];
  for (let y = 0; y < numYears; y++) {
    const slice = pnl.slice(y * 12, Math.min((y + 1) * 12, totalMonths));
    annualProfits.push({
      label: `Y${y + 1}`,
      value: slice.reduce((s, p) => s + p.netProfit, 0),
    });
  }

  // Monthly cash balance
  const cashData = cashFlow.map((c, i) => ({
    label: `M${c.month}`,
    value: c.cumulativeCash,
  }));

  // Cost breakdown (first year)
  const year1Costs = costs.slice(0, Math.min(12, totalMonths));
  const costBreakdown = [
    { label: t('fin.fuelCost'), value: year1Costs.reduce((s, c) => s + c.fuelCost, 0) },
    { label: t('fin.driverCost'), value: year1Costs.reduce((s, c) => s + c.driverCost, 0) },
    { label: t('fin.monitorCost'), value: year1Costs.reduce((s, c) => s + c.monitorCost, 0) },
    { label: t('fin.tireCost'), value: year1Costs.reduce((s, c) => s + c.tireCost, 0) },
    { label: t('fin.insuranceCost'), value: year1Costs.reduce((s, c) => s + c.insuranceCost, 0) },
    { label: t('fin.maintenanceCost'), value: year1Costs.reduce((s, c) => s + c.maintenanceCost, 0) },
    { label: t('fin.otherCosts'), value: year1Costs.reduce((s, c) => s + c.otherCosts, 0) },
  ].filter(c => c.value > 0);

  return `
    <div class="chart-container">
      <div class="chart-title">${t('fin.netProfit')} - ${t('results.annual')}</div>
      ${renderBarChart(annualProfits, { label: '', colors: annualProfits.map(d => d.value >= 0 ? '#22c55e' : '#ef4444') })}
    </div>

    <div class="chart-container">
      <div class="chart-title">${t('cf.cumulativeCash')}</div>
      ${renderLineChart(cashData, { label: '', color: '#3b82f6', yFormat: v => fmtCompact(v) })}
    </div>

    <div class="chart-container">
      <div class="chart-title">${t('fin.costs')} - Y1 Breakdown</div>
      ${renderBarChart(costBreakdown, { width: 700, label: '' })}
    </div>`;
}

// ── Event Binding ──
export function bindResultsEvents(state, navigate) {
  // Tab switching
  document.querySelectorAll('#result-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#result-tabs .tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(`tab-${tab.dataset.tab}`);
      if (target) target.classList.add('active');
    });
  });

  // Excel export
  const exportBtn = document.getElementById('btn-export-excel');
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      try {
        const { exportFeasibilityExcel } = await import('../export/excelExporter.js');
        const project = state.projects.find(p => p.id === state.currentProjectId);
        const scenario = project?.scenarios[state.currentScenarioIndex];
        if (scenario?.results) {
          exportFeasibilityExcel(scenario.results, project);
        }
      } catch (e) {
        console.error('Export failed:', e);
      }
    });
  }
}
