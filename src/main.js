import { t, toggleLang, getLang, onLangChange } from './i18n.js';
import { renderNav } from './components/nav.js';
import { renderDashboard, bindDashboardEvents } from './pages/dashboard.js';
import { getDefaultAssumptions } from './engine/assumptions.js';
import { generateId } from './components/formatters.js';

// ── State ──
const STORAGE_KEY = 'feast_projects';

const state = {
  currentPage: 'dashboard',
  wizardStep: 0,
  currentProjectId: null,
  currentScenarioIndex: 0,
  projects: [],
};

// ── LocalStorage ──
function loadProjects() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    state.projects = data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load projects:', e);
    state.projects = [];
  }
}

function saveProjects() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.projects));
  } catch (e) {
    console.error('Failed to save projects:', e);
    showToast(t('common.error'), 'error');
  }
}

function getCurrentProject() {
  return state.projects.find(p => p.id === state.currentProjectId) || null;
}

function getCurrentScenario() {
  const project = getCurrentProject();
  if (!project) return null;
  return project.scenarios[state.currentScenarioIndex] || null;
}

function createNewProject(name) {
  const id = generateId();
  const project = {
    id,
    name: name || `Study ${state.projects.length + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scenarios: [
      {
        name: 'Base Case',
        assumptions: getDefaultAssumptions(),
        results: null,
      },
    ],
  };
  state.projects.push(project);
  state.currentProjectId = id;
  state.currentScenarioIndex = 0;
  state.wizardStep = 0;
  saveProjects();
  return project;
}

// ── Navigation ──
async function navigate(page, options = {}) {
  // Handle special navigation options
  if (options.newProject) {
    createNewProject();
    page = 'wizard';
  } else if (options.projectId) {
    state.currentProjectId = options.projectId;
    state.currentScenarioIndex = 0;
    state.wizardStep = 0;
    page = 'wizard';
  } else if (options.importFile) {
    try {
      const { importFromExcel } = await import('./export/excelImporter.js');
      const assumptions = await importFromExcel(options.importFile);
      const project = createNewProject(assumptions.projectName || 'Imported Study');
      project.scenarios[0].assumptions = assumptions;
      saveProjects();
      showToast(t('common.saved'), 'success');
    } catch (e) {
      console.error('Import failed:', e);
      createNewProject('Imported Study');
      showToast(t('common.error') + ': ' + e.message, 'error');
    }
    page = 'wizard';
  }

  state.currentPage = page;
  window.location.hash = page;
  renderPage();
  renderNav(page, (p) => navigate(p));
}

async function renderPage() {
  const content = document.getElementById('page-content');
  if (!content) return;

  const headerTitle = document.getElementById('header-title');

  switch (state.currentPage) {
    case 'dashboard':
      content.innerHTML = renderDashboard(state.projects);
      bindDashboardEvents(navigate, state.projects, saveProjects);
      if (headerTitle) headerTitle.textContent = t('nav.dashboard');
      break;

    case 'wizard': {
      const scenario = getCurrentScenario();
      if (!scenario) {
        navigate('dashboard');
        return;
      }
      // Dynamic import to keep initial load small
      const { renderWizard, bindWizardEvents } = await import('./pages/wizard.js');
      content.innerHTML = renderWizard(state.wizardStep, scenario.assumptions, state);
      bindWizardEvents(state, navigate, saveProjects, showToast);
      if (headerTitle) headerTitle.textContent = t('nav.newStudy');
      break;
    }

    case 'results': {
      const scenario = getCurrentScenario();
      if (!scenario || !scenario.results) {
        content.innerHTML = renderNoResults();
        if (headerTitle) headerTitle.textContent = t('nav.results');
        break;
      }
      const { renderResults, bindResultsEvents } = await import('./pages/results.js');
      content.innerHTML = renderResults(scenario.results, scenario.assumptions, state);
      bindResultsEvents(state, navigate);
      if (headerTitle) headerTitle.textContent = t('nav.results');
      break;
    }

    case 'scenarios': {
      const project = getCurrentProject();
      if (!project) {
        navigate('dashboard');
        return;
      }
      const { renderScenarioManager, bindScenarioEvents } = await import('./pages/scenarioManager.js');
      content.innerHTML = renderScenarioManager(project, state);
      bindScenarioEvents(state, navigate, saveProjects, showToast);
      if (headerTitle) headerTitle.textContent = t('nav.scenarios');
      break;
    }

    default:
      navigate('dashboard');
  }
}

function renderNoResults() {
  return `
    <div class="animate-slide-up">
      <div class="empty-state">
        <div class="empty-state-icon">&#128200;</div>
        <h3>${t('results.noResults')}</h3>
        <p>${t('results.noResultsDesc')}</p>
        <button class="btn btn-primary" id="btn-go-wizard">${t('nav.newStudy')}</button>
      </div>
    </div>`;
}

// ── Toast ──
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── App Shell ──
function renderAppShell() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="app-layout">
      <aside class="app-sidebar">
        <div class="sidebar-brand">
          <div class="sidebar-brand-icon">F</div>
          <div>
            <div class="sidebar-brand-text">${t('app.title')}</div>
            <div class="sidebar-brand-sub">${t('app.subtitle')}</div>
          </div>
        </div>
        <nav id="main-nav"></nav>
        <div class="sidebar-footer">
          <button class="btn btn-ghost w-full" id="btn-toggle-lang">
            ${getLang() === 'en' ? '🇹🇭 ไทย' : '🇬🇧 English'}
          </button>
        </div>
      </aside>
      <main class="app-main">
        <header class="app-header">
          <div class="app-header-title" id="header-title">${t('nav.dashboard')}</div>
          <div class="app-header-actions">
            <span class="text-sm text-muted" id="header-project-name"></span>
          </div>
        </header>
        <div class="app-content" id="page-content"></div>
      </main>
    </div>`;

  // Language toggle
  document.getElementById('btn-toggle-lang').addEventListener('click', () => {
    toggleLang();
  });
}

// ── Init ──
function init() {
  loadProjects();
  renderAppShell();

  // Handle hash routing
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  state.currentPage = hash;

  renderNav(state.currentPage, (p) => navigate(p));
  renderPage();

  // Hash change listener
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    if (hash !== state.currentPage) {
      state.currentPage = hash;
      renderPage();
      renderNav(hash, (p) => navigate(p));
    }
  });

  // Language change re-renders
  onLangChange(() => {
    renderAppShell();
    renderNav(state.currentPage, (p) => navigate(p));
    renderPage();
  });

  // Bind go-wizard button in no-results empty state
  document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-go-wizard') {
      navigate('wizard', { newProject: true });
    }
  });
}

// Expose for debugging
window.__feastState = state;

document.addEventListener('DOMContentLoaded', init);
