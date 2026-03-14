import { t } from '../i18n.js';

export function showModal(title, body, onConfirm, onCancel) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal-content">
        <div class="modal-title">${title}</div>
        <div class="modal-body">${body}</div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="modal-cancel">${t('common.cancel')}</button>
          <button class="btn btn-primary" id="modal-confirm">${t('common.confirm')}</button>
        </div>
      </div>
    </div>`;

  document.getElementById('modal-cancel').addEventListener('click', () => {
    hideModal();
    if (onCancel) onCancel();
  });

  document.getElementById('modal-confirm').addEventListener('click', () => {
    hideModal();
    if (onConfirm) onConfirm();
  });

  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') {
      hideModal();
      if (onCancel) onCancel();
    }
  });
}

export function hideModal() {
  const root = document.getElementById('modal-root');
  root.innerHTML = '';
}
