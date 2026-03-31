import { scopeService } from '../js/services/scope.service.js';
import { store } from '../js/store/store.js';
import { showToast, showConfirmDialog, showModal, hideModal, debounce } from '../js/utils/helpers.js';
import { validateFormData } from '../js/utils/config.js';

export class ScopePage {
  constructor() {
    this.scopeItems = [];
    this.editingId = null;
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.loadScope();
  }

  attachEventListeners() {
    document.getElementById('btnAddScope')?.addEventListener('click', () => this.openAddModal());
    document.getElementById('scopeForm')?.addEventListener('submit', (e) => this.handleFormSubmit(e));
    document.getElementById('filterScopeType')?.addEventListener('change', () => this.applyFilters());
    document.getElementById('searchScope')?.addEventListener('input', debounce(() => this.applyFilters(), 300));
  }

  async loadScope() {
    try {
      const projectId = store.getState().currentProject;
      if (!projectId) {
        showToast('Please select a project', 'warning');
        return;
      }

      const data = await scopeService.getScopesByProject(projectId);
      this.scopeItems = Array.isArray(data) ? data : [];
      this.renderScope();
    } catch (error) {
      showToast(error.message || 'Failed to load scope items', 'error');
      // Initialize with empty array to prevent errors
      this.scopeItems = [];
    }
  }

  renderScope() {
    const included = this.scopeItems.filter(s => s.type === 'included');
    const excluded = this.scopeItems.filter(s => s.type === 'excluded');
    const constraints = this.scopeItems.filter(s => s.type === 'constraint');

    this.renderSection('includedScope', included);
    this.renderSection('excludedScope', excluded);
    this.renderSection('constraintScope', constraints);

    this.attachItemListeners();
  }

  renderSection(elementId, items) {
    const elem = document.getElementById(elementId);
    if (!elem) return;

    if (items.length === 0) {
      elem.innerHTML = '<div class="empty-placeholder">No items</div>';
      return;
    }

    elem.innerHTML = items.map(item => `
      <div class="scope-item" data-id="${item._id}">
        <div class="item-header">
          <h4 class="item-title">${item.description}</h4>
          <div class="item-actions">
            <button class="btn-icon edit-item">✏️</button>
            <button class="btn-icon delete-item">🗑️</button>
          </div>
        </div>
        ${item.rationale ? `<p class="item-rationale">${item.rationale}</p>` : ''}
        ${item.estimatedImpact ? `<div class="item-impact impact-${item.estimatedImpact}">${item.estimatedImpact}</div>` : ''}
      </div>
    `).join('');
  }

  attachItemListeners() {
    document.querySelectorAll('.scope-item').forEach(item => {
      const id = item.dataset.id;
      item.querySelector('.edit-item')?.addEventListener('click', () => this.openEditModal(id));
      item.querySelector('.delete-item')?.addEventListener('click', () => this.deleteScopeItem(id));
    });
  }

  openAddModal() {
    this.editingId = null;
    document.getElementById('scopeForm').reset();
    document.getElementById('scopeModalTitle').textContent = 'Add Scope Item';
    showModal('scopeModal');
  }

  openEditModal(id) {
    const item = this.scopeItems.find(s => s._id === id);
    if (!item) return;

    this.editingId = id;
    document.getElementById('scopeModalTitle').textContent = 'Edit Scope Item';
    document.getElementById('scopeType').value = item.type;
    document.getElementById('scopeDescription').value = item.description;
    document.getElementById('scopeRationale').value = item.rationale || '';
    document.getElementById('scopeImpact').value = item.estimatedImpact || '';

    showModal('scopeModal');
  }

  async handleFormSubmit(event) {
    event.preventDefault();

    const formData = {
      type: document.getElementById('scopeType').value,
      description: document.getElementById('scopeDescription').value,
      rationale: document.getElementById('scopeRationale').value,
      estimatedImpact: document.getElementById('scopeImpact').value,
    };

    const errors = validateFormData(formData, 'scope');
    if (errors.length > 0) {
      errors.forEach(err => {
        const el = document.getElementById(`error-${err.field}`);
        if (el) el.textContent = err.message;
      });
      return;
    }

    try {
      const projectId = store.getState().currentProject;
      
      if (this.editingId) {
        await scopeService.updateScope(this.editingId, formData);
        showToast('Scope item updated', 'success');
      } else {
        await scopeService.createScope(projectId, formData);
        showToast('Scope item created', 'success');
      }

      hideModal('scopeModal');
      await this.loadScope();
    } catch (error) {
      showToast(error.message || 'Failed to save scope item', 'error');
    }
  }

  async deleteScopeItem(id) {
    const confirmed = await showConfirmDialog('Delete this scope item?');
    if (!confirmed) return;

    try {
      await scopeService.deleteScope(id);
      showToast('Scope item deleted', 'success');
      await this.loadScope();
    } catch (error) {
      showToast(error.message || 'Failed to delete', 'error');
    }
  }

  applyFilters() {
    console.log('Filters applied'); // Implement filtering logic
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ScopePage();
  });
} else {
  new ScopePage();
}
