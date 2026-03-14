import { t } from '../i18n.js';

export function renderStepCosts(a) {
  const chevronSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>`;

  return `
    <h3 class="card-title mb-6">${t('step4.title')}</h3>

    <!-- 1. Fuel/Energy -->
    <div class="collapsible-section open">
      <div class="collapsible-header">
        <div class="collapsible-header-left">
          <div class="collapsible-icon">&#9981;</div>
          <h4>${t('step4.fuel')}</h4>
        </div>
        <span class="collapsible-chevron">${chevronSvg}</span>
      </div>
      <div class="collapsible-body">
        <div class="form-row-4">
          <div class="form-group">
            <label class="form-label">${t('step4.distancePerTrip')}</label>
            <input class="form-input" type="number" id="fuel_distance" value="${a.fuel.distancePerTrip}" min="0" step="1" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('step4.consumptionRate')}</label>
            <input class="form-input" type="number" id="fuel_consumption" value="${a.fuel.consumptionRate}" min="0" step="0.001" />
            <div class="form-hint">L/km or kWh/km</div>
          </div>
          <div class="form-group">
            <label class="form-label">${t('step4.fuelPrice')}</label>
            <input class="form-input" type="number" id="fuel_price" value="${a.fuel.fuelPrice}" min="0" step="0.1" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('step4.wastePercent')}</label>
            <input class="form-input" type="number" id="fuel_waste" value="${a.fuel.wastePercent}" min="0" max="100" step="1" />
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Labor -->
    <div class="collapsible-section open">
      <div class="collapsible-header">
        <div class="collapsible-header-left">
          <div class="collapsible-icon">&#128100;</div>
          <h4>${t('step4.labor')}</h4>
        </div>
        <span class="collapsible-chevron">${chevronSvg}</span>
      </div>
      <div class="collapsible-body">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${t('step4.driverSalary')}</label>
            <input class="form-input" type="number" id="labor_driverSalary" value="${a.labor.driverSalary}" min="0" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('step4.driverCount')}</label>
            <input class="form-input" type="number" id="labor_driverCount" value="${a.labor.driverCount}" min="0" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${t('step4.monitorSalary')}</label>
            <input class="form-input" type="number" id="labor_monitorSalary" value="${a.labor.monitorSalary}" min="0" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('step4.monitorCount')}</label>
            <input class="form-input" type="number" id="labor_monitorCount" value="${a.labor.monitorCount}" min="0" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${t('step4.supervisorShare')}</label>
            <input class="form-input" type="number" id="labor_supervisorShare" value="${a.labor.supervisorSharePercent}" min="0" max="100" step="0.01" />
            <div class="form-hint">% of supervisor cost allocated</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Tires -->
    <div class="collapsible-section">
      <div class="collapsible-header">
        <div class="collapsible-header-left">
          <div class="collapsible-icon">&#9898;</div>
          <h4>${t('step4.tires')}</h4>
        </div>
        <span class="collapsible-chevron">${chevronSvg}</span>
      </div>
      <div class="collapsible-body">
        <div class="form-row-3">
          <div class="form-group">
            <label class="form-label">${t('step4.tirePrice')}</label>
            <input class="form-input" type="number" id="tire_price" value="${a.tires.pricePerUnit}" min="0" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('step4.tiresPerVehicle')}</label>
            <input class="form-input" type="number" id="tire_perVehicle" value="${a.tires.tiresPerVehicle}" min="0" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('step4.replacementKm')}</label>
            <input class="form-input" type="number" id="tire_replaceKm" value="${a.tires.replacementKm}" min="1" />
          </div>
        </div>
      </div>
    </div>

    <!-- 4. Insurance -->
    <div class="collapsible-section">
      <div class="collapsible-header">
        <div class="collapsible-header-left">
          <div class="collapsible-icon">&#128737;</div>
          <h4>${t('step4.insurance')}</h4>
        </div>
        <span class="collapsible-chevron">${chevronSvg}</span>
      </div>
      <div class="collapsible-body">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${t('step4.vehicleInsurance')}</label>
            <input class="form-input" type="number" id="ins_vehicle" value="${a.insurance.vehicleInsuranceYear1}" min="0" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('step4.insuranceIncrease')}</label>
            <input class="form-input" type="number" id="ins_increase" value="${a.insurance.annualIncrease}" min="0" max="100" step="0.1" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${t('step4.cargoInsurance')}</label>
            <input class="form-input" type="number" id="ins_cargo" value="${a.insurance.cargoInsurance}" min="0" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('step4.accidentRate')}</label>
            <input class="form-input" type="number" id="ins_accident" value="${a.insurance.accidentAdjustment}" min="0" max="100" step="1" />
          </div>
        </div>
      </div>
    </div>

    <!-- 5. Expressway -->
    <div class="collapsible-section">
      <div class="collapsible-header">
        <div class="collapsible-header-left">
          <div class="collapsible-icon">&#128739;</div>
          <h4>${t('step4.expressway')}</h4>
        </div>
        <span class="collapsible-chevron">${chevronSvg}</span>
      </div>
      <div class="collapsible-body">
        <div class="form-group">
          <label class="form-label">${t('step4.tollPerTrip')}</label>
          <input class="form-input" type="number" id="expressway_toll" value="${a.expressway.tollPerTrip}" min="0" />
        </div>
      </div>
    </div>

    <!-- 6. Maintenance -->
    <div class="collapsible-section">
      <div class="collapsible-header">
        <div class="collapsible-header-left">
          <div class="collapsible-icon">&#128295;</div>
          <h4>${t('step4.maintenance')}</h4>
        </div>
        <span class="collapsible-chevron">${chevronSvg}</span>
      </div>
      <div class="collapsible-body">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${t('step4.maintCostPerKm')}</label>
            <input class="form-input" type="number" id="maint_costPerKm" value="${a.maintenance.costPerKm}" min="0" step="0.01" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('step4.maintEscalation')}</label>
            <input class="form-input" type="number" id="maint_escalation" value="${a.maintenance.escalationRate}" min="0" max="100" step="0.1" />
          </div>
        </div>
      </div>
    </div>

    <!-- 7. Charger Maintenance -->
    <div class="collapsible-section">
      <div class="collapsible-header">
        <div class="collapsible-header-left">
          <div class="collapsible-icon">&#9889;</div>
          <h4>${t('step4.chargerMaint')}</h4>
        </div>
        <span class="collapsible-chevron">${chevronSvg}</span>
      </div>
      <div class="collapsible-body">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${t('step4.chargerMaintAnnual')}</label>
            <input class="form-input" type="number" id="chargerMaint_annual" value="${a.chargerMaintenance.annualCost}" min="0" />
          </div>
          <div class="form-group">
            <label class="form-label">${t('step4.maintEscalation')}</label>
            <input class="form-input" type="number" id="chargerMaint_escalation" value="${a.chargerMaintenance.escalationRate}" min="0" max="100" step="0.1" />
          </div>
        </div>
      </div>
    </div>

    <!-- 8. Other Costs -->
    <div class="collapsible-section open">
      <div class="collapsible-header">
        <div class="collapsible-header-left">
          <div class="collapsible-icon">&#128196;</div>
          <h4>${t('step4.otherCosts')}</h4>
        </div>
        <span class="collapsible-chevron">${chevronSvg}</span>
      </div>
      <div class="collapsible-body">
        <div class="form-group">
          <label class="form-label">${t('step4.otherMonthly')} (${t('fin.perVehicle')})</label>
          <input class="form-input" type="number" id="other_monthly" value="${a.otherCosts.monthlyPerVehicle}" min="0" />
          <div class="form-hint">GPS, permits, office supplies, parking, etc.</div>
        </div>
      </div>
    </div>`;
}

export function collectStepCosts(a) {
  a.fuel.distancePerTrip = parseFloat(document.getElementById('fuel_distance')?.value) || 0;
  a.fuel.consumptionRate = parseFloat(document.getElementById('fuel_consumption')?.value) || 0;
  a.fuel.fuelPrice = parseFloat(document.getElementById('fuel_price')?.value) || 0;
  a.fuel.wastePercent = parseFloat(document.getElementById('fuel_waste')?.value) || 0;

  a.labor.driverSalary = parseFloat(document.getElementById('labor_driverSalary')?.value) || 0;
  a.labor.driverCount = parseInt(document.getElementById('labor_driverCount')?.value) || 0;
  a.labor.monitorSalary = parseFloat(document.getElementById('labor_monitorSalary')?.value) || 0;
  a.labor.monitorCount = parseInt(document.getElementById('labor_monitorCount')?.value) || 0;
  a.labor.supervisorSharePercent = parseFloat(document.getElementById('labor_supervisorShare')?.value) || 0;

  a.tires.pricePerUnit = parseFloat(document.getElementById('tire_price')?.value) || 0;
  a.tires.tiresPerVehicle = parseInt(document.getElementById('tire_perVehicle')?.value) || 0;
  a.tires.replacementKm = parseFloat(document.getElementById('tire_replaceKm')?.value) || 1;

  a.insurance.vehicleInsuranceYear1 = parseFloat(document.getElementById('ins_vehicle')?.value) || 0;
  a.insurance.annualIncrease = parseFloat(document.getElementById('ins_increase')?.value) || 0;
  a.insurance.cargoInsurance = parseFloat(document.getElementById('ins_cargo')?.value) || 0;
  a.insurance.accidentAdjustment = parseFloat(document.getElementById('ins_accident')?.value) || 0;

  a.expressway.tollPerTrip = parseFloat(document.getElementById('expressway_toll')?.value) || 0;

  a.maintenance.costPerKm = parseFloat(document.getElementById('maint_costPerKm')?.value) || 0;
  a.maintenance.escalationRate = parseFloat(document.getElementById('maint_escalation')?.value) || 0;

  a.chargerMaintenance.annualCost = parseFloat(document.getElementById('chargerMaint_annual')?.value) || 0;
  a.chargerMaintenance.escalationRate = parseFloat(document.getElementById('chargerMaint_escalation')?.value) || 0;

  a.otherCosts.monthlyPerVehicle = parseFloat(document.getElementById('other_monthly')?.value) || 0;
}
