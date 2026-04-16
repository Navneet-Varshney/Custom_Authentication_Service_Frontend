import { inceptionService } from '../js/services/inception.service.js';
import { store } from '../js/store/store.js';
import { showToast, showConfirmDialog, showModal, hideModal, formatDate } from '../js/utils/helpers.js';

export class InceptionDetailPage {
  constructor() {
    this.inceptionId = null;
    this.projectId = null;
    this.inception = null;
    this.init();
  }

  init() {
    this.extractIds();
    this.attachEventListeners();
    this.loadInception();
  }

  extractIds() {
    // Extract from hash: #/inception-detail?inception=<id>&project=<projectId>
    const hash = window.location.hash.substring(2);
    const queryIndex = hash.indexOf('?');
    
    if (queryIndex === -1) {
      this.showError('No inception document specified');
      return;
    }
    
    const queryString = hash.substring(queryIndex + 1);
    const params = new URLSearchParams(queryString);
    this.inceptionId = params.get('inception');
    this.projectId = params.get('project');
    
    if (!this.inceptionId) {
      this.showError('No inception document specified');
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
    const btnEdit = document.getElementById('btnEditInception');
    if (btnEdit) {
      btnEdit.addEventListener('click', () => this.openEditModal());
    }

    // Delete button
    const btnDelete = document.getElementById('btnDeleteInception');
    if (btnDelete) {
      btnDelete.addEventListener('click', () => this.openDeleteModal());
    }

    // Form submissions
    document.getElementById('editInceptionForm')?.addEventListener('submit', (e) => this.handleEditInception(e));
    document.getElementById('deleteInceptionForm')?.addEventListener('submit', (e) => this.handleDeleteInception(e));
  }

  async loadInception() {
    try {
      if (!this.inceptionId) {
        showToast('No inception ID provided. Cannot load document.', 'error');
        return;
      }

      const loadingState = document.getElementById('loadingState');
      const errorState = document.getElementById('errorState');
      
      if (loadingState) loadingState.classList.remove('hidden');
      if (errorState) errorState.classList.add('hidden');

      const response = await inceptionService.getInception(this.inceptionId, this.projectId);
      
      if (!response.success) {
        this.showError(response.message || 'Failed to load inception document');
        return;
      }

      this.inception = response.data?.data || response.data;
      this.renderInception();
      
      if (loadingState) loadingState.classList.add('hidden');
    } catch (error) {
      console.error('[InceptionDetail] Error loading inception:', error);
      this.showError(error.message || 'Unable to load inception document');
    }
  }

  renderInception() {
    if (!this.inception) return;

    // Update breadcrumb title
    const breadcrumb = document.getElementById('breadcrumbTitle');
    if (breadcrumb) breadcrumb.textContent = 'Inception Document';

    // Update header
    const title = document.getElementById('inceptionTitle');
    if (title) title.textContent = 'Project Inception';

    const statusBadge = document.getElementById('statusBadge');
    if (statusBadge) {
      statusBadge.textContent = this.inception.status || 'Active';
      statusBadge.className = `status-badge status-${(this.inception.status || 'active').toLowerCase()}`;
    }

    const createdDate = document.getElementById('createdDate');
    if (createdDate) {
      createdDate.textContent = `Created: ${formatDate(this.inception.createdAt) || '—'}`;
    }

    // Update information grid - show settings
    document.getElementById('infoVision').textContent = this.inception.allowParallelMeetings ? 'Enabled' : 'Disabled';
    document.getElementById('infoGoals').textContent = this.inception.createdBy || '—';
    document.getElementById('infoObjectives').textContent = this.inception.projectId || '—';
    document.getElementById('infoScope').textContent = formatDate(this.inception.createdAt) || '—';
    document.getElementById('infoScale').textContent = this.inception.status || 'Active';
    document.getElementById('infoBeneficiary').textContent = this.inception._id || '—';
    document.getElementById('infoStakeholders').textContent = this.inception.frozen ? 'Yes' : 'No';
    document.getElementById('infoProject').textContent = this.inception.projectName || this.projectId || '—';
    document.getElementById('infoDocStatus').textContent = this.inception.status || 'Active';

    // Populate edit form with current values
    this.populateEditForm();
  }

  populateEditForm() {
    if (!this.inception) return;

    document.getElementById('editAllowParallelMeetings').checked = this.inception.allowParallelMeetings || false;
  }

  openEditModal() {
    showModal('editInceptionModal');
  }

  openDeleteModal() {
    showModal('deleteInceptionModal');
  }

  async handleEditInception(e) {
    e.preventDefault();

    try {
      const updateData = {
        allowParallelMeetings: document.getElementById('editAllowParallelMeetings').checked
      };

      const response = await inceptionService.updateInception(this.projectId, this.inceptionId, updateData);

      if (!response.success) {
        showToast(response.message || 'Failed to update inception document', 'error');
        return;
      }

      this.inception = response.data?.data || response.data;
      this.renderInception();
      hideModal('editInceptionModal');
      showToast('Inception document updated successfully', 'success');
    } catch (error) {
      console.error('[InceptionDetail] Error updating inception:', error);
      showToast(error.message || 'Failed to update inception document', 'error');
    }
  }

  async handleDeleteInception(e) {
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

      const response = await inceptionService.deleteInception(this.projectId, this.inceptionId, deleteData);

      if (!response.success) {
        showToast(response.message || 'Failed to delete inception document', 'error');
        return;
      }

      hideModal('deleteInceptionModal');
      showToast('Inception document deleted successfully', 'success');
      
      // Redirect back to list
      setTimeout(() => {
        window.location.hash = '#/inception';
      }, 1000);
    } catch (error) {
      console.error('[InceptionDetail] Error deleting inception:', error);
      showToast(error.message || 'Failed to delete inception document', 'error');
    }
  }
}
