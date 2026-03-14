import { t } from '../i18n.js';

const STEPS = [
  { id: 'project',    labelKey: 'wizard.step1' },
  { id: 'investment', labelKey: 'wizard.step2' },
  { id: 'revenue',    labelKey: 'wizard.step3' },
  { id: 'costs',      labelKey: 'wizard.step4' },
  { id: 'financing',  labelKey: 'wizard.step5' },
  { id: 'review',     labelKey: 'wizard.step6' },
];

export { STEPS };

export function renderStepIndicator(currentStep) {
  let html = '<div class="wizard-steps">';
  STEPS.forEach((step, i) => {
    const state = i < currentStep ? 'completed' : i === currentStep ? 'active' : '';
    const checkmark = i < currentStep ? '&#10003;' : (i + 1);

    if (i > 0) {
      html += `<div class="wizard-step-connector"></div>`;
    }

    html += `
      <div class="wizard-step ${state}">
        <div class="wizard-step-number">${checkmark}</div>
        <span>${t(step.labelKey)}</span>
      </div>`;
  });
  html += '</div>';
  return html;
}
