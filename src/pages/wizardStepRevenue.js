import { t } from '../i18n.js';
import { fmtCurrency } from '../components/formatters.js';

const TRIP_LABELS = {
  normal: 'step3.normalTrip',
  field: 'step3.fieldTrip',
  staffShuttle: 'step3.staffShuttle',
  busRent: 'step3.busRent',
};

export function renderStepRevenue(a) {
  const tripCards = a.tripTypes.map((trip, i) => {
    const label = t(TRIP_LABELS[trip.name]);
    const enabled = trip.enabled ? 'enabled' : '';
    const finalPrice = trip.basePrice * (1 + trip.markup);
    const monthlyRev = finalPrice * trip.tripsPerDay * trip.workingDaysPerMonth * a.vehicleCount;

    return `
      <div class="trip-type-card ${enabled}" id="trip-card-${i}">
        <div class="trip-type-header">
          <h4>${label}</h4>
          <label class="form-toggle">
            <input type="checkbox" data-trip-toggle="${i}" ${trip.enabled ? 'checked' : ''} />
            <span class="form-toggle-slider"></span>
          </label>
        </div>
        <div class="trip-type-body">
          <div class="form-row-4">
            <div class="form-group">
              <label class="form-label">${t('step3.basePrice')}</label>
              <input class="form-input" type="number" id="trip_base_${i}" value="${trip.basePrice}" min="0" step="100" />
            </div>
            <div class="form-group">
              <label class="form-label">${t('step3.markup')}</label>
              <input class="form-input" type="number" id="trip_markup_${i}" value="${(trip.markup * 100).toFixed(1)}" min="0" max="100" step="0.1" />
            </div>
            <div class="form-group">
              <label class="form-label">${t('step3.tripsPerDay')}</label>
              <input class="form-input" type="number" id="trip_perday_${i}" value="${trip.tripsPerDay}" min="0" step="0.1" />
            </div>
            <div class="form-group">
              <label class="form-label">${t('step3.workingDays')}</label>
              <input class="form-input" type="number" id="trip_days_${i}" value="${trip.workingDaysPerMonth}" min="0" max="31" step="0.1" />
            </div>
          </div>
          <div class="flex justify-between mt-4">
            <div class="computed-value">
              <span class="computed-label">${t('step3.finalPrice')}:</span>
              &#3647; ${fmtCurrency(finalPrice)}
            </div>
            <div class="computed-value">
              <span class="computed-label">${t('step3.monthlyRevenue')} (${a.vehicleCount} ${t('step1.vehicleCount')}):</span>
              &#3647; ${fmtCurrency(monthlyRev)}
            </div>
          </div>
        </div>
      </div>`;
  }).join('');

  return `
    <h3 class="card-title mb-6">${t('step3.title')}</h3>

    <div class="form-section">
      <div class="form-section-title">${t('step3.tripTypes')}</div>
      ${tripCards}
    </div>

    <div class="form-section">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t('step3.vatRate')}</label>
          <input class="form-input" type="number" id="vatRate" value="${(a.vatRate * 100).toFixed(1)}" min="0" max="30" step="0.1" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('step3.whtRate')}</label>
          <input class="form-input" type="number" id="whtRate" value="${(a.whtRate * 100).toFixed(1)}" min="0" max="30" step="0.1" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t('step3.evChargerRental')}</label>
          <input class="form-input" type="number" id="evChargerRentalIncome" value="${a.evChargerRentalIncome}" min="0" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('step3.otherIncome')}</label>
          <input class="form-input" type="number" id="otherIncome" value="${a.otherIncome}" min="0" />
        </div>
      </div>
    </div>`;
}

export function collectStepRevenue(a) {
  a.tripTypes.forEach((trip, i) => {
    const toggle = document.querySelector(`[data-trip-toggle="${i}"]`);
    trip.enabled = toggle ? toggle.checked : trip.enabled;
    trip.basePrice = parseFloat(document.getElementById(`trip_base_${i}`)?.value) || 0;
    trip.markup = (parseFloat(document.getElementById(`trip_markup_${i}`)?.value) || 0) / 100;
    trip.tripsPerDay = parseFloat(document.getElementById(`trip_perday_${i}`)?.value) || 0;
    trip.workingDaysPerMonth = parseFloat(document.getElementById(`trip_days_${i}`)?.value) || 0;
  });

  a.vatRate = (parseFloat(document.getElementById('vatRate')?.value) || 0) / 100;
  a.whtRate = (parseFloat(document.getElementById('whtRate')?.value) || 0) / 100;
  a.evChargerRentalIncome = parseFloat(document.getElementById('evChargerRentalIncome')?.value) || 0;
  a.otherIncome = parseFloat(document.getElementById('otherIncome')?.value) || 0;
}
