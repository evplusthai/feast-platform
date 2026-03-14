import { t } from '../i18n.js';
import { fmtDate } from '../components/formatters.js';
import { showModal } from '../components/modal.js';

export function renderDashboard(projects) {
  const totalProjects = projects.length;
  const completed = projects.filter(p => p.scenarios.some(s => s.results)).length;

  return `
    <div class="animate-slide-up">
      <div class="hero">
        <h1>${t('dash.heroTitle')}</h1>
        <p>${t('dash.heroDesc')}</p>
        <div class="flex justify-center gap-3">
          <button class="btn btn-primary btn-lg" id="btn-new-project">${t('dash.newProject')}</button>
          <button class="btn btn-secondary btn-lg" id="btn-import-excel">${t('dash.importExcel')}</button>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card kpi-primary">
          <div class="kpi-label">${t('dash.totalProjects')}</div>
          <div class="kpi-value">${totalProjects}</div>
        </div>
        <div class="kpi-card kpi-success">
          <div class="kpi-label">${t('dash.completedStudies')}</div>
          <div class="kpi-value">${completed}</div>
        </div>
      </div>

      ${projects.length > 0 ? renderProjectTable(projects) : renderEmptyState()}
    </div>`;
}

function renderProjectTable(projects) {
  const rows = projects
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .map(p => {
      const hasResults = p.scenarios.some(s => s.results);
      const statusBadge = hasResults
        ? `<span class="badge badge-success">${t('dash.complete')}</span>`
        : `<span class="badge badge-warning">${t('dash.draft')}</span>`;
      const scenarioCount = p.scenarios.length;
      const clientName = p.scenarios[0]?.assumptions?.clientName || '-';

      return `
        <tr>
          <td><strong>${p.name || t('dash.noProjects')}</strong></td>
          <td>${clientName}</td>
          <td>${scenarioCount}</td>
          <td>${fmtDate(p.updatedAt)}</td>
          <td>${statusBadge}</td>
          <td>
            <div class="flex gap-2">
              <button class="btn btn-sm btn-primary" data-open="${p.id}">${t('dash.open')}</button>
              <button class="btn btn-sm btn-ghost" data-duplicate="${p.id}">${t('dash.duplicate')}</button>
              <button class="btn btn-sm btn-ghost" data-delete="${p.id}" style="color:var(--color-danger-400)">${t('dash.delete')}</button>
            </div>
          </td>
        </tr>`;
    })
    .join('');

  return `
    <div class="card mt-6">
      <div class="card-header">
        <h3 class="card-title">${t('dash.recentProjects')}</h3>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>${t('dash.projectName')}</th>
              <th>${t('dash.client')}</th>
              <th>${t('dash.scenarios')}</th>
              <th>${t('dash.lastModified')}</th>
              <th>${t('dash.status')}</th>
              <th>${t('dash.actions')}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

function renderEmptyState() {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">&#128202;</div>
      <h3>${t('dash.noProjects')}</h3>
      <p>${t('dash.noProjectsDesc')}</p>
      <button class="btn btn-primary" id="btn-new-project-empty">${t('dash.newProject')}</button>
    </div>`;
}

export function bindDashboardEvents(navigate, projects, saveProjects) {
  const newBtn = document.getElementById('btn-new-project');
  const newBtnEmpty = document.getElementById('btn-new-project-empty');
  const importBtn = document.getElementById('btn-import-excel');

  const createNew = () => navigate('wizard', { newProject: true });

  if (newBtn) newBtn.addEventListener('click', createNew);
  if (newBtnEmpty) newBtnEmpty.addEventListener('click', createNew);
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xlsx,.xls';
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) navigate('wizard', { importFile: file });
      });
      input.click();
    });
  }

  // Open project
  document.querySelectorAll('[data-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.open;
      navigate('wizard', { projectId: id });
    });
  });

  // Duplicate project
  document.querySelectorAll('[data-duplicate]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.duplicate;
      const project = projects.find(p => p.id === id);
      if (project) {
        const dup = JSON.parse(JSON.stringify(project));
        dup.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
        dup.name = project.name + ' (Copy)';
        dup.createdAt = new Date().toISOString();
        dup.updatedAt = new Date().toISOString();
        projects.push(dup);
        saveProjects();
        navigate('dashboard');
      }
    });
  });

  // Delete project
  document.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.delete;
      const project = projects.find(p => p.id === id);
      showModal(
        t('dash.delete'),
        `${t('common.confirm')}: ${project?.name || id}?`,
        () => {
          const idx = projects.findIndex(p => p.id === id);
          if (idx >= 0) {
            projects.splice(idx, 1);
            saveProjects();
            navigate('dashboard');
          }
        }
      );
    });
  });
}
