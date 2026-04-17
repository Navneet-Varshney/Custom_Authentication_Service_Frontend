import { featuresService } from '../js/services/features.service.js';
import { store } from '../js/store/store.js';
import { showToast, showConfirmDialog, showModal, hideModal } from '../js/utils/helpers.js';
import { validateFormData } from '../js/utils/config.js';

export class FeaturesPage {
  constructor() {
    this.features = [];
    this.editingId = null;
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.loadFeatures();
  }

  attachEventListeners() {
    document.getElementById('btnAddFeature')?.addEventListener('click', () => this.openAddModal());
    document.getElementById('btnAddFeatureEmpty')?.addEventListener('click', () => this.openAddModal());
    document.getElementById('featureForm')?.addEventListener('submit', (e) => this.handleFormSubmit(e));
  }

  async loadFeatures() {
    try {
      // Get current project from store or localStorage
      let projectId = store.state.projects.current?._id || 
                     store.state.projects.current?.id || 
                     store.state.projects.current;
      
      if (!projectId) {
        const savedProject = localStorage.getItem('CURRENT_PROJECT');
        if (savedProject) {
          try {
            const projectData = typeof savedProject === 'string' ? JSON.parse(savedProject) : savedProject;
            projectId = projectData?._id || projectData?.id || projectData;
            store.state.projects.current = projectData;
          } catch (e) {
            console.error('Failed to parse saved project:', e);
          }
        }
      }

      if (!projectId) {
        showToast('Please select a project', 'warning');
        return;
      }

      const data = await featuresService.getFeaturesByProject(projectId);
      this.features = Array.isArray(data) ? data : [];
      this.renderFeatures();
    } catch (error) {
      showToast(error.message || 'Failed to load features', 'error');
      // Initialize with empty array to prevent errors
      this.features = [];
    }
  }

  renderFeatures() {
    const container = document.getElementById('featuresTree');
    const empty = document.getElementById('emptyFeatures');

    if (this.features.length === 0) {
      container.classList.add('hidden');
      empty.classList.remove('hidden');
      return;
    }

    container.classList.remove('hidden');
    empty.classList.add('hidden');
    container.innerHTML = this.features.map(f => this.createFeatureNode(f)).join('');

    this.attachFeatureListeners();
  }

  createFeatureNode(feature) {
    return `
      <div class="feature-node" data-feature-id="${feature._id}">
        <div class="feature-header">
          <h3>${feature.name}</h3>
          <div class="feature-badges">
            ${feature.priority ? `<span class="badge priority-${feature.priority}">${feature.priority}</span>` : ''}
            ${feature.complexity ? `<span class="badge">${feature.complexity}</span>` : ''}
          </div>
        </div>
        <p class="feature-description">${feature.description || 'No description'}</p>
        ${feature.estimatedEffort ? `<div class="feature-effort">Effort: ${feature.estimatedEffort}h</div>` : ''}
        <div class="feature-actions">
          <button class="btn-icon edit-feature">✏️</button>
          <button class="btn-icon delete-feature">🗑️</button>
        </div>
      </div>
    `;
  }

  attachFeatureListeners() {
    document.querySelectorAll('.feature-node').forEach(node => {
      const id = node.dataset.featureId;
      node.querySelector('.edit-feature')?.addEventListener('click', () => this.openEditModal(id));
      node.querySelector('.delete-feature')?.addEventListener('click', () => this.deleteFeature(id));
    });
  }

  openAddModal() {
    this.editingId = null;
    document.getElementById('featureForm').reset();
    document.getElementById('featureModalTitle').textContent = 'Add Feature';
    showModal('featureModal');
  }

  openEditModal(id) {
    const feature = this.features.find(f => f._id === id);
    if (!feature) return;

    this.editingId = id;
    document.getElementById('featureModalTitle').textContent = 'Edit Feature';
    document.getElementById('featureName').value = feature.name;
    document.getElementById('featureDescription').value = feature.description || '';
    document.getElementById('featurePriority').value = feature.priority || '';
    document.getElementById('featureComplexity').value = feature.complexity || '';
    document.getElementById('featureEstimate').value = feature.estimatedEffort || '';

    showModal('featureModal');
  }

  async handleFormSubmit(event) {
    event.preventDefault();

    const formData = {
      name: document.getElementById('featureName').value,
      description: document.getElementById('featureDescription').value,
      priority: document.getElementById('featurePriority').value,
      complexity: document.getElementById('featureComplexity').value,
      estimatedEffort: parseFloat(document.getElementById('featureEstimate').value) || 0,
    };

    const errors = validateFormData(formData, 'feature');
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
        await featuresService.updateFeature(this.editingId, formData);
        showToast('Feature updated', 'success');
      } else {
        await featuresService.createFeature(projectId, formData);
        showToast('Feature created', 'success');
      }

      hideModal('featureModal');
      await this.loadFeatures();
    } catch (error) {
      showToast(error.message || 'Failed to save feature', 'error');
    }
  }

  async deleteFeature(id) {
    const confirmed = await showConfirmDialog('Delete this feature?');
    if (!confirmed) return;

    try {
      await featuresService.deleteFeature(id);
      showToast('Feature deleted', 'success');
      await this.loadFeatures();
    } catch (error) {
      showToast(error.message || 'Failed to delete', 'error');
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new FeaturesPage();
  });
} else {
  new FeaturesPage();
}
