import { t } from '../i18n.js';
import { renderStepIndicator, STEPS } from '../components/wizardSteps.js';
import { renderStepProjectInfo, collectStepProjectInfo } from './wizardStepProjectInfo.js';
import { renderStepInvestment, collectStepInvestment } from './wizardStepInvestment.js';
import { renderStepRevenue, collectStepRevenue } from './wizardStepRevenue.js';
import { renderStepCosts, collectStepCosts } from './wizardStepCosts.js';
import { renderStepFinancing, collectStepFinancing } from './wizardStepFinancing.js';
import { renderStepReview } from './wizardStepReview.js';

const STEP_RENDERERS = [
  renderStepProjectInfo,
  renderStepInvestment,
  renderStepRevenue,
  renderStepCosts,
  renderStepFinancing,
  renderStepReview,
];

const STEP_COLLECTORS = [
  collectStepProjectInfo,
  collectStepInvestment,
  collectStepRevenue,
  collectStepCosts,
  collectStepFinancing,
  null, // review step doesn't collect
];

export function renderWizard(step, assumptions, appState) {
  const isLastStep = step === STEPS.length - 1;
  const isFirstStep = step === 0;

  const stepContent = STEP_RENDERERS[step](assumptions);

  return `
    <div class="animate-slide-up">
      ${renderStepIndicator(step)}
      <div class="card">
        <div class="wizard-content" id="wizard-content">
          ${stepContent}
        </div>
        <div class="wizard-nav">
          <button class="btn btn-secondary" id="btn-prev" ${isFirstStep ? 'style="visibility:hidden"' : ''}>
            ${t('wizard.prev')}
          </button>
          <button class="btn btn-ghost" id="btn-save-draft">${t('wizard.saveDraft')}</button>
          ${isLastStep
            ? `<button class="btn btn-accent btn-lg" id="btn-generate">${t('wizard.generate')}</button>`
            : `<button class="btn btn-primary" id="btn-next">${t('wizard.next')}</button>`
          }
        </div>
      </div>
    </div>`;
}

export function bindWizardEvents(state, navigate, saveProjects, showToast) {
  const project = state.projects.find(p => p.id === state.currentProjectId);
  if (!project) return;
  const scenario = project.scenarios[state.currentScenarioIndex];
  if (!scenario) return;

  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');
  const generateBtn = document.getElementById('btn-generate');
  const saveDraftBtn = document.getElementById('btn-save-draft');

  // Collect current step data
  function collectCurrent() {
    const collector = STEP_COLLECTORS[state.wizardStep];
    if (collector) {
      collector(scenario.assumptions);
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      collectCurrent();
      if (state.wizardStep > 0) {
        state.wizardStep--;
        project.updatedAt = new Date().toISOString();
        saveProjects();
        navigate('wizard');
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      collectCurrent();
      if (state.wizardStep < STEPS.length - 1) {
        state.wizardStep++;
        project.updatedAt = new Date().toISOString();
        saveProjects();
        navigate('wizard');
      }
    });
  }

  if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', () => {
      collectCurrent();
      project.name = scenario.assumptions.projectName || project.name;
      project.updatedAt = new Date().toISOString();
      saveProjects();
      showToast(t('common.saved'), 'success');
    });
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', async () => {
      collectCurrent();
      generateBtn.disabled = true;
      generateBtn.textContent = t('common.loading');

      try {
        const { runFeasibilityStudy } = await import('../engine/feasibilityEngine.js');
        scenario.results = runFeasibilityStudy(scenario.assumptions);
        project.name = scenario.assumptions.projectName || project.name;
        project.updatedAt = new Date().toISOString();
        saveProjects();
        showToast(t('common.generated'), 'success');
        navigate('results');
      } catch (e) {
        console.error('Generation failed:', e);
        showToast(`${t('common.error')}: ${e.message}`, 'error');
        generateBtn.disabled = false;
        generateBtn.textContent = t('wizard.generate');
      }
    });
  }

  // Edit button jumps from review step
  document.querySelectorAll('[data-goto-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      collectCurrent();
      state.wizardStep = parseInt(btn.dataset.gotoStep);
      saveProjects();
      navigate('wizard');
    });
  });

  // Bind step-specific events
  bindStepSpecificEvents(state.wizardStep, scenario.assumptions);
}

function bindStepSpecificEvents(step, assumptions) {
  // Step 2: auto-update vehicle price + fuel defaults when type changes
  if (step === 1) {
    const typeSelect = document.getElementById('vehicleTypeId');
    if (typeSelect) {
      typeSelect.addEventListener('change', async () => {
        const { VEHICLE_TYPES } = await import('../data/vehicleTypes.js');
        const { DEFAULTS } = await import('../data/defaults.js');
        const vt = VEHICLE_TYPES.find(v => v.id === typeSelect.value);
        if (vt) {
          // Update price
          const priceInput = document.getElementById('vehicleUnitPrice');
          if (priceInput && vt.defaultPrice > 0) {
            priceInput.value = vt.defaultPrice;
          }
          // Update fuel defaults based on EV vs ICE
          if (vt.type === 'ev') {
            assumptions.fuel.consumptionRate = vt.consumptionRate || 0.8;
            assumptions.fuel.fuelPrice = DEFAULTS.evChargingRate || 6;
            // Auto-fill battery fields for EV
            const batteryInput = document.getElementById('batteryCapacityKWh');
            if (batteryInput && vt.batteryKWh) {
              batteryInput.value = vt.batteryKWh;
            }
          } else {
            // ICE defaults
            assumptions.fuel.consumptionRate = vt.fuelConsumption ? (1 / vt.fuelConsumption) : 0.1429;
            assumptions.fuel.fuelPrice = DEFAULTS.dieselPrice || 32;
          }
        }
      });
    }
  }

  // Step 3: toggle trip type sections
  if (step === 2) {
    document.querySelectorAll('[data-trip-toggle]').forEach(toggle => {
      toggle.addEventListener('change', () => {
        const idx = parseInt(toggle.dataset.tripToggle);
        const card = document.getElementById(`trip-card-${idx}`);
        if (card) {
          card.classList.toggle('enabled', toggle.checked);
        }
      });
    });
  }

  // Step 4: collapsible sections
  if (step === 3) {
    document.querySelectorAll('.collapsible-header').forEach(header => {
      header.addEventListener('click', () => {
        header.closest('.collapsible-section').classList.toggle('open');
      });
    });
  }
}
