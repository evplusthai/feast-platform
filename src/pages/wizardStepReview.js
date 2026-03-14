import { t } from '../i18n.js';
import { fmtCurrency, fmtPercent } from '../components/formatters.js';
import { calcTotalInvestment } from '../engine/assumptions.js';

export function renderStepReview(a) {
  const totalInv = calcTotalInvestment(a);
  const totalMonths = a.contractPeriodYears * 12 + a.contractPeriodMonths;

  // Calculate monthly revenue estimate
  let monthlyRev = 0;
  a.tripTypes.forEach(trip => {
    if (trip.enabled) {
      const price = trip.basePrice * (1 + trip.markup);
      monthlyRev += price * trip.tripsPerDay * trip.workingDaysPerMonth;
    }
  });
  monthlyRev *= a.vehicleCount;
  monthlyRev += a.evChargerRentalIncome + a.otherIncome;

  // Calculate monthly cost estimate
  const fuelCostPerTrip = a.fuel.distancePerTrip * (1 + a.fuel.wastePercent / 100) * a.fuel.consumptionRate * a.fuel.fuelPrice;
  let totalTripsPerMonth = 0;
  a.tripTypes.forEach(trip => {
    if (trip.enabled) totalTripsPerMonth += trip.tripsPerDay * trip.workingDaysPerMonth;
  });
  const fuelMonthly = fuelCostPerTrip * totalTripsPerMonth * a.vehicleCount;
  const laborMonthly = (a.labor.driverSalary * a.labor.driverCount) + (a.labor.monitorSalary * a.labor.monitorCount);
  const otherMonthly = a.otherCosts.monthlyPerVehicle * a.vehicleCount;
  const totalMonthlyCost = fuelMonthly + laborMonthly + otherMonthly;

  return `
    <h3 class="card-title mb-4">${t('step6.title')}</h3>
    <p class="text-sm text-muted mb-6">${t('step6.generateDesc')}</p>

    <!-- Project Info -->
    <div class="review-section">
      <div class="review-section-header">
        <h3>${t('wizard.step1')}</h3>
        <button class="btn btn-sm btn-ghost" data-goto-step="0">${t('step6.edit')}</button>
      </div>
      <div class="review-grid">
        <div class="review-item">
          <span class="review-item-label">${t('step1.projectName')}</span>
          <span class="review-item-value">${a.projectName || '-'}</span>
        </div>
        <div class="review-item">
          <span class="review-item-label">${t('step1.clientName')}</span>
          <span class="review-item-value">${a.clientName || '-'}</span>
        </div>
        <div class="review-item">
          <span class="review-item-label">${t('step1.contractPeriod')}</span>
          <span class="review-item-value">${a.contractPeriodYears}Y ${a.contractPeriodMonths}M (${totalMonths} ${t('fin.month')})</span>
        </div>
        <div class="review-item">
          <span class="review-item-label">${t('step1.vehicleCount')}</span>
          <span class="review-item-value">${a.vehicleCount}</span>
        </div>
        <div class="review-item">
          <span class="review-item-label">${t('step1.startDate')}</span>
          <span class="review-item-value">${a.startDate}</span>
        </div>
      </div>
    </div>

    <!-- Investment -->
    <div class="review-section">
      <div class="review-section-header">
        <h3>${t('wizard.step2')}</h3>
        <button class="btn btn-sm btn-ghost" data-goto-step="1">${t('step6.edit')}</button>
      </div>
      <div class="review-grid">
        <div class="review-item">
          <span class="review-item-label">${t('step2.totalInvestment')}</span>
          <span class="review-item-value">&#3647; ${fmtCurrency(totalInv)}</span>
        </div>
        <div class="review-item">
          <span class="review-item-label">${t('step2.unitPrice')}</span>
          <span class="review-item-value">&#3647; ${fmtCurrency(a.vehicleUnitPrice)}</span>
        </div>
        <div class="review-item">
          <span class="review-item-label">${t('step2.evCharger')}</span>
          <span class="review-item-value">${a.evChargerCount} units</span>
        </div>
        <div class="review-item">
          <span class="review-item-label">${t('step2.buyBackPercent')}</span>
          <span class="review-item-value">${a.buyBackPercent}%</span>
        </div>
      </div>
    </div>

    <!-- Revenue -->
    <div class="review-section">
      <div class="review-section-header">
        <h3>${t('wizard.step3')}</h3>
        <button class="btn btn-sm btn-ghost" data-goto-step="2">${t('step6.edit')}</button>
      </div>
      <div class="review-grid">
        <div class="review-item">
          <span class="review-item-label">${t('step3.totalMonthlyRevenue')}</span>
          <span class="review-item-value">&#3647; ${fmtCurrency(monthlyRev)}</span>
        </div>
        ${a.tripTypes.map(trip => {
          if (!trip.enabled) return '';
          const label = t({normal:'step3.normalTrip',field:'step3.fieldTrip',staffShuttle:'step3.staffShuttle',busRent:'step3.busRent'}[trip.name]);
          return `<div class="review-item">
            <span class="review-item-label">${label}</span>
            <span class="review-item-value">&#3647; ${fmtCurrency(trip.basePrice * (1 + trip.markup))}/trip</span>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- Costs -->
    <div class="review-section">
      <div class="review-section-header">
        <h3>${t('wizard.step4')}</h3>
        <button class="btn btn-sm btn-ghost" data-goto-step="3">${t('step6.edit')}</button>
      </div>
      <div class="review-grid">
        <div class="review-item">
          <span class="review-item-label">${t('step4.totalMonthlyCost')} (est.)</span>
          <span class="review-item-value">&#3647; ${fmtCurrency(totalMonthlyCost)}</span>
        </div>
        <div class="review-item">
          <span class="review-item-label">${t('step4.fuel')}</span>
          <span class="review-item-value">&#3647; ${fmtCurrency(fuelMonthly)}/mo</span>
        </div>
        <div class="review-item">
          <span class="review-item-label">${t('step4.labor')}</span>
          <span class="review-item-value">&#3647; ${fmtCurrency(laborMonthly)}/mo</span>
        </div>
      </div>
    </div>

    <!-- Financing -->
    <div class="review-section">
      <div class="review-section-header">
        <h3>${t('wizard.step5')}</h3>
        <button class="btn btn-sm btn-ghost" data-goto-step="4">${t('step6.edit')}</button>
      </div>
      <div class="review-grid">
        <div class="review-item">
          <span class="review-item-label">${t('step5.equityPercent')}</span>
          <span class="review-item-value">${a.equityPercent}%</span>
        </div>
        <div class="review-item">
          <span class="review-item-label">${t('step5.ltLoanRate')}</span>
          <span class="review-item-value">${fmtPercent(a.ltLoanRate)}</span>
        </div>
        <div class="review-item">
          <span class="review-item-label">${t('step5.wacc')}</span>
          <span class="review-item-value">${fmtPercent(a.wacc)}</span>
        </div>
        <div class="review-item">
          <span class="review-item-label">${t('step5.taxRate')}</span>
          <span class="review-item-value">${fmtPercent(a.taxRate)}</span>
        </div>
      </div>
    </div>`;
}
