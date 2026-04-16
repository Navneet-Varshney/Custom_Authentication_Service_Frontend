import { projectsService } from '../js/services/projects.service.js';
import { store } from '../js/store/store.js';
import { showToast, showConfirmDialog, showModal, hideModal, formatDate } from '../js/utils/helpers.js';
import { validateFormData, FORM_FIELDS } from '../js/utils/config.js';
import { STATUS_COLORS } from '../js/utils/constants.js';

export class ProjectDetailPage {
  constructor() {
    this.projectId = null;
    this.project = null;
    this.init();
  }

  init() {
    this.extractProjectId();
    this.createModals();
    this.attachEventListeners();
    this.loadProject();
  }

  createModals() {
    // Create activate modal
    if (!document.getElementById('activateModal')) {
      const activateModal = `
        <div id="activateModal" class="modal hidden">
          <div class="modal-overlay" data-close-modal="activateModal"></div>
          <div class="modal-content">
            <div class="modal-header">
              <h2>Activate Project</h2>
              <button type="button" class="modal-close" data-close-modal="activateModal">&times;</button>
            </div>
            <form id="activateForm">
              <div class="modal-body">
                <div class="form-group">
                  <label for="activationReasonType">Activation Reason <span class="required">*</span></label>
                  <select id="activationReasonType" class="form-select" required>
                    <option value="">Select a reason...</option>
                    <option value="ready_for_development">Ready for Development</option>
                    <option value="client_approval">Client Approval</option>
                    <option value="resource_availability">Resource Availability</option>
                    <option value="priority_reassessment">Priority Reassessment</option>
                    <option value="technical_breakthrough">Technical Breakthrough</option>
                    <option value="other">Other</option>
                  </select>
                  <div id="error-activationReasonType" class="error-message"></div>
                </div>
                <div class="form-group">
                  <label for="activationReasonDescription">Description (optional)</label>
                  <textarea id="activationReasonDescription" class="form-textarea" placeholder="Provide additional details..." rows="4"></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-close-modal="activateModal">Cancel</button>
                <button type="submit" class="btn btn-primary">Activate</button>
              </div>
            </form>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', activateModal);
    }
  }

  extractProjectId() {
    // Extract from hash since we're using hash-based routing
    // Hash format: #/project-detail?project=<projectId>
    const hash = window.location.hash.substring(2); // Remove #/
    const queryIndex = hash.indexOf('?');
    
    if (queryIndex === -1) {
      this.showError('No project specified');
      return;
    }
    
    const queryString = hash.substring(queryIndex + 1);
    const params = new URLSearchParams(queryString);
    this.projectId = params.get('project');
    
    if (!this.projectId) {
      this.showError('No project specified');
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
    const btnEdit = document.getElementById('btnEditProject');
    if (btnEdit) {
      btnEdit.addEventListener('click', () => this.openEditModal());
    }

    // Form submissions
    document.getElementById('onHoldForm')?.addEventListener('submit', (e) => this.handleOnHold(e));
    document.getElementById('abortForm')?.addEventListener('submit', (e) => this.handleAbort(e));
    document.getElementById('resumeForm')?.addEventListener('submit', (e) => this.handleResume(e));
    document.getElementById('activateForm')?.addEventListener('submit', (e) => this.handleActivate(e));
    document.getElementById('changeOwnerForm')?.addEventListener('submit', (e) => this.handleChangeOwner(e));
    document.getElementById('editProjectForm')?.addEventListener('submit', (e) => this.handleEditProject(e));
    document.getElementById('deleteProjectForm')?.addEventListener('submit', (e) => this.handleDeleteProject(e));

    // Confirm buttons for simple modals
    document.getElementById('completeConfirmBtn')?.addEventListener('click', () => this.handleComplete());
    document.getElementById('archiveConfirmBtn')?.addEventListener('click', () => this.handleArchive());
  }

  async loadProject() {
    try {
      // Guard: ensure projectId exists before attempting to load
      if (!this.projectId) {
        showToast('No project ID provided. Cannot load project details.', 'error');
        return;
      }

      const loadingState = document.getElementById('loadingState');
      const errorState = document.getElementById('errorState');
      
      if (loadingState) loadingState.classList.remove('hidden');
      if (errorState) errorState.classList.add('hidden');

      const project = await projectsService.getProjectById(this.projectId);
      this.project = project;

      this.renderProject();
      
      if (loadingState) loadingState.classList.add('hidden');
    } catch (error) {
      console.error('Failed to load project:', error);
      this.showError(error.message || 'Failed to load project details');
    }
  }

  renderProject() {
    if (!this.project) return;

    // Title
    const title = document.getElementById('projectTitle');
    if (title) title.textContent = this.project.name;

    const breadcrumb = document.getElementById('breadcrumbTitle');
    if (breadcrumb) breadcrumb.textContent = this.project.name;

    // Status badge
    const statusBadge = document.getElementById('statusBadge');
    if (statusBadge) {
      const status = this.project.projectStatus || 'Active';
      statusBadge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
      statusBadge.className = `status-badge status-${this.project.projectStatus?.toLowerCase() || 'active'}`;
    }

    // Created date
    const createdDate = document.getElementById('createdDate');
    if (createdDate) {
      createdDate.textContent = `Created: ${formatDate(this.project.createdAt) || '—'}`;
    }

    // Overview info
    document.getElementById('infoName').textContent = this.project.name;
    document.getElementById('infoDescription').textContent = this.project.description || '—';
    document.getElementById('infoProblem').textContent = this.project.problemStatement || '—';
    document.getElementById('infoGoal').textContent = this.project.goal || '—';

    // Configuration
    document.getElementById('infoCategory').textContent = this.project.projectCategory 
      ? this.project.projectCategory.replace(/_/g, ' ').toUpperCase() 
      : '—';
    document.getElementById('infoType').textContent = this.project.projectType 
      ? this.project.projectType.charAt(0).toUpperCase() + this.project.projectType.slice(1)
      : '—';
    document.getElementById('infoComplexity').textContent = this.project.projectComplexity || '—';
    document.getElementById('infoCriticality').textContent = this.project.projectCriticality || '—';
    document.getElementById('infoPriority').textContent = this.project.projectPriority || '—';

    // Resources
    document.getElementById('infoBudget').textContent = this.project.expectedBudget 
      ? `$${this.project.expectedBudget.toLocaleString()}` 
      : '—';
    document.getElementById('infoTimeline').textContent = this.project.expectedTimelineInDays 
      ? `${this.project.expectedTimelineInDays} days` 
      : '—';
    document.getElementById('infoCreationReason').textContent = this.project.projectCreationReasonType || '—';

    // Ownership
    document.getElementById('infoOwner').textContent = this.project.ownerId || '—';
    document.getElementById('infoProjectStatus').textContent = this.project.projectStatus || 'Active';

    // Render action buttons
    this.renderActionButtons();
  }

  renderActionButtons() {
    const grid = document.getElementById('actionsGrid');
    if (!grid) return;

    const status = this.project.projectStatus?.toLowerCase() || 'active';
    const buttons = [];

    // Status-aware buttons
    if (status === 'active' || (status !== 'on-hold' && status !== 'aborted' && status !== 'completed' && status !== 'archived')) {
      // Active or in-progress statuses
      buttons.push(this.createActionButton('On Hold', 'onHoldModal', '⏸️', 'warning'));
      buttons.push(this.createActionButton('Abort', 'abortModal', '❌', 'danger'));
    }

    if (status === 'on-hold') {
      buttons.push(this.createActionButton('Resume', 'resumeModal', '▶️', 'success'));
      buttons.push(this.createActionButton('Abort', 'abortModal', '❌', 'danger'));
    }

    if (status === 'aborted') {
      buttons.push(this.createActionButton('Resume', 'resumeModal', '▶️', 'success'));
    }

    // Only DRAFT projects can be activated (backend requirement)
    if (status === 'draft') {
      buttons.push(this.createActionButton('Activate', 'activateModal', '✨', 'info'));
    }

    // Complete is only for ACTIVE projects
    if (status === 'active') {
      buttons.push(this.createActionButton('Complete', 'completeModal', '✅', 'success'));
    }

    // Always show these operations
    buttons.push(this.createActionButton('Change Owner', 'changeOwnerModal', '👥', 'primary'));
    buttons.push(this.createActionButton('Archive', 'archiveModal', '📦', 'secondary'));
    buttons.push(this.createActionButton('Delete', 'deleteProjectModal', '🗑️', 'danger'));

    grid.innerHTML = buttons.map(btn => `
      <button type="button" class="action-button action-button-${btn.color}" onclick="event.currentTarget.parentElement.parentElement.__projectDetail.showActionModal('${btn.modalId}')">
        <span class="action-icon">${btn.icon}</span>
        <span class="action-text">${btn.text}</span>
        <span class="action-arrow">→</span>
      </button>
    `).join('');

    // Store reference for modal showing
    grid.parentElement.__projectDetail = this;
  }

  createActionButton(text, modalId, icon, color) {
    return { text, modalId, icon, color };
  }

  showActionModal(modalId) {
    showModal(modalId);
  }

  openEditModal() {
    if (!this.project) return;

    document.getElementById('editProjectName').value = this.project.name;
    document.getElementById('editProjectDescription').value = this.project.description || '';
    document.getElementById('editProblemStatement').value = this.project.problemStatement || '';
    document.getElementById('editGoal').value = this.project.goal || '';
    document.getElementById('editProjectCategory').value = this.project.projectCategory || '';
    document.getElementById('editProjectType').value = this.project.projectType || '';
    document.getElementById('editExpectedBudget').value = this.project.expectedBudget || '';
    document.getElementById('editExpectedTimeline').value = this.project.expectedTimelineInDays || '';
    document.getElementById('editProjectComplexity').value = this.project.projectComplexity || '';
    document.getElementById('editProjectCriticality').value = this.project.projectCriticality || '';
    document.getElementById('editProjectPriority').value = this.project.projectPriority || '';

    showModal('editProjectModal');
  }

  async handleEditProject(e) {
    e.preventDefault();

    const updateData = {
      name: document.getElementById('editProjectName').value.trim(),
      description: document.getElementById('editProjectDescription').value.trim(),
      problemStatement: document.getElementById('editProblemStatement').value.trim(),
      goal: document.getElementById('editGoal').value.trim(),
      projectUpdationReasonType: 'ui_update',
    };

    const category = document.getElementById('editProjectCategory').value;
    if (category) updateData.projectCategory = category;

    const type = document.getElementById('editProjectType').value;
    if (type) updateData.projectType = type;

    const budget = parseFloat(document.getElementById('editExpectedBudget').value);
    if (!isNaN(budget) && budget > 0) updateData.expectedBudget = Math.floor(budget);

    const timeline = parseInt(document.getElementById('editExpectedTimeline').value);
    if (!isNaN(timeline) && timeline >= 1) updateData.expectedTimelineInDays = timeline;

    const complexity = document.getElementById('editProjectComplexity').value;
    if (complexity) updateData.projectComplexity = complexity;

    const criticality = document.getElementById('editProjectCriticality').value;
    if (criticality) updateData.projectCriticality = criticality;

    const priority = document.getElementById('editProjectPriority').value;
    if (priority) updateData.projectPriority = priority;

    try {
      showToast('Updating project...', 'info');
      await projectsService.updateProject(this.projectId, updateData);
      showToast('Project updated successfully', 'success');
      hideModal('editProjectModal');
      await this.loadProject();
    } catch (error) {
      showToast(error.message || 'Failed to update project', 'error');
    }
  }

  async handleOnHold(e) {
    e.preventDefault();

    const reasonType = document.getElementById('onHoldReasonType').value;
    const reasonDescription = document.getElementById('onHoldReasonDescription').value;

    if (!reasonType) {
      document.getElementById('error-onHoldReasonType').textContent = 'Please select a reason';
      return;
    }

    try {
      showToast('Putting project on hold...', 'info');
      await projectsService.putProjectOnHold(this.projectId, reasonType, reasonDescription);
      showToast('Project put on hold successfully', 'success');
      hideModal('onHoldModal');
      document.getElementById('onHoldForm').reset();
      await this.loadProject();
    } catch (error) {
      showToast(error.message || 'Failed to put project on hold', 'error');
    }
  }

  async handleAbort(e) {
    e.preventDefault();

    const reasonType = document.getElementById('abortReasonType').value;
    const reasonDescription = document.getElementById('abortReasonDescription').value;

    if (!reasonType) {
      document.getElementById('error-abortReasonType').textContent = 'Please select a reason';
      return;
    }

    try {
      showToast('Aborting project...', 'info');
      await projectsService.abortProject(this.projectId, reasonType, reasonDescription);
      showToast('Project aborted successfully', 'success');
      hideModal('abortModal');
      document.getElementById('abortForm').reset();
      await this.loadProject();
    } catch (error) {
      showToast(error.message || 'Failed to abort project', 'error');
    }
  }

  async handleResume(e) {
    e.preventDefault();

    const reasonType = document.getElementById('resumeReasonType').value;
    const reasonDescription = document.getElementById('resumeReasonDescription').value;

    if (!reasonType) {
      document.getElementById('error-resumeReasonType').textContent = 'Please select a reason';
      return;
    }

    try {
      showToast('Resuming project...', 'info');
      await projectsService.resumeProject(this.projectId, reasonType, reasonDescription);
      showToast('Project resumed successfully', 'success');
      hideModal('resumeModal');
      document.getElementById('resumeForm').reset();
      await this.loadProject();
    } catch (error) {
      showToast(error.message || 'Failed to resume project', 'error');
    }
  }

  async handleActivate(e) {
    e.preventDefault();

    const reasonType = document.getElementById('activationReasonType').value;
    const reasonDescription = document.getElementById('activationReasonDescription').value;

    if (!reasonType) {
      document.getElementById('error-activationReasonType').textContent = 'Please select a reason';
      return;
    }

    try {
      showToast('Activating project...', 'info');
      await projectsService.activateProject(this.projectId, reasonType, reasonDescription);
      showToast('Project activated successfully', 'success');
      hideModal('activateModal');
      document.getElementById('activateForm').reset();
      await this.loadProject();
    } catch (error) {
      showToast(error.message || 'Failed to activate project', 'error');
    }
  }

  async handleComplete() {
    try {
      showToast('Completing project...', 'info');
      await projectsService.completeProject(this.projectId);
      showToast('Project completed successfully', 'success');
      hideModal('completeModal');
      await this.loadProject();
    } catch (error) {
      showToast(error.message || 'Failed to complete project', 'error');
    }
  }

  async handleArchive() {
    try {
      showToast('Archiving project...', 'info');
      await projectsService.archiveProject(this.projectId);
      showToast('Project archived successfully', 'success');
      hideModal('archiveModal');
      await this.loadProject();
    } catch (error) {
      showToast(error.message || 'Failed to archive project', 'error');
    }
  }

  async handleChangeOwner(e) {
    e.preventDefault();

    const userId = document.getElementById('newOwnerId').value;
    const reasonType = document.getElementById('changeOwnerReasonType').value;
    const description = document.getElementById('changeOwnerDescription').value;

    if (!userId) {
      document.getElementById('error-newOwnerId').textContent = 'Please select a new owner';
      return;
    }

    if (!reasonType) {
      document.getElementById('error-changeOwnerReasonType').textContent = 'Please select a reason';
      return;
    }

    try {
      showToast('Changing project owner...', 'info');
      await projectsService.changeProjectOwner(this.projectId, userId, reasonType, description);
      showToast('Project owner changed successfully', 'success');
      hideModal('changeOwnerModal');
      document.getElementById('changeOwnerForm').reset();
      await this.loadProject();
    } catch (error) {
      showToast(error.message || 'Failed to change project owner', 'error');
    }
  }

  async handleDeleteProject(e) {
    e.preventDefault();

    const reasonType = document.getElementById('deletionReasonType').value;
    const reasonDescription = document.getElementById('deletionReasonDescription').value;

    if (!reasonType) {
      document.getElementById('error-deletionReasonType').textContent = 'Please select a deletion reason';
      return;
    }

    try {
      showToast('Deleting project...', 'info');
      await projectsService.deleteProject(this.projectId, reasonType, reasonDescription);
      showToast('Project deleted successfully', 'success');
      hideModal('deleteProjectModal');
      window.location.hash = '#/projects';
    } catch (error) {
      showToast(error.message || 'Failed to delete project', 'error');
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ProjectDetailPage();
  });
} else {
  new ProjectDetailPage();
}
