import { t } from '../i18n.js';
import { escHtml } from '../components/formatters.js';

export function renderStepProjectInfo(a) {
  // Calculate end date
  const startDate = a.startDate || new Date().toISOString().split('T')[0];
  const start = new Date(startDate);
  const totalMonths = (a.contractPeriodYears || 0) * 12 + (a.contractPeriodMonths || 0);
  const end = new Date(start);
  end.setMonth(end.getMonth() + totalMonths);
  const endDateStr = end.toISOString().split('T')[0];

  return `
    <h3 class="card-title mb-6">${t('step1.title')}</h3>

    <div class="form-section">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t('step1.scenarioName')}</label>
          <input class="form-input" type="text" id="scenarioName" value="${escHtml(a.scenarioName)}" placeholder="Base Case" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('step1.projectName')}</label>
          <input class="form-input" type="text" id="projectName" value="${escHtml(a.projectName)}" placeholder="AISB School Bus Service" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t('step1.clientName')}</label>
          <input class="form-input" type="text" id="clientName" value="${escHtml(a.clientName)}" placeholder="Australian International School Bangkok" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('step1.vehicleCount')}</label>
          <input class="form-input" type="number" id="vehicleCount" value="${a.vehicleCount}" min="1" max="500" />
        </div>
      </div>
    </div>

    <div class="form-section">
      <div class="form-section-title">${t('step1.contractPeriod')}</div>
      <div class="form-row-4">
        <div class="form-group">
          <label class="form-label">${t('step1.years')}</label>
          <input class="form-input" type="number" id="contractYears" value="${a.contractPeriodYears}" min="0" max="15" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('step1.months')}</label>
          <input class="form-input" type="number" id="contractMonths" value="${a.contractPeriodMonths}" min="0" max="11" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('step1.startDate')}</label>
          <input class="form-input" type="date" id="startDate" value="${startDate}" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('step1.endDate')}</label>
          <input class="form-input" type="date" id="endDate" value="${endDateStr}" readonly style="opacity:0.7" />
        </div>
      </div>
    </div>

    <div class="form-section">
      <div class="form-group">
        <label class="form-label">${t('step1.serviceRoute')}</label>
        <input class="form-input" type="text" id="serviceRoute" value="${escHtml(a.serviceRoute)}" placeholder="Bangkok - School Bus Routes" />
      </div>
      <div class="form-group">
        <label class="form-label">${t('step1.projectScope')}</label>
        <textarea class="form-input" id="projectScope" rows="3" placeholder="Describe the project scope...">${escHtml(a.projectScope)}</textarea>
      </div>
    </div>`;
}

export function collectStepProjectInfo(a) {
  a.scenarioName = document.getElementById('scenarioName')?.value || a.scenarioName;
  a.projectName = document.getElementById('projectName')?.value || a.projectName;
  a.clientName = document.getElementById('clientName')?.value || a.clientName;
  a.vehicleCount = parseInt(document.getElementById('vehicleCount')?.value) || a.vehicleCount;
  a.contractPeriodYears = parseInt(document.getElementById('contractYears')?.value) || 0;
  a.contractPeriodMonths = parseInt(document.getElementById('contractMonths')?.value) || 0;
  a.startDate = document.getElementById('startDate')?.value || a.startDate;
  a.serviceRoute = document.getElementById('serviceRoute')?.value || a.serviceRoute;
  a.projectScope = document.getElementById('projectScope')?.value || a.projectScope;
}
