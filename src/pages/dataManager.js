import { t, getLang } from '../i18n.js';
import { VEHICLE_TYPES, VEHICLE_COST_DEFAULTS } from '../data/vehicleTypes.js';

const COST_STORAGE_KEY = 'feast_vehicle_costs';

function loadCostDefaults() {
  try {
    const stored = localStorage.getItem(COST_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with hardcoded defaults to ensure all keys exist
      const merged = {};
      for (const [id, defaults] of Object.entries(VEHICLE_COST_DEFAULTS)) {
        merged[id] = parsed[id]
          ? mergeDeep(JSON.parse(JSON.stringify(defaults)), parsed[id])
          : JSON.parse(JSON.stringify(defaults));
      }
      return merged;
    }
  } catch (e) {
    console.error('Failed to load cost defaults:', e);
  }
  return JSON.parse(JSON.stringify(VEHICLE_COST_DEFAULTS));
}

function mergeDeep(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      mergeDeep(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

function renderVehicleCard(vt, costs, isOpen) {
  const lang = getLang();
  const label = lang === 'th' ? vt.labelTh : vt.label;
  const isEV = vt.type === 'ev';
  const badge = isEV
    ? '<span class="badge badge-success" style="margin-left:8px">EV</span>'
    : '<span class="badge badge-muted" style="margin-left:8px">ICE</span>';
  const c = costs;

  return `
    <div class="collapsible-section ${isOpen ? 'open' : ''}" data-vehicle-id="${vt.id}">
      <div class="collapsible-header">
        <div class="collapsible-header-left">
          <h4>${label}</h4>
          ${badge}
        </div>
        <span class="collapsible-chevron"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></span>
      </div>
      <div class="collapsible-body">
        <!-- Fuel -->
        <div class="data-section-label">${t('data.fuel')}</div>
        <div class="form-row-4">
          <div class="form-group">
            <label class="form-label">${t('step4.distancePerTrip')}</label>
            <input class="form-input" type="number" data-vid="${vt.id}" data-path="fuel.distancePerTrip" value="${c.fuel.distancePerTrip}" min="0" step="1" />
          </div>
          <div class="form-group">
            <label class="form-label">${isEV ? t('step4.consumptionEV') : t('step4.consumptionDiesel')}</label>
            <input class="form-input" type="number" data-vid="${vt.id}" data-path="fuel.consumptionRate" value="${c.fuel.consumptionRate}" min="0" step="0.001" />
          </div>
          <div class="form-group">
            <label class="form-label">${isEV ? t('step4.fuelPriceEV') : t('step4.fuelPriceDiesel')}</label>
            <input class="form-input" type="number" data-vid="${vt.id}" data-path="fuel.fuelPrice" value="${c.fuel.fuelPrice}" min="0" step="0.1" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('step4.wastePercent')}</label>
            <input class="form-input" type="number" data-vid="${vt.id}" data-path="fuel.wastePercent" value="${c.fuel.wastePercent}" min="0" max="100" step="1" />
          </div>
        </div>

        <!-- Labor -->
        <div class="data-section-label">${t('data.labor')}</div>
        <div class="form-row-4">
          <div class="form-group">
            <label class="form-label">${t('step4.driverSalary')}</label>
            <input class="form-input" type="number" data-vid="${vt.id}" data-path="labor.driverSalary" value="${c.labor.driverSalary}" min="0" step="1" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('step4.monitorSalary')}</label>
            <input class="form-input" type="number" data-vid="${vt.id}" data-path="labor.monitorSalary" value="${c.labor.monitorSalary}" min="0" step="1" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('step4.supervisorSalary')}</label>
            <input class="form-input" type="number" data-vid="${vt.id}" data-path="labor.supervisorSalary" value="${c.labor.supervisorSalary}" min="0" step="1" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('step4.supervisorShare')}</label>
            <input class="form-input" type="number" data-vid="${vt.id}" data-path="labor.supervisorSharePercent" value="${c.labor.supervisorSharePercent}" min="0" max="100" step="0.01" />
          </div>
        </div>

        <!-- Tires -->
        <div class="data-section-label">${t('data.tires')}</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${t('step4.tirePrice')}</label>
            <input class="form-input" type="number" data-vid="${vt.id}" data-path="tires.pricePerUnit" value="${c.tires.pricePerUnit}" min="0" step="1" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('step4.tiresPerVehicle')}</label>
            <input class="form-input" type="number" data-vid="${vt.id}" data-path="tires.tiresPerVehicle" value="${c.tires.tiresPerVehicle}" min="0" step="1" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('step4.tireReplaceKm')}</label>
            <input class="form-input" type="number" data-vid="${vt.id}" data-path="tires.replacementKm" value="${c.tires.replacementKm}" min="0" step="1000" />
          </div>
        </div>

        <!-- Insurance -->
        <div class="data-section-label">${t('data.insurance')}</div>
        <div class="form-row-4">
          <div class="form-group">
            <label class="form-label">${t('step4.vehicleInsurance')}</label>
            <input class="form-input" type="number" data-vid="${vt.id}" data-path="insurance.vehicleInsuranceYear1" value="${c.insurance.vehicleInsuranceYear1}" min="0" step="1" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('step4.insuranceIncrease')}</label>
            <input class="form-input" type="number" data-vid="${vt.id}" data-path="insurance.annualIncrease" value="${c.insurance.annualIncrease}" min="0" step="0.1" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('step4.cargoInsurance')}</label>
            <input class="form-input" type="number" data-vid="${vt.id}" data-path="insurance.cargoInsurance" value="${c.insurance.cargoInsurance}" min="0" step="1" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('step4.noClaimDiscount')}</label>
            <input class="form-input" type="number" data-vid="${vt.id}" data-path="insurance.noClaimDiscount" value="${c.insurance.noClaimDiscount}" min="0" max="1" step="0.01" />
          </div>
        </div>

        <!-- Maintenance + Expressway + Charger + Other -->
        <div class="data-section-label">${t('data.maintenance')} / ${t('data.expressway')} / ${t('data.other')}</div>
        <div class="form-row-4">
          <div class="form-group">
            <label class="form-label">${t('step4.maintenanceCostKm')}</label>
            <input class="form-input" type="number" data-vid="${vt.id}" data-path="maintenance.costPerKm" value="${c.maintenance.costPerKm}" min="0" step="0.01" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('step4.expresswayToll')}</label>
            <input class="form-input" type="number" data-vid="${vt.id}" data-path="expressway.tollPerTrip" value="${c.expressway.tollPerTrip}" min="0" step="1" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('step4.chargerMaintAnnual')}</label>
            <input class="form-input" type="number" data-vid="${vt.id}" data-path="chargerMaintenance.annualCost" value="${c.chargerMaintenance.annualCost}" min="0" step="1" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('step4.otherMonthly')}</label>
            <input class="form-input" type="number" data-vid="${vt.id}" data-path="otherCosts.monthlyPerVehicle" value="${c.otherCosts.monthlyPerVehicle}" min="0" step="1" />
          </div>
        </div>
      </div>
    </div>`;
}

export function renderDataManager() {
  const allCosts = loadCostDefaults();
  const vehicles = VEHICLE_TYPES.filter(v => v.id !== 'custom');

  const cards = vehicles.map((vt, i) =>
    renderVehicleCard(vt, allCosts[vt.id], i === 0)
  ).join('');

  return `
    <div class="animate-slide-up">
      <div class="card">
        <div class="card-header" style="display:flex;justify-content:space-between;align-items:center">
          <h3 class="card-title">${t('data.title')}</h3>
          <div style="display:flex;gap:var(--space-3)">
            <button class="btn btn-ghost" id="btn-reset-defaults">${t('data.resetDefaults')}</button>
            <button class="btn btn-primary" id="btn-save-costs">${t('data.saveAll')}</button>
          </div>
        </div>
        ${cards}
      </div>
    </div>`;
}

export function bindDataEvents(state, navigate, saveProjects, showToast) {
  // Collapsible headers
  document.querySelectorAll('.collapsible-header').forEach(header => {
    header.addEventListener('click', () => {
      header.closest('.collapsible-section').classList.toggle('open');
    });
  });

  // Save
  const saveBtn = document.getElementById('btn-save-costs');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const result = {};
      document.querySelectorAll('[data-vid][data-path]').forEach(input => {
        const vid = input.dataset.vid;
        const path = input.dataset.path;
        const val = parseFloat(input.value) || 0;
        if (!result[vid]) result[vid] = {};
        const parts = path.split('.');
        if (!result[vid][parts[0]]) result[vid][parts[0]] = {};
        result[vid][parts[0]][parts[1]] = val;
      });
      localStorage.setItem(COST_STORAGE_KEY, JSON.stringify(result));
      showToast(t('data.saved'), 'success');
    });
  }

  // Reset
  const resetBtn = document.getElementById('btn-reset-defaults');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem(COST_STORAGE_KEY);
      showToast(t('data.reset'), 'success');
      navigate('data');
    });
  }
}
