import { t, getLang } from '../i18n.js';
import { fmtCurrency, fmtPercent, profitClass } from '../components/formatters.js';
import { getDefaultAssumptions, cloneAssumptions, calcTotalInvestment } from '../engine/assumptions.js';
import { renderKPICard } from '../components/charts.js';

const MAX_SCENARIOS = 4;

export function renderScenarioManager(project, appState) {
  const scenarios = project.scenarios || [];
  const canAdd = scenarios.length < MAX_SCENARIOS;

  return `
    <div class="animate-slide-up">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-lg font-semibold">${t('scenario.title')}</h2>
          <p class="text-sm text-muted">${project.name || t('dash.noProjects')}</p>
        </div>
        <div>
          <button class="btn btn-primary btn-sm" id="btn-add-scenario" ${canAdd ? '' : 'disabled'}>
            + ${canAdd ? t('scenario.addScenario') : t('scenario.maxReached')}
          </button>
        </div>
      </div>

      <!-- Scenario Cards -->
      <div class="scenario-grid">
        ${scenarios.map((s, i) => renderScenarioCard(s, i, appState.currentScenarioIndex)).join('')}
      </div>

      <!-- Comparison Table -->
      ${scenarios.some(s => s.results) ? renderComparisonTable(scenarios) : ''}
    </div>`;
}

function renderScenarioCard(scenario, index, currentIndex) {
  const hasResults = !!scenario.results;
  const isActive = index === currentIndex;
  const a = scenario.assumptions;
  const totalInv = calcTotalInvestment(a);

  return `
    <div class="card scenario-card ${isActive ? 'scenario-card-active' : ''}" data-scenario-index="${index}">
      <div class="flex justify-between items-center mb-4">
        <div>
          <span class="badge ${isActive ? 'badge-primary' : 'badge-muted'}">
            ${index === 0 ? t('scenario.baseCase') : `Scenario ${index + 1}`}
          </span>
          <h3 class="card-title mt-2">${scenario.name || `Scenario ${index + 1}`}</h3>
        </div>
        <div class="scenario-card-actions">
          ${index > 0 ? `<button class="btn btn-ghost btn-sm btn-danger" data-delete-scenario="${index}" title="${t('common.delete')}">&#x2715;</button>` : ''}
        </div>
      </div>

      <div class="scenario-summary">
        <div class="scenario-summary-row">
          <span class="text-muted">${t('step1.vehicleCount')}</span>
          <span>${a.vehicleCount}</span>
        </div>
        <div class="scenario-summary-row">
          <span class="text-muted">${t('fin.totalInvestment')}</span>
          <span>&#3647; ${fmtCurrency(totalInv)}</span>
        </div>
        <div class="scenario-summary-row">
          <span class="text-muted">${t('step1.contractPeriod')}</span>
          <span>${a.contractPeriodYears}Y ${a.contractPeriodMonths}M</span>
        </div>
        ${hasResults ? `
        <div class="scenario-summary-row">
          <span class="text-muted">${t('fin.npv')}</span>
          <span class="${profitClass(scenario.results.summary.npv)}">&#3647; ${fmtCurrency(scenario.results.summary.npv)}</span>
        </div>
        <div class="scenario-summary-row">
          <span class="text-muted">${t('fin.irr')}</span>
          <span>${isNaN(scenario.results.summary.irr) ? t('common.na') : fmtPercent(scenario.results.summary.irr)}</span>
        </div>
        ` : `
        <div class="scenario-summary-row">
          <span class="text-muted">${t('dash.status')}</span>
          <span class="badge badge-muted">${t('scenario.notConfigured')}</span>
        </div>
        `}
      </div>

      <div class="scenario-card-footer">
        <button class="btn btn-secondary btn-sm" data-edit-scenario="${index}">${t('scenario.configure')}</button>
        ${hasResults ? `<button class="btn btn-ghost btn-sm" data-view-results="${index}">${t('nav.results')}</button>` : ''}
        ${!hasResults && index > 0 ? `<button class="btn btn-ghost btn-sm" data-generate-scenario="${index}">${t('wizard.generate')}</button>` : ''}
      </div>
    </div>`;
}

function renderComparisonTable(scenarios) {
  const withResults = scenarios.filter(s => s.results);
  if (withResults.length < 1) return '';

  const metrics = [
    { key: 'totalInvestment', label: t('fin.totalInvestment'), fmt: v => `&#3647; ${fmtCurrency(v)}`, highlight: false },
    { key: 'totalContractRevenue', label: t('fin.totalRevenue'), fmt: v => `&#3647; ${fmtCurrency(v)}`, highlight: false },
    { key: 'totalContractCosts', label: t('fin.totalCosts'), fmt: v => `&#3647; ${fmtCurrency(v)}`, highlight: false },
    { key: 'totalContractProfit', label: t('fin.netProfit'), fmt: v => `&#3647; ${fmtCurrency(v)}`, highlight: true },
    { key: 'netProfitPercent', label: t('fin.netProfitMargin'), fmt: v => fmtPercent(v), highlight: true },
    { key: 'npv', label: t('fin.npv'), fmt: v => `&#3647; ${fmtCurrency(v)}`, highlight: true },
    { key: 'irr', label: t('fin.irr'), fmt: v => isNaN(v) ? t('common.na') : fmtPercent(v), highlight: true },
    { key: 'paybackPeriodMonths', label: t('fin.paybackPeriod'), fmt: v => v ? `${Math.floor(v / 12)}Y ${Math.round(v % 12)}M` : t('common.never'), highlight: false },
    { key: 'year1Revenue', label: `Y1 ${t('fin.revenue')}`, fmt: v => `&#3647; ${fmtCurrency(v)}`, highlight: false },
    { key: 'year1EBITDA', label: `Y1 ${t('fin.ebitda')}`, fmt: v => `&#3647; ${fmtCurrency(v)}`, highlight: false },
    { key: 'year1NetProfit', label: `Y1 ${t('fin.netProfit')}`, fmt: v => `&#3647; ${fmtCurrency(v)}`, highlight: true },
    { key: 'year1Margin', label: `Y1 ${t('fin.netProfitMargin')}`, fmt: v => fmtPercent(v), highlight: true },
  ];

  return `
    <div class="card mt-6">
      <h3 class="card-title mb-4">${t('scenario.comparison')}</h3>
      <div class="table-scroll">
        <table class="data-table comparison-table">
          <thead>
            <tr>
              <th>${t('fin.total')}</th>
              ${scenarios.map((s, i) => `<th class="text-center">${s.name || `Scenario ${i + 1}`}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${metrics.map(m => `
              <tr class="${m.highlight ? 'row-highlight' : ''}">
                <td class="metric-label">${m.label}</td>
                ${scenarios.map(s => {
                  if (!s.results) return `<td class="text-center text-muted">-</td>`;
                  const val = s.results.summary[m.key];
                  const cssClass = m.highlight ? profitClass(val) : '';
                  return `<td class="text-right ${cssClass}">${m.fmt(val)}</td>`;
                }).join('')}
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

export function bindScenarioEvents(state, navigate, saveProjects, showToast) {
  // Add scenario
  document.getElementById('btn-add-scenario')?.addEventListener('click', () => {
    const project = state.projects.find(p => p.id === state.currentProjectId);
    if (!project || project.scenarios.length >= MAX_SCENARIOS) return;

    const baseAssumptions = project.scenarios[0]?.assumptions || getDefaultAssumptions();
    const newScenario = {
      name: `Scenario ${project.scenarios.length + 1}`,
      assumptions: cloneAssumptions(baseAssumptions),
      results: null,
    };
    project.scenarios.push(newScenario);
    project.updatedAt = new Date().toISOString();
    saveProjects();
    showToast(t('scenario.addScenario'), 'success');
    navigate('scenarios');
  });

  // Edit scenario (go to wizard for that scenario)
  document.querySelectorAll('[data-edit-scenario]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.editScenario);
      state.currentScenarioIndex = idx;
      state.wizardStep = 0;
      navigate('wizard');
    });
  });

  // View results for scenario
  document.querySelectorAll('[data-view-results]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.viewResults);
      state.currentScenarioIndex = idx;
      navigate('results');
    });
  });

  // Generate scenario
  document.querySelectorAll('[data-generate-scenario]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.dataset.generateScenario);
      const project = state.projects.find(p => p.id === state.currentProjectId);
      if (!project) return;

      const scenario = project.scenarios[idx];
      if (!scenario) return;

      try {
        const { runFeasibilityStudy } = await import('../engine/feasibilityEngine.js');
        scenario.results = runFeasibilityStudy(scenario.assumptions);
        project.updatedAt = new Date().toISOString();
        saveProjects();
        showToast(t('common.generated'), 'success');
        navigate('scenarios');
      } catch (e) {
        console.error('Generation failed:', e);
        showToast(t('common.error') + ': ' + e.message, 'error');
      }
    });
  });

  // Delete scenario
  document.querySelectorAll('[data-delete-scenario]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.deleteScenario);
      if (idx === 0) return; // Can't delete base case

      const project = state.projects.find(p => p.id === state.currentProjectId);
      if (!project) return;

      project.scenarios.splice(idx, 1);
      if (state.currentScenarioIndex >= project.scenarios.length) {
        state.currentScenarioIndex = 0;
      }
      project.updatedAt = new Date().toISOString();
      saveProjects();
      showToast(t('common.deleted'), 'info');
      navigate('scenarios');
    });
  });
}
