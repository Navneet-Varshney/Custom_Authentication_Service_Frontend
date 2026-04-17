import { stakeholdersService } from '../js/services/stakeholders.service.js';
import { store } from '../js/store/store.js';
import { showToast, showConfirmDialog, showModal, hideModal } from '../js/utils/helpers.js';
import { validateFormData } from '../js/utils/config.js';
import { CLIENT_ROLES, PROJECT_ROLES, STAKEHOLDER_DELETION_REASON } from '../js/utils/constants.js';

export class StakeholdersPage {
  constructor() {
    this.stakeholders = [];
    this.editingId = null;
    this.deletingId = null;
    this.currentProjectId = null;
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
    document.getElementById('deleteStakeholderForm')?.addEventListener('submit', (e) => this.handleDeleteSubmit(e));
  }

  async loadStakeholders() {
    try {
      // Get project ID from store with proper fallback pattern
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
        showToast('Please select a project first', 'warning');
        this.showEmptyState();
        return;
      }

      // Store project ID for add operations
      this.currentProjectId = projectId;
      console.log('📦 Loading stakeholders for project:', projectId);

      const response = await stakeholdersService.getProjectStakeholders(projectId);
      
      // API returns double-nested structure: response.data.data.stakeholders
      let stakeholders = [];
      
      if (response?.data?.data?.stakeholders && Array.isArray(response.data.data.stakeholders)) {
        stakeholders = response.data.data.stakeholders;
        console.log('✅ Found stakeholders in response.data.data.stakeholders:', stakeholders.length, stakeholders);
      } else if (response?.data?.stakeholders && Array.isArray(response.data.stakeholders)) {
        stakeholders = response.data.stakeholders;
        console.log('✅ Found stakeholders in response.data.stakeholders:', stakeholders.length);
      } else if (response?.stakeholders && Array.isArray(response.stakeholders)) {
        stakeholders = response.stakeholders;
        console.log('✅ Found stakeholders in response.stakeholders:', stakeholders.length);
      } else if (Array.isArray(response)) {
        stakeholders = response;
        console.log('✅ Response is an array:', stakeholders.length);
      } else {
        console.warn('⚠️ Could not find stakeholders in response');
      }
      
      this.stakeholders = stakeholders;
      console.log('📊 Final stakeholders array count:', this.stakeholders.length, 'Items:', this.stakeholders);
      
      this.renderStakeholders();
    } catch (error) {
      console.error('Failed to load stakeholders:', error);
      showToast(error.message || 'Failed to load stakeholders', 'error');
      this.showEmptyState();
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
    // Debug: Log what data we're receiving
    console.log('📋 Creating card for stakeholder:', {
      _id: stakeholder._id,
      userId: stakeholder.userId,
      role: stakeholder.role,
      projectId: stakeholder.projectId,
      organizationId: stakeholder.organizationId
    });

    const roleEmoji = {
      'manager': '👨‍💼',
      'developer': '💻',
      'tester': '🧪',
      'analyst': '📊',
      'owner': '👑',
      'other': '👤',
      'sponsor': '💰',
      'partner': '🤝',
      'vendor': '🏢',
      'end_user': '👤'
    };

    const emoji = roleEmoji[stakeholder.role] || '👥';

    return `
      <div class="stakeholder-card" data-stakeholder-id="${stakeholder._id || stakeholder.id}">
        <div class="card-avatar">${emoji}</div>
        <h3 class="card-title">${stakeholder.userId || 'Unknown'}</h3>
        <p class="card-role">${stakeholder.role || 'N/A'}</p>
        <div class="card-contact">
          <div class="contact-item">
            <span class="label">Project ID:</span>
            <span>${stakeholder.projectId || 'N/A'}</span>
          </div>
          ${stakeholder.organizationId ? `
          <div class="contact-item">
            <span class="label">Organization:</span>
            <span>${stakeholder.organizationId}</span>
          </div>
          ` : ''}
        </div>
        <div class="card-actions">
          <button class="btn btn-sm btn-secondary edit-stakeholder" data-id="${stakeholder._id || stakeholder.id}">Edit Role</button>
          <button class="btn btn-sm btn-danger delete-stakeholder" data-id="${stakeholder._id || stakeholder.id}">Remove</button>
        </div>
      </div>
    `;
  }

  attachCardListeners() {
    document.querySelectorAll('.stakeholder-card').forEach(card => {
      const id = card.dataset.stakeholderId;
      console.log('🔗 Attaching listeners to stakeholder card:', id);
      
      card.querySelector('.edit-stakeholder')?.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('✏️ Edit clicked for stakeholder:', id);
        this.openEditModal(id);
      });
      
      card.querySelector('.delete-stakeholder')?.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('🗑️ Delete clicked for stakeholder:', id);
        this.openDeleteModal(id);
      });
    });
  }

  openAddModal() {
    this.editingId = null;
    document.getElementById('stakeholderForm').reset();
    document.getElementById('stakeholderModalTitle').textContent = 'Add Stakeholder';
    showModal('stakeholderModal');
  }

  openEditModal(id) {
    const stakeholder = this.stakeholders.find(s => s._id === id || s.id === id);
    if (!stakeholder) {
      console.warn('⚠️ Stakeholder not found:', id);
      showToast('Stakeholder not found', 'error');
      return;
    }

    console.log('📝 Opening edit modal for stakeholder:', stakeholder);
    this.editingId = id;
    document.getElementById('stakeholderModalTitle').textContent = 'Edit Stakeholder Role';
    document.getElementById('stakeholderUserId').value = stakeholder.userId || '';
    document.getElementById('stakeholderUserId').disabled = true;  // Cannot change userId
    document.getElementById('stakeholderRole').value = stakeholder.role || '';
    document.getElementById('stakeholderOrgId').value = stakeholder.organizationId || '';
    document.getElementById('stakeholderOrgId').disabled = true;  // Cannot change orgId

    showModal('stakeholderModal');
  }

  async handleFormSubmit(event) {
    event.preventDefault();

    const userId = document.getElementById('stakeholderUserId').value.trim();
    const role = document.getElementById('stakeholderRole').value;
    const orgId = document.getElementById('stakeholderOrgId').value.trim();

    console.log('📋 Form submitted with:', {
      userId,
      role,
      orgId,
      editingId: this.editingId,
      currentProjectId: this.currentProjectId
    });

    // Validate required fields
    if (!userId || !role) {
      console.warn('❌ Missing required fields:', { userId: !!userId, role: !!role });
      showToast('Please fill all required fields', 'error');
      return;
    }

    // Validate role is from correct enum
    const allRoles = { ...CLIENT_ROLES, ...PROJECT_ROLES };
    if (!Object.values(allRoles).includes(role)) {
      console.warn('❌ Invalid role:', role);
      showToast('Invalid role selected', 'error');
      return;
    }

    try {
      if (this.editingId) {
        // Only update role
        console.log('🔄 Updating stakeholder role...');
        await stakeholdersService.updateStakeholder(this.editingId, role);
        showToast('Stakeholder role updated', 'success');
      } else {
        // Create new stakeholder - must pass projectId
        if (!this.currentProjectId) {
          console.error('❌ Project ID is missing!');
          showToast('Project ID not available. Please reload the page.', 'error');
          return;
        }
        console.log('✨ Creating new stakeholder with projectId:', this.currentProjectId);
        await stakeholdersService.addStakeholder(userId, role, orgId || null, this.currentProjectId);
        showToast('Stakeholder added successfully', 'success');
      }

      // Re-enable fields and reset form
      document.getElementById('stakeholderUserId').disabled = false;
      document.getElementById('stakeholderOrgId').disabled = false;
      document.getElementById('stakeholderForm').reset();
      
      hideModal('stakeholderModal');
      await this.loadStakeholders();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to save stakeholder';
      showToast(message, 'error');
    }
  }

  openDeleteModal(id) {
    this.deletingId = id;
    document.getElementById('deleteStakeholderForm').reset();
    showModal('deleteStakeholderModal');
  }

  async handleDeleteSubmit(event) {
    event.preventDefault();

    if (!this.deletingId) return;

    const deletionReason = document.getElementById('deletionReason').value;
    const deletionDescription = document.getElementById('deletionDescription').value.trim();

    // Validate reason
    if (!deletionReason) {
      showToast('Please select a deletion reason', 'error');
      return;
    }

    // Validate reason enum
    if (!Object.values(STAKEHOLDER_DELETION_REASON).includes(deletionReason)) {
      showToast('Invalid deletion reason', 'error');
      return;
    }

    // Validate description length if provided
    if (deletionDescription && (deletionDescription.length < 50 || deletionDescription.length > 300)) {
      showToast('Description must be between 50-300 characters', 'error');
      return;
    }

    try {
      await stakeholdersService.deleteStakeholder(
        this.deletingId,
        deletionReason,
        deletionDescription || null
      );
      showToast('Stakeholder removed successfully', 'success');
      
      hideModal('deleteStakeholderModal');
      this.deletingId = null;
      await this.loadStakeholders();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to remove stakeholder';
      showToast(message, 'error');
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
