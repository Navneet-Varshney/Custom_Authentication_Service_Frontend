import { elaborationService } from '../js/services/elaboration.service.js';
import { store } from '../js/store/store.js';
import { showToast, showConfirmDialog, showModal, hideModal, formatDate } from '../js/utils/helpers.js';

export class ElaborationDetailPage {
  constructor() {
    this.elaborationId = null;
    this.projectId = null;
    this.elaboration = null;
    this.init();
  }

  init() {
    this.extractIds();
    this.attachEventListeners();
    this.loadElaboration();
  }

  extractIds() {
    // Extract from hash: #/elaboration-detail?elaboration=<id>&project=<projectId>
    const hash = window.location.hash.substring(2);
    const queryIndex = hash.indexOf('?');
    
    if (queryIndex === -1) {
      this.showError('No elaboration specified');
      return;
    }
    
    const queryString = hash.substring(queryIndex + 1);
    const params = new URLSearchParams(queryString);
    this.elaborationId = params.get('elaboration');
    this.projectId = params.get('project');
    
    if (!this.elaborationId) {
      this.showError('No elaboration specified');
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
    const btnEdit = document.getElementById('btnEditElaboration');
    if (btnEdit) {
      btnEdit.addEventListener('click', () => this.openEditModal());
    }

    // Delete button
    const btnDelete = document.getElementById('btnDeleteElaboration');
    if (btnDelete) {
      btnDelete.addEventListener('click', () => this.openDeleteModal());
    }

    // Form submissions
    document.getElementById('editElaborationForm')?.addEventListener('submit', (e) => this.handleEditElaboration(e));
    document.getElementById('deleteElaborationForm')?.addEventListener('submit', (e) => this.handleDeleteElaboration(e));
  }

  async loadElaboration() {
    try {
      if (!this.elaborationId) {
        showToast('No elaboration ID provided. Cannot load elaboration.', 'error');
        return;
      }

      const loadingState = document.getElementById('loadingState');
      const errorState = document.getElementById('errorState');
      
      if (loadingState) loadingState.classList.remove('hidden');
      if (errorState) errorState.classList.add('hidden');

      const response = await elaborationService.getElaboration(this.projectId, this.elaborationId);
      
      if (!response.success) {
        this.showError(response.message || 'Failed to load elaboration');
        return;
      }

      this.elaboration = response.data?.data || response.data;
      this.renderElaboration();
      
      if (loadingState) loadingState.classList.add('hidden');
    } catch (error) {
      console.error('[ElaborationDetail] Error loading elaboration:', error);
      this.showError(error.message || 'Unable to load elaboration');
    }
  }

  renderElaboration() {
    if (!this.elaboration) return;

    // Update breadcrumb title
    const breadcrumb = document.getElementById('breadcrumbTitle');
    if (breadcrumb) breadcrumb.textContent = this.elaboration.title || 'Elaboration';

    // Update header
    const title = document.getElementById('elaborationTitle');
    if (title) title.textContent = this.elaboration.title || 'Untitled Elaboration';

    const statusBadge = document.getElementById('statusBadge');
    if (statusBadge) {
      statusBadge.textContent = this.elaboration.status || 'Draft';
      statusBadge.className = `status-badge status-${(this.elaboration.status || 'draft').toLowerCase()}`;
    }

    const createdDate = document.getElementById('createdDate');
    if (createdDate) {
      createdDate.textContent = `Created: ${formatDate(this.elaboration.createdAt) || '—'}`;
    }

    // Update information grid
    document.getElementById('infoTitle').textContent = this.elaboration.title || '—';
    document.getElementById('infoDescription').textContent = this.elaboration.description || '—';
    document.getElementById('infoSpecification').textContent = this.elaboration.specification || '—';
    document.getElementById('infoCriteria').textContent = this.elaboration.acceptanceCriteria || '—';
    document.getElementById('infoType').textContent = this.elaboration.type || '—';
    document.getElementById('infoPriority').textContent = this.elaboration.priority || '—';
    document.getElementById('infoRisk').textContent = this.elaboration.riskLevel || '—';
    document.getElementById('infoStatus').textContent = this.elaboration.status || '—';
    document.getElementById('infoDependencies').textContent = this.elaboration.dependencies || '—';
    document.getElementById('infoConstraints').textContent = this.elaboration.constraints || '—';
    document.getElementById('infoProject').textContent = this.elaboration.projectName || this.projectId || '—';
    document.getElementById('infoOwner').textContent = this.elaboration.owner || '—';
    document.getElementById('infoUpdated').textContent = formatDate(this.elaboration.updatedAt) || '—';

    // Populate edit form with current values
    this.populateEditForm();
  }

  populateEditForm() {
    if (!this.elaboration) return;

    document.getElementById('editAllowParallelMeetings').checked = this.elaboration.allowParallelMeetings || false;
  }

  openEditModal() {
    showModal('editElaborationModal');
  }

  openDeleteModal() {
    showModal('deleteElaborationModal');
  }

  async handleEditElaboration(e) {
    e.preventDefault();

    try {
      const updateData = {
        allowParallelMeetings: document.getElementById('editAllowParallelMeetings').checked
      };

      const response = await elaborationService.updateElaboration(this.projectId, this.elaborationId, updateData);

      if (!response.success) {
        showToast(response.message || 'Failed to update elaboration', 'error');
        return;
      }

      this.elaboration = response.data?.data || response.data;
      this.renderElaboration();
      hideModal('editElaborationModal');
      showToast('Elaboration updated successfully', 'success');
    } catch (error) {
      console.error('[ElaborationDetail] Error updating elaboration:', error);
      showToast(error.message || 'Failed to update elaboration', 'error');
    }
  }

  async handleDeleteElaboration(e) {
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

      const response = await elaborationService.deleteElaboration(this.projectId, this.elaborationId, deleteData);

      if (!response.success) {
        showToast(response.message || 'Failed to delete elaboration', 'error');
        return;
      }

      hideModal('deleteElaborationModal');
      showToast('Elaboration deleted successfully', 'success');
      
      // Redirect back to list
      setTimeout(() => {
        window.location.hash = '#/elaboration';
      }, 1000);
    } catch (error) {
      console.error('[ElaborationDetail] Error deleting elaboration:', error);
      showToast(error.message || 'Failed to delete elaboration', 'error');
    }
  }
}
