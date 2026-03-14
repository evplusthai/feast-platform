import { t, getLang } from '../i18n.js';
import { fmtCurrency } from '../components/formatters.js';
import { VEHICLE_TYPES } from '../data/vehicleTypes.js';
import { calcTotalInvestment } from '../engine/assumptions.js';

export function renderStepInvestment(a) {
  const lang = getLang();
  const vehicleOptions = VEHICLE_TYPES.map(v => {
    const label = lang === 'th' ? v.labelTh : v.label;
    const sel = v.id === a.vehicleTypeId ? 'selected' : '';
    return `<option value="${v.id}" ${sel}>${label}</option>`;
  }).join('');

  const totalInv = calcTotalInvestment(a);
  const infra = a.infrastructure;

  return `
    <h3 class="card-title mb-6">${t('step2.title')}</h3>

    <!-- Vehicles -->
    <div class="form-section">
      <div class="form-section-title">
        <span class="section-number">1</span> ${t('step2.vehicles')}
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t('step2.vehicleType')}</label>
          <select class="form-select" id="vehicleTypeId">${vehicleOptions}</select>
        </div>
        <div class="form-group">
          <label class="form-label">${t('step2.unitPrice')}</label>
          <input class="form-input" type="number" id="vehicleUnitPrice" value="${a.vehicleUnitPrice}" min="0" step="10000" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t('step2.quantity')}</label>
          <input class="form-input" type="number" id="vehicleQty" value="${a.vehicleCount}" min="1" readonly style="opacity:0.7" />
          <div class="form-hint">Set in Step 1</div>
        </div>
        <div class="form-group">
          <label class="form-label">${t('step2.modificationCost')}</label>
          <input class="form-input" type="number" id="vehicleModificationCost" value="${a.vehicleModificationCost}" min="0" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t('step2.buyBackPercent')}</label>
          <input class="form-input" type="number" id="buyBackPercent" value="${a.buyBackPercent}" min="0" max="100" step="1" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('step2.depreciationYears')}</label>
          <input class="form-input" type="number" id="depreciationYearsVehicle" value="${a.depreciationYearsVehicle}" min="0" max="20" />
          <div class="form-hint">0 = no depreciation</div>
        </div>
      </div>
    </div>

    <!-- EV Charger -->
    <div class="form-section">
      <div class="form-section-title">
        <span class="section-number">2</span> ${t('step2.evCharger')}
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t('step2.chargerUnitPrice')}</label>
          <input class="form-input" type="number" id="evChargerUnitPrice" value="${a.evChargerUnitPrice}" min="0" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('step2.chargerQty')}</label>
          <input class="form-input" type="number" id="evChargerCount" value="${a.evChargerCount}" min="0" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t('step2.chargerInstallCost')}</label>
          <input class="form-input" type="number" id="evChargerInstallCost" value="${a.evChargerInstallCost}" min="0" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('step2.chargerDepYears')}</label>
          <input class="form-input" type="number" id="depreciationYearsCharger" value="${a.depreciationYearsCharger}" min="0" max="20" />
        </div>
      </div>
    </div>

    <!-- Infrastructure -->
    <div class="form-section">
      <div class="form-section-title">
        <span class="section-number">3</span> ${t('step2.infrastructure')}
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t('step2.office')}</label>
          <input class="form-input" type="number" id="infra_office" value="${infra.office}" min="0" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('step2.housing')}</label>
          <input class="form-input" type="number" id="infra_housing" value="${infra.housing}" min="0" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t('step2.serviceVehicles')}</label>
          <input class="form-input" type="number" id="infra_serviceVehicles" value="${infra.serviceVehicles}" min="0" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('step2.tools')}</label>
          <input class="form-input" type="number" id="infra_tools" value="${infra.tools}" min="0" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t('step2.logistics')}</label>
          <input class="form-input" type="number" id="infra_logistics" value="${infra.logistics}" min="0" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('step2.cctv')}</label>
          <input class="form-input" type="number" id="infra_cctv" value="${infra.cctv}" min="0" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t('step2.parking')}</label>
          <input class="form-input" type="number" id="infra_parking" value="${infra.parking}" min="0" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('step2.otherInfra')}</label>
          <input class="form-input" type="number" id="infra_other" value="${infra.other}" min="0" />
        </div>
      </div>
    </div>

    <!-- Battery Replacement -->
    <div class="form-section">
      <div class="form-section-title">
        <span class="section-number">4</span> ${t('step2.battery')}
      </div>
      <div class="form-row-3">
        <div class="form-group">
          <label class="form-label">${t('step2.batteryReplaceYear')}</label>
          <input class="form-input" type="number" id="batteryReplacementYear" value="${a.batteryReplacementYear}" min="1" max="15" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('step2.batteryCapacity')}</label>
          <input class="form-input" type="number" id="batteryCapacityKWh" value="${a.batteryCapacityKWh}" min="0" step="0.1" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('step2.batteryPrice')}</label>
          <input class="form-input" type="number" id="batteryPricePerKWh" value="${a.batteryPricePerKWh}" min="0" />
        </div>
      </div>
    </div>

    <!-- Total -->
    <div class="computed-value" style="font-size: var(--text-lg);">
      <span class="computed-label">${t('step2.totalInvestment')}:</span>
      &#3647; ${fmtCurrency(totalInv)}
    </div>`;
}

export function collectStepInvestment(a) {
  a.vehicleTypeId = document.getElementById('vehicleTypeId')?.value || a.vehicleTypeId;
  a.vehicleUnitPrice = parseFloat(document.getElementById('vehicleUnitPrice')?.value) || 0;
  a.vehicleModificationCost = parseFloat(document.getElementById('vehicleModificationCost')?.value) || 0;
  a.buyBackPercent = parseFloat(document.getElementById('buyBackPercent')?.value) || 0;
  a.depreciationYearsVehicle = parseInt(document.getElementById('depreciationYearsVehicle')?.value) || 0;

  a.evChargerUnitPrice = parseFloat(document.getElementById('evChargerUnitPrice')?.value) || 0;
  a.evChargerCount = parseInt(document.getElementById('evChargerCount')?.value) || 0;
  a.evChargerInstallCost = parseFloat(document.getElementById('evChargerInstallCost')?.value) || 0;
  a.depreciationYearsCharger = parseInt(document.getElementById('depreciationYearsCharger')?.value) || 0;

  a.infrastructure.office = parseFloat(document.getElementById('infra_office')?.value) || 0;
  a.infrastructure.housing = parseFloat(document.getElementById('infra_housing')?.value) || 0;
  a.infrastructure.serviceVehicles = parseFloat(document.getElementById('infra_serviceVehicles')?.value) || 0;
  a.infrastructure.tools = parseFloat(document.getElementById('infra_tools')?.value) || 0;
  a.infrastructure.logistics = parseFloat(document.getElementById('infra_logistics')?.value) || 0;
  a.infrastructure.cctv = parseFloat(document.getElementById('infra_cctv')?.value) || 0;
  a.infrastructure.parking = parseFloat(document.getElementById('infra_parking')?.value) || 0;
  a.infrastructure.other = parseFloat(document.getElementById('infra_other')?.value) || 0;

  a.batteryReplacementYear = parseInt(document.getElementById('batteryReplacementYear')?.value) || 7;
  a.batteryCapacityKWh = parseFloat(document.getElementById('batteryCapacityKWh')?.value) || 0;
  a.batteryPricePerKWh = parseFloat(document.getElementById('batteryPricePerKWh')?.value) || 0;
}
