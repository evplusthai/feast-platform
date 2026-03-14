import { t, getLang } from '../i18n.js';
import { VEHICLE_TYPES, VEHICLE_COST_DEFAULTS, getAllVehicleTypes, saveCustomVehicles } from '../data/vehicleTypes.js';

const COST_STORAGE_KEY = 'feast_vehicle_costs';
const CUSTOM_VEHICLES_KEY = 'feast_custom_vehicles';

function loadCostDefaults() {
  try {
    const stored = localStorage.getItem(COST_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const merged = {};
      for (const [id, defaults] of Object.entries(VEHICLE_COST_DEFAULTS)) {
        merged[id] = parsed[id]
          ? mergeDeep(JSON.parse(JSON.stringify(defaults)), parsed[id])
          : JSON.parse(JSON.stringify(defaults));
      }
      // Include custom vehicle cost overrides
      const customs = loadCustomVehicles();
      for (const entry of customs) {
        merged[entry.vehicle.id] = parsed[entry.vehicle.id]
          ? mergeDeep(JSON.parse(JSON.stringify(entry.costs)), parsed[entry.vehicle.id])
          : JSON.parse(JSON.stringify(entry.costs));
      }
      return merged;
    }
  } catch (e) {
    console.error('Failed to load cost defaults:', e);
  }
  // No overrides — return built-in + custom defaults
  const result = JSON.parse(JSON.stringify(VEHICLE_COST_DEFAULTS));
  const customs = loadCustomVehicles();
  for (const entry of customs) {
    result[entry.vehicle.id] = JSON.parse(JSON.stringify(entry.costs));
  }
  return result;
}

function loadCustomVehicles() {
  try {
    const stored = localStorage.getItem(CUSTOM_VEHICLES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) { return []; }
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

function getDefaultCostEntry() {
  return {
    fuel: { distancePerTrip: 100, consumptionRate: 0.15, fuelPrice: 32, wastePercent: 0 },
    labor: { driverSalary: 15000, monitorSalary: 14000, supervisorSalary: 16000, supervisorSharePercent: 6.67 },
    tires: { pricePerUnit: 5000, tiresPerVehicle: 4, replacementKm: 50000 },
    insurance: { vehicleInsuranceYear1: 10000, annualIncrease: 0, cargoInsurance: 0, accidentAdjustment: 0, noClaimDiscount: 0.10 },
    expressway: { tollPerTrip: 0 },
    maintenance: { costPerKm: 0.50, escalationRate: 0 },
    chargerMaintenance: { annualCost: 0, escalationRate: 0 },
    otherCosts: { monthlyPerVehicle: 1000 },
  };
}

function renderVehicleCard(vt, costs, isOpen, isCustom) {
  const lang = getLang();
  const label = lang === 'th' ? vt.labelTh : vt.label;
  const isEV = vt.type === 'ev';
  const badge = isEV
    ? '<span class="badge badge-success" style="margin-left:8px">EV</span>'
    : '<span class="badge badge-muted" style="margin-left:8px">ICE</span>';
  const deleteBtn = isCustom
    ? `<button class="btn btn-ghost" style="color:var(--color-red-400);font-size:var(--text-xs);padding:2px 8px" data-delete-vehicle="${vt.id}">${t('data.deleteVehicle')}</button>`
    : '';
  const c = costs;

  return `
    <div class="collapsible-section ${isOpen ? 'open' : ''}" data-vehicle-id="${vt.id}">
      <div class="collapsible-header">
        <div class="collapsible-header-left">
          <h4>${label}</h4>
          ${badge}
          ${deleteBtn}
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

function renderAddVehicleForm() {
  return `
    <div id="add-vehicle-form" style="border:2px dashed var(--color-primary-500);border-radius:var(--radius-lg);display:none;margin-bottom:var(--space-4)">
      <div style="padding:var(--space-5)">
        <h4 style="margin-bottom:var(--space-4)">${t('data.addVehicle')}</h4>

        <div class="data-section-label">${t('data.vehicleSpecs')}</div>
        <div class="form-row-4">
          <div class="form-group">
            <label class="form-label">${t('data.vehicleName')}</label>
            <input class="form-input" type="text" id="new-v-name" placeholder="e.g. BYD K9" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('data.vehicleNameTh')}</label>
            <input class="form-input" type="text" id="new-v-name-th" placeholder="e.g. BYD K9" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('data.vehiclePrice')}</label>
            <input class="form-input" type="number" id="new-v-price" value="0" min="0" step="1000" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('data.vehicleSeats')}</label>
            <input class="form-input" type="number" id="new-v-seats" value="0" min="0" step="1" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${t('data.vehicleType')}</label>
            <select class="form-select" id="new-v-type">
              <option value="diesel">ICE (Diesel)</option>
              <option value="ev">EV (Electric)</option>
            </select>
          </div>
          <div class="form-group" id="new-v-fuel-group">
            <label class="form-label">${t('data.fuelConsumption')}</label>
            <input class="form-input" type="number" id="new-v-fuel" value="5" min="0" step="0.1" />
          </div>
          <div class="form-group" id="new-v-battery-group" style="display:none">
            <label class="form-label">${t('data.batteryKwh')}</label>
            <input class="form-input" type="number" id="new-v-battery" value="100" min="0" step="1" />
          </div>
          <div class="form-group" id="new-v-consumption-group" style="display:none">
            <label class="form-label">${t('data.consumptionRate')}</label>
            <input class="form-input" type="number" id="new-v-consumption" value="0.8" min="0" step="0.01" />
          </div>
        </div>

        <div style="display:flex;gap:var(--space-3);justify-content:flex-end;margin-top:var(--space-4)">
          <button class="btn btn-ghost" id="btn-cancel-add">${t('data.cancel')}</button>
          <button class="btn btn-primary" id="btn-confirm-add">${t('data.addVehicle')}</button>
        </div>
      </div>
    </div>`;
}

export function renderDataManager() {
  const allCosts = loadCostDefaults();
  const builtIn = VEHICLE_TYPES.filter(v => v.id !== 'custom');
  const customs = loadCustomVehicles();

  const builtInCards = builtIn.map((vt, i) =>
    renderVehicleCard(vt, allCosts[vt.id], i === 0, false)
  ).join('');

  const customCards = customs.map(entry =>
    renderVehicleCard(entry.vehicle, allCosts[entry.vehicle.id] || entry.costs, false, true)
  ).join('');

  return `
    <div class="animate-slide-up">
      <div class="card">
        <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--space-2)">
          <h3 class="card-title">${t('data.title')}</h3>
          <div style="display:flex;gap:var(--space-3)">
            <button class="btn btn-ghost" id="btn-reset-defaults">${t('data.resetDefaults')}</button>
            <button class="btn btn-accent" id="btn-show-add">${t('data.addVehicle')}</button>
            <button class="btn btn-primary" id="btn-save-costs">${t('data.saveAll')}</button>
          </div>
        </div>
        ${renderAddVehicleForm()}
        ${builtInCards}
        ${customCards}
      </div>
    </div>`;
}

export function bindDataEvents(state, navigate, saveProjects, showToast) {
  // Collapsible headers
  document.querySelectorAll('.collapsible-header').forEach(header => {
    header.addEventListener('click', (e) => {
      if (e.target.closest('[data-delete-vehicle]')) return;
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

  // Show Add Vehicle form
  const showAddBtn = document.getElementById('btn-show-add');
  const addForm = document.getElementById('add-vehicle-form');
  if (showAddBtn && addForm) {
    showAddBtn.addEventListener('click', () => {
      addForm.style.display = addForm.style.display === 'none' ? 'block' : 'none';
    });
  }

  // Cancel Add
  const cancelBtn = document.getElementById('btn-cancel-add');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (addForm) addForm.style.display = 'none';
    });
  }

  // Toggle EV/ICE fields in add form
  const typeSelect = document.getElementById('new-v-type');
  if (typeSelect) {
    typeSelect.addEventListener('change', () => {
      const isEV = typeSelect.value === 'ev';
      document.getElementById('new-v-fuel-group').style.display = isEV ? 'none' : '';
      document.getElementById('new-v-battery-group').style.display = isEV ? '' : 'none';
      document.getElementById('new-v-consumption-group').style.display = isEV ? '' : 'none';
    });
  }

  // Confirm Add
  const confirmBtn = document.getElementById('btn-confirm-add');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      const name = document.getElementById('new-v-name')?.value?.trim();
      if (!name) return;
      const nameTh = document.getElementById('new-v-name-th')?.value?.trim() || name;
      const price = parseFloat(document.getElementById('new-v-price')?.value) || 0;
      const seats = parseInt(document.getElementById('new-v-seats')?.value) || 0;
      const vType = document.getElementById('new-v-type')?.value || 'diesel';
      const isEV = vType === 'ev';

      const vehicle = {
        id: 'custom_' + Date.now(),
        label: name,
        labelTh: nameTh,
        defaultPrice: price,
        seats,
        type: vType,
        isCustom: true,
      };

      if (isEV) {
        vehicle.batteryKWh = parseFloat(document.getElementById('new-v-battery')?.value) || 100;
        vehicle.consumptionRate = parseFloat(document.getElementById('new-v-consumption')?.value) || 0.8;
      } else {
        vehicle.fuelConsumption = parseFloat(document.getElementById('new-v-fuel')?.value) || 5;
      }

      const costs = getDefaultCostEntry();
      if (isEV) {
        costs.fuel.consumptionRate = vehicle.consumptionRate || 0.8;
        costs.fuel.fuelPrice = 6;
        costs.chargerMaintenance.annualCost = 15000;
      } else {
        costs.fuel.consumptionRate = vehicle.fuelConsumption ? (1 / vehicle.fuelConsumption) : 0.15;
        costs.fuel.fuelPrice = 32;
      }

      const customs = loadCustomVehicles();
      customs.push({ vehicle, costs });
      saveCustomVehicles(customs);
      showToast(t('data.saved'), 'success');
      navigate('data');
    });
  }

  // Delete custom vehicle
  document.querySelectorAll('[data-delete-vehicle]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const vid = btn.dataset.deleteVehicle;
      if (!confirm(t('data.confirmDelete'))) return;
      const customs = loadCustomVehicles().filter(e => e.vehicle.id !== vid);
      saveCustomVehicles(customs);
      // Also clean cost overrides
      try {
        const stored = localStorage.getItem(COST_STORAGE_KEY);
        if (stored) {
          const overrides = JSON.parse(stored);
          delete overrides[vid];
          localStorage.setItem(COST_STORAGE_KEY, JSON.stringify(overrides));
        }
      } catch (e) { /* ignore */ }
      navigate('data');
    });
  });
}
