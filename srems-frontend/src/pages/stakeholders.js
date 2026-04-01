import { stakeholdersService } from '../js/services/stakeholders.service.js';
import { store } from '../js/store/store.js';
import { showToast, showConfirmDialog, showModal, hideModal } from '../js/utils/helpers.js';
import { validateFormData } from '../js/utils/config.js';
import { CLIENT_ROLES as ROLES } from '../js/utils/constants.js';

export class StakeholdersPage {
  constructor() {
    this.stakeholders = [];
    this.editingId = null;
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.loadStakeholders();
  }

  attachEventListeners() {
    document.getElementById('btnAddStakeholder')?.addEventListener('click', () => this.openAddModal());
    document.getElementById('btnAddStakeholderEmpty')?.addEventListener('click', () => this.openAddModal());
    document.getElementById('stakeholderForm')?.addEventListener('submit', (e) => this.handleFormSubmit(e));
  }

  async loadStakeholders() {
    try {
      const projectId = store.getState().currentProject;
      if (!projectId) {
        showToast('Please select a project', 'warning');
        return;
      }

      this.stakeholders = await stakeholdersService.getProjectStakeholders(projectId);
      this.renderStakeholders();
    } catch (error) {
      showToast(error.message || 'Failed to load stakeholders', 'error');
    }
  }

  renderStakeholders() {
    const container = document.getElementById('stakeholdersContainer');
    const empty = document.getElementById('emptyStakeholders');

    if (this.stakeholders.length === 0) {
      container.classList.add('hidden');
      empty.classList.remove('hidden');
      return;
    }

    container.classList.remove('hidden');
    empty.classList.add('hidden');
    container.innerHTML = this.stakeholders.map(s => this.createStakeholderCard(s)).join('');

    this.attachCardListeners();
  }

  createStakeholderCard(stakeholder) {
    const roleEmoji = {
      'product-owner': '👑',
      'business-analyst': '📊',
      'developer': '💻',
      'qa-engineer': '🧪',
      'architect': '🏗️',
      'project-manager': '📋',
      'sponsor': '💰',
      'end-user': '👤'
    };

    const emoji = roleEmoji[stakeholder.role] || '👥';

    return `
      <div class="stakeholder-card" data-stakeholder-id="${stakeholder._id}">
        <div class="card-avatar">${emoji}</div>
        <h3 class="card-title">${stakeholder.name}</h3>
        <p class="card-role">${stakeholder.role}</p>
        <div class="card-contact">
          <div class="contact-item">
            <span class="label">Email:</span>
            <a href="mailto:${stakeholder.email}">${stakeholder.email}</a>
          </div>
          ${stakeholder.phone ? `
          <div class="contact-item">
            <span class="label">Phone:</span>
            <a href="tel:${stakeholder.phone}">${stakeholder.phone}</a>
          </div>
          ` : ''}
          ${stakeholder.department ? `
          <div class="contact-item">
            <span class="label">Department:</span>
            <span>${stakeholder.department}</span>
          </div>
          ` : ''}
        </div>
        <div class="card-actions">
          <button class="btn btn-sm btn-secondary edit-stakeholder">Edit</button>
          <button class="btn btn-sm btn-danger delete-stakeholder">Delete</button>
        </div>
      </div>
    `;
  }

  attachCardListeners() {
    document.querySelectorAll('.stakeholder-card').forEach(card => {
      const id = card.dataset.stakeholderId;
      card.querySelector('.edit-stakeholder')?.addEventListener('click', () => this.openEditModal(id));
      card.querySelector('.delete-stakeholder')?.addEventListener('click', () => this.deleteStakeholder(id));
    });
  }

  openAddModal() {
    this.editingId = null;
    document.getElementById('stakeholderForm').reset();
    document.getElementById('stakeholderModalTitle').textContent = 'Add Stakeholder';
    showModal('stakeholderModal');
  }

  openEditModal(id) {
    const stakeholder = this.stakeholders.find(s => s._id === id);
    if (!stakeholder) return;

    this.editingId = id;
    document.getElementById('stakeholderModalTitle').textContent = 'Edit Stakeholder';
    document.getElementById('stakeholderName').value = stakeholder.name;
    document.getElementById('stakeholderEmail').value = stakeholder.email;
    document.getElementById('stakeholderRole').value = stakeholder.role;
    document.getElementById('stakeholderDepartment').value = stakeholder.department || '';
    document.getElementById('stakeholderPhone').value = stakeholder.phone || '';
    document.getElementById('stakeholderAvailability').value = stakeholder.availability || '';
    document.getElementById('stakeholderInvolvement').value = stakeholder.areaOfInvolvement || '';

    showModal('stakeholderModal');
  }

  async handleFormSubmit(event) {
    event.preventDefault();

    const formData = {
      name: document.getElementById('stakeholderName').value,
      email: document.getElementById('stakeholderEmail').value,
      role: document.getElementById('stakeholderRole').value,
      department: document.getElementById('stakeholderDepartment').value,
      phone: document.getElementById('stakeholderPhone').value,
      availability: document.getElementById('stakeholderAvailability').value,
      areaOfInvolvement: document.getElementById('stakeholderInvolvement').value,
    };

    const errors = validateFormData(formData, 'stakeholder');
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
        await stakeholdersService.updateStakeholder(this.editingId, formData);
        showToast('Stakeholder updated', 'success');
      } else {
        await stakeholdersService.addStakeholder(projectId, formData);
        showToast('Stakeholder added', 'success');
      }

      hideModal('stakeholderModal');
      await this.loadStakeholders();
    } catch (error) {
      showToast(error.message || 'Failed to save stakeholder', 'error');
    }
  }

  async deleteStakeholder(id) {
    const confirmed = await showConfirmDialog('Remove this stakeholder?');
    if (!confirmed) return;

    try {
      await stakeholdersService.deleteStakeholder(id);
      showToast('Stakeholder removed', 'success');
      await this.loadStakeholders();
    } catch (error) {
      showToast(error.message || 'Failed to delete', 'error');
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new StakeholdersPage();
  });
} else {
  new StakeholdersPage();
}
