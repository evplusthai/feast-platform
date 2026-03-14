import { t } from '../i18n.js';

const NAV_ITEMS = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: 'home' },
  { id: 'wizard',    labelKey: 'nav.newStudy',  icon: 'plus' },
  { id: 'results',   labelKey: 'nav.results',   icon: 'chart' },
  { id: 'scenarios', labelKey: 'nav.scenarios', icon: 'compare' },
];

const ICONS = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  compare: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="8" height="18" rx="1"/><rect x="14" y="3" width="8" height="18" rx="1"/></svg>`,
};

export function renderNav(activeId, onNavigate) {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  let html = `<div class="nav-section-label">${t('nav.menu')}</div>`;
  for (const item of NAV_ITEMS) {
    const active = item.id === activeId ? 'active' : '';
    html += `
      <div class="nav-item ${active}" data-nav="${item.id}">
        <span class="nav-icon">${ICONS[item.icon]}</span>
        <span>${t(item.labelKey)}</span>
      </div>`;
  }
  nav.innerHTML = html;

  nav.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => onNavigate(el.dataset.nav));
  });
}
