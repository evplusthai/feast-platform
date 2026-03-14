import { t } from '../i18n.js';
import { fmtCurrency } from '../components/formatters.js';
import { calcTotalInvestment } from '../engine/assumptions.js';

export function renderStepFinancing(a) {
  const totalInv = calcTotalInvestment(a);
  const equityAmt = totalInv * (a.equityPercent / 100);
  const debtAmt = totalInv - equityAmt;

  return `
    <h3 class="card-title mb-6">${t('step5.title')}</h3>

    <!-- Loan Structure -->
    <div class="form-section">
      <div class="form-section-title">
        <span class="section-number">1</span> ${t('step5.loanStructure')}
      </div>

      <div class="computed-value mb-4" style="font-size: var(--text-base);">
        <span class="computed-label">${t('step5.totalInvestment')}:</span>
        &#3647; ${fmtCurrency(totalInv)}
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t('step5.equityPercent')}</label>
          <input class="form-input" type="number" id="equityPercent" value="${a.equityPercent}" min="0" max="100" step="0.1" />
          <div class="form-hint">&#3647; ${fmtCurrency(equityAmt)}</div>
        </div>
        <div class="form-group">
          <label class="form-label">${t('step5.debtPercent')}</label>
          <input class="form-input" type="number" value="${(100 - a.equityPercent).toFixed(1)}" readonly style="opacity:0.7" />
          <div class="form-hint">&#3647; ${fmtCurrency(debtAmt)}</div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t('step5.ltLoanRate')}</label>
          <input class="form-input" type="number" id="ltLoanRate" value="${(a.ltLoanRate * 100).toFixed(3)}" min="0" max="30" step="0.001" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('step5.ltLoanTerm')}</label>
          <input class="form-input" type="number" id="ltLoanTermYears" value="${a.ltLoanTermYears}" min="1" max="20" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t('step5.stLoanRate')}</label>
          <input class="form-input" type="number" id="stLoanRate" value="${(a.stLoanRate * 100).toFixed(3)}" min="0" max="30" step="0.001" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('step5.minCashBalance')}</label>
          <input class="form-input" type="number" id="minCashBalance" value="${a.minCashBalance}" min="0" step="10000" />
        </div>
      </div>
    </div>

    <!-- Depreciation & Salvage -->
    <div class="form-section">
      <div class="form-section-title">
        <span class="section-number">2</span> ${t('step5.depreciation')}
      </div>
      <div class="form-row-3">
        <div class="form-group">
          <label class="form-label">${t('step5.vehicleDepYears')}</label>
          <input class="form-input" type="number" id="depYearsVehicle" value="${a.depreciationYearsVehicle}" min="0" max="20" />
          <div class="form-hint">0 = no depreciation</div>
        </div>
        <div class="form-group">
          <label class="form-label">${t('step5.chargerDepYears')}</label>
          <input class="form-input" type="number" id="depYearsCharger" value="${a.depreciationYearsCharger}" min="0" max="20" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('step5.salvageValue')}</label>
          <input class="form-input" type="number" id="salvageValuePercent" value="${a.salvageValuePercent}" min="0" max="100" step="0.1" />
        </div>
      </div>
    </div>

    <!-- Discount Rate & Tax -->
    <div class="form-section">
      <div class="form-section-title">
        <span class="section-number">3</span> ${t('step5.discountRate')}
      </div>
      <div class="form-row-3">
        <div class="form-group">
          <label class="form-label">${t('step5.wacc')}</label>
          <input class="form-input" type="number" id="wacc" value="${(a.wacc * 100).toFixed(3)}" min="0" max="30" step="0.001" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('step5.inflationRate')}</label>
          <input class="form-input" type="number" id="inflationRate" value="${(a.inflationRate * 100).toFixed(1)}" min="0" max="30" step="0.1" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('step5.taxRate')}</label>
          <input class="form-input" type="number" id="taxRate" value="${(a.taxRate * 100).toFixed(0)}" min="0" max="50" step="1" />
        </div>
      </div>
    </div>`;
}

export function collectStepFinancing(a) {
  a.equityPercent = parseFloat(document.getElementById('equityPercent')?.value) || 0;
  a.ltLoanRate = (parseFloat(document.getElementById('ltLoanRate')?.value) || 0) / 100;
  a.ltLoanTermYears = parseInt(document.getElementById('ltLoanTermYears')?.value) || 5;
  a.stLoanRate = (parseFloat(document.getElementById('stLoanRate')?.value) || 0) / 100;
  a.minCashBalance = parseFloat(document.getElementById('minCashBalance')?.value) || 0;
  a.depreciationYearsVehicle = parseInt(document.getElementById('depYearsVehicle')?.value) || 0;
  a.depreciationYearsCharger = parseInt(document.getElementById('depYearsCharger')?.value) || 0;
  a.salvageValuePercent = parseFloat(document.getElementById('salvageValuePercent')?.value) || 0;
  a.wacc = (parseFloat(document.getElementById('wacc')?.value) || 0) / 100;
  a.inflationRate = (parseFloat(document.getElementById('inflationRate')?.value) || 0) / 100;
  a.taxRate = (parseFloat(document.getElementById('taxRate')?.value) || 0) / 100;
}
