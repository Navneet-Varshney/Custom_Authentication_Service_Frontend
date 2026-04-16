import { elicitationService } from '../js/services/elicitation.service.js';
import { store } from '../js/store/store.js';
import { showToast, showConfirmDialog, showModal, hideModal, formatDate } from '../js/utils/helpers.js';

export class ElicitationDetailPage {
  constructor() {
    this.elicitationId = null;
    this.projectId = null;
    this.elicitation = null;
    this.init();
  }

  init() {
    this.extractIds();
    this.attachEventListeners();
    this.loadElicitation();
  }

  extractIds() {
    // Extract from hash: #/elicitation-detail?elicitation=<id>&project=<projectId>
    const hash = window.location.hash.substring(2);
    const queryIndex = hash.indexOf('?');
    
    if (queryIndex === -1) {
      this.showError('No elicitation session specified');
      return;
    }
    
    const queryString = hash.substring(queryIndex + 1);
    const params = new URLSearchParams(queryString);
    this.elicitationId = params.get('elicitation');
    this.projectId = params.get('project');
    
    if (!this.elicitationId) {
      this.showError('No elicitation session specified');
      return;
    }
  }

  showError(message) {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    
    if (loadingState) loadingState.classList.add('hidden');
    if (errorState) {
      errorState.classList.remove('hidden');
      const errorMsg = document.getElementById('errorMessage');
      if (errorMsg) errorMsg.textContent = message;
    }
  }

  attachEventListeners() {
    // Modal close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modalId = e.currentTarget.getAttribute('data-close-modal');
        hideModal(modalId);
      });
    });

    // Edit button
    const btnEdit = document.getElementById('btnEditElicitation');
    if (btnEdit) {
      btnEdit.addEventListener('click', () => this.openEditModal());
    }

    // Delete button
    const btnDelete = document.getElementById('btnDeleteElicitation');
    if (btnDelete) {
      btnDelete.addEventListener('click', () => this.openDeleteModal());
    }

    // Form submissions
    document.getElementById('editElicitationForm')?.addEventListener('submit', (e) => this.handleEditElicitation(e));
    document.getElementById('deleteElicitationForm')?.addEventListener('submit', (e) => this.handleDeleteElicitation(e));
  }

  async loadElicitation() {
    try {
      if (!this.elicitationId) {
        showToast('No elicitation ID provided. Cannot load session.', 'error');
        return;
      }

      const loadingState = document.getElementById('loadingState');
      const errorState = document.getElementById('errorState');
      
      if (loadingState) loadingState.classList.remove('hidden');
      if (errorState) errorState.classList.add('hidden');

      const response = await elicitationService.getElicitation(this.projectId, this.elicitationId);
      
      if (!response.success) {
        this.showError(response.message || 'Failed to load elicitation session');
        return;
      }

      this.elicitation = response.data?.data || response.data;
      this.renderElicitation();
      
      if (loadingState) loadingState.classList.add('hidden');
    } catch (error) {
      console.error('[ElicitationDetail] Error loading elicitation:', error);
      this.showError(error.message || 'Unable to load elicitation session');
    }
  }

  renderElicitation() {
    if (!this.elicitation) return;

    // Update breadcrumb title
    const breadcrumb = document.getElementById('breadcrumbTitle');
    if (breadcrumb) breadcrumb.textContent = this.elicitation.title || 'Elicitation Session';

    // Update header
    const title = document.getElementById('elicitationTitle');
    if (title) title.textContent = this.elicitation.title || 'Untitled Session';

    const statusBadge = document.getElementById('statusBadge');
    if (statusBadge) {
      statusBadge.textContent = this.elicitation.status || 'Active';
      statusBadge.className = `status-badge status-${(this.elicitation.status || 'active').toLowerCase()}`;
    }

    const createdDate = document.getElementById('createdDate');
    if (createdDate) {
      createdDate.textContent = `Created: ${formatDate(this.elicitation.createdAt) || '—'}`;
    }

    // Update information grid
    document.getElementById('infoMode').textContent = this.elicitation.mode || '—';
    document.getElementById('infoDescription').textContent = this.elicitation.description || '—';
    document.getElementById('infoObjectives').textContent = this.elicitation.objectives || '—';
    document.getElementById('infoFacilitator').textContent = this.elicitation.facilitator || '—';
    document.getElementById('infoStakeholders').textContent = this.elicitation.stakeholders || '—';
    document.getElementById('infoAttendees').textContent = this.elicitation.attendees || '—';
    document.getElementById('infoSessionDate').textContent = formatDate(this.elicitation.sessionDate) || '—';
    document.getElementById('infoDuration').textContent = this.elicitation.duration ? `${this.elicitation.duration} minutes` : '—';
    document.getElementById('infoLocation').textContent = this.elicitation.location || '—';
    document.getElementById('infoFindings').textContent = this.elicitation.findings || '—';
    document.getElementById('infoProject').textContent = this.elicitation.projectName || this.projectId || '—';

    // Populate edit form with current values
    this.populateEditForm();
  }

  populateEditForm() {
    if (!this.elicitation) return;

    document.getElementById('editMode').value = this.elicitation.mode || '';
    document.getElementById('editAllowParallelMeetings').checked = this.elicitation.allowParallelMeetings || false;
  }

  openEditModal() {
    showModal('editElicitationModal');
  }

  openDeleteModal() {
    showModal('deleteElicitationModal');
  }

  async handleEditElicitation(e) {
    e.preventDefault();

    try {
      const updateData = {
        mode: document.getElementById('editMode').value,
        allowParallelMeetings: document.getElementById('editAllowParallelMeetings').checked
      };

      const response = await elicitationService.updateElicitation(this.projectId, this.elicitationId, updateData);

      if (!response.success) {
        showToast(response.message || 'Failed to update elicitation session', 'error');
        return;
      }

      this.elicitation = response.data?.data || response.data;
      this.renderElicitation();
      hideModal('editElicitationModal');
      showToast('Elicitation session updated successfully', 'success');
    } catch (error) {
      console.error('[ElicitationDetail] Error updating elicitation:', error);
      showToast(error.message || 'Failed to update elicitation session', 'error');
    }
  }

  async handleDeleteElicitation(e) {
    e.preventDefault();

    try {
      const reasonType = document.getElementById('deletionReasonType').value;
      const reasonDescription = document.getElementById('deletionReasonDescription').value;

      if (!reasonType) {
        showToast('Please select a deletion reason', 'error');
        return;
      }

      const deleteData = {
        deletionReasonType: reasonType
      };

      if (reasonDescription) {
        deleteData.deletionReasonDescription = reasonDescription;
      }

      const response = await elicitationService.deleteElicitation(this.projectId, this.elicitationId, deleteData);

      if (!response.success) {
        showToast(response.message || 'Failed to delete elicitation session', 'error');
        return;
      }

      hideModal('deleteElicitationModal');
      showToast('Elicitation session deleted successfully', 'success');
      
      // Redirect back to list
      setTimeout(() => {
        window.location.hash = '#/elicitation';
      }, 1000);
    } catch (error) {
      console.error('[ElicitationDetail] Error deleting elicitation:', error);
      showToast(error.message || 'Failed to delete elicitation session', 'error');
    }
  }
}
