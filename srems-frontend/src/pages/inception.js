import { showToast, debounce, showConfirmDialog } from '../js/utils/helpers.js';
import inceptionService from '../js/services/inception.service.js';
import { store } from '../js/store/store.js';

export class InceptionPage {
  constructor() {
    this.inceptions = [];
    this.filteredInceptions = [];
    this.currentProjectId = null;  // Store projectId as instance variable
    this.init();
  }

  init() {
    // Create modal in document body (outside page-content)
    this.createModal();
    
    // Use setTimeout to ensure DOM elements are loaded
    setTimeout(() => {
      this.attachEventListeners();
      this.loadInceptions();
    }, 100);
  }

  createModal() {
    // Check if modal already exists
    if (document.getElementById('createInceptionModal')) {
      console.log('✅ Modal already exists');
      return;
    }

    const modalHTML = `
      <div id="createInceptionModal" class="modal hidden">
        <div class="modal-overlay" id="modalOverlay"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h2>Create Inception Document</h2>
            <button type="button" class="modal-close" id="btnCloseInceptionModal">&times;</button>
          </div>
          <div class="modal-body">
            <form id="inceptionForm">
              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" id="inceptionParallelMeetings" class="form-input">
                  <span>Allow Parallel Meetings</span>
                </label>
                <small class="form-hint">Enable multiple meetings to occur simultaneously</small>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btnCancelInception">Cancel</button>
            <button type="button" class="btn btn-primary" id="btnSaveInception">Create Inception</button>
          </div>
        </div>
      </div>
    `;

    // Add modal to document body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('✅ Modal created in document.body');
  }

  attachEventListeners() {
    const btnCreate = document.getElementById('btnCreateInception');
    const btnCreateEmpty = document.getElementById('btnCreateInceptionEmpty');
    const btnClose = document.getElementById('btnCloseInceptionModal');
    const btnCancel = document.getElementById('btnCancelInception');
    const btnSave = document.getElementById('btnSaveInception');
    const overlay = document.getElementById('modalOverlay');
    const filterStatus = document.getElementById('filterStatus');
    const searchInception = document.getElementById('searchInception');

    console.log('🔍 Attaching event listeners...');
    console.log('btnCreate:', btnCreate);
    console.log('btnCreateEmpty:', btnCreateEmpty);
    console.log('btnClose:', btnClose);
    console.log('btnSave:', btnSave);

    if (btnCreate) {
      btnCreate.addEventListener('click', () => {
        console.log('✅ btnCreate clicked');
        this.openCreateModal();
      });
    } else {
      console.warn('⚠️ btnCreate not found');
    }

    if (btnCreateEmpty) {
      btnCreateEmpty.addEventListener('click', () => {
        console.log('✅ btnCreateEmpty clicked');
        this.openCreateModal();
      });
    } else {
      console.warn('⚠️ btnCreateEmpty not found');
    }

    if (filterStatus) {
      filterStatus.addEventListener('change', () => this.applyFilters());
    }

    if (searchInception) {
      searchInception.addEventListener('input', debounce(() => this.applyFilters(), 300));
    }

    // Modal event listeners
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        console.log('✅ btnClose clicked');
        this.closeCreateModal();
      });
    } else {
      console.warn('⚠️ btnClose not found');
    }

    if (btnCancel) {
      btnCancel.addEventListener('click', () => {
        console.log('✅ btnCancel clicked');
        this.closeCreateModal();
      });
    } else {
      console.warn('⚠️ btnCancel not found');
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        console.log('✅ overlay clicked');
        this.closeCreateModal();
      });
    } else {
      console.warn('⚠️ overlay not found');
    }

    if (btnSave) {
      btnSave.addEventListener('click', () => {
        console.log('✅ btnSave clicked');
        this.saveInception();
      });
    } else {
      console.warn('⚠️ btnSave not found');
    }
  }

  async loadInceptions() {
    try {
      const container = document.getElementById('inceptionContainer');
      container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading inception documents...</p></div>';

      // Get current project from store
      let currentProjectId = store.state.projects.current?._id || store.state.projects.current?.id || store.state.projects.current;
      
      if (!currentProjectId) {
        console.log('🔄 Attempting to restore project from localStorage...');
        const STORAGE_KEYS = { CURRENT_PROJECT: 'CURRENT_PROJECT' };
        const savedProject = localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT);
        if (savedProject) {
          try {
            const projectData = typeof savedProject === 'string' ? JSON.parse(savedProject) : savedProject;
            currentProjectId = projectData?._id || projectData?.id || projectData;
            console.log('✅ Restored project from localStorage:', currentProjectId);
            store.state.projects.current = projectData;
          } catch (e) {
            console.error('Failed to parse saved project:', e);
            currentProjectId = savedProject;
          }
        }
      }

      if (!currentProjectId) {
        showToast('Please select a project first', 'warning');
        this.inceptions = [];
        this.filteredInceptions = [];
        this.showEmptyState();
        return;
      }

      // ✅ STORE PROJECT ID FOR LATER USE IN DELETE/EDIT
      this.currentProjectId = currentProjectId;
      console.log('💾 Stored projectId:', this.currentProjectId);

      // ✅ TRY TO LOAD EXISTING INCEPTION FIRST
      console.log('🔍 Checking for existing inception...');
      const existingInception = await inceptionService.getLatestInception(currentProjectId);
      
      if (existingInception) {
        console.log('✅ Found existing inception:', existingInception);
        this.inceptions = [existingInception];
        this.filteredInceptions = [existingInception];
        
        // Hide create button - inception already exists
        const btnCreate = document.getElementById('btnCreateInception');
        const btnCreateEmpty = document.getElementById('btnCreateInceptionEmpty');
        if (btnCreate) btnCreate.style.display = 'none';
        if (btnCreateEmpty) btnCreateEmpty.style.display = 'none';
        
        this.renderInceptions();
        showToast('Inception loaded successfully', 'success');
        return;
      }

      // If no existing inception, show empty state with create option
      console.log('ℹ️ No existing inception found');
      this.inceptions = [];
      this.filteredInceptions = [];
      this.showEmptyState();
      
    } catch (error) {
      console.error('Failed to load inceptions:', error);
      showToast(error.message || 'Failed to load inception documents', 'error');
      this.inceptions = [];
      this.filteredInceptions = [];
      this.showEmptyState();
    }
  }

  applyFilters() {
    const status = document.getElementById('filterStatus').value;
    const search = document.getElementById('searchInception').value.toLowerCase();

    // Ensure inceptions is always an array
    if (!Array.isArray(this.inceptions)) {
      this.inceptions = [];
    }

    this.filteredInceptions = this.inceptions.filter(item => {
      const statusMatch = !status || item.status === status;
      const searchMatch = !search || 
        item.title?.toLowerCase().includes(search) ||
        item.projectName?.toLowerCase().includes(search);
      return statusMatch && searchMatch;
    });

    this.renderInceptions();
  }

  renderInceptions() {
    const container = document.getElementById('inceptionContainer');
    const emptyState = document.getElementById('emptyInception');

    if (this.filteredInceptions.length === 0) {
      this.showEmptyState();
      return;
    }

    emptyState.classList.add('hidden');
    container.innerHTML = this.filteredInceptions.map(item => {
      // Safe date parsing
      let createdDate = 'N/A';
      try {
        if (item.createdAt) {
          const dateObj = new Date(item.createdAt);
          if (!isNaN(dateObj.getTime())) {
            createdDate = dateObj.toLocaleDateString();
          }
        }
      } catch (e) {
        console.error('Date parsing error:', e);
        createdDate = 'N/A';
      }

      // Map backend fields to display fields
      const displayItem = {
        id: item._id || item.id,
        title: item.title || `Inception - ${createdDate}`,
        status: item.isFrozen ? 'Frozen' : (item.isDeleted ? 'Deleted' : 'Active'),
        projectName: item.projectName || item.projectId || 'N/A',
        vision: item.vision || 'Not yet defined',
        createdAt: createdDate,
        allowParallelMeetings: item.allowParallelMeetings
      };

      console.log('📋 Rendering inception item:', {
        itemId: item._id || item.id,
        displayItemId: displayItem.id,
        itemData: item
      });

      return `
        <div class="card">
          <div class="card-header">
            <h3>${displayItem.title}</h3>
            <span class="status-badge status-${displayItem.status.toLowerCase()}">${displayItem.status}</span>
          </div>
          <div class="card-body">
            <p><strong>Status:</strong> ${displayItem.status}</p>
            <p><strong>Project:</strong> ${displayItem.projectName}</p>
            <p><strong>Parallel Meetings:</strong> ${displayItem.allowParallelMeetings ? 'Allowed' : 'Not Allowed'}</p>
            <p><strong>Created:</strong> ${displayItem.createdAt}</p>
          </div>
          <div class="card-actions">
            <button class="btn btn-sm btn-primary btnViewInception" data-id="${displayItem.id}">View</button>
            <button class="btn btn-sm btn-warning btnEditInception" data-id="${displayItem.id}">Edit</button>
            <button class="btn btn-sm btn-danger btnDeleteInception" data-id="${displayItem.id}">Delete</button>
          </div>
        </div>
      `;
    }).join('');

    // Attach event listeners to buttons
    this.attachRenderEventListeners();
  }

  attachRenderEventListeners() {
    // Delete buttons
    document.querySelectorAll('.btnDeleteInception')?.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        console.log('🗑️ Delete button clicked:', {
          inceptionId: id,
          projectId: this.currentProjectId,
          domElement: e.target,
          allAttributes: e.target.attributes
        });
        
        const confirmed = await showConfirmDialog('Delete Inception', 'This action cannot be undone. Are you sure?');
        if (confirmed) {
          try {
            if (!this.currentProjectId) {
              throw new Error('Project ID not available');
            }
            console.log('🔄 Deleting inception:', { projectId: this.currentProjectId, inceptionId: id });
            await inceptionService.deleteInception(this.currentProjectId, id);
            showToast('Inception deleted successfully', 'success');
            await this.loadInceptions();
          } catch (error) {
            console.error('❌ Delete error:', error);
            showToast(error.message || 'Failed to delete inception', 'error');
          }
        }
      });
    });

    // View buttons
    document.querySelectorAll('.btnViewInception')?.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        console.log('👁️ View inception:', id);
        // TODO: Open detail view
      });
    });

    // Edit buttons
    document.querySelectorAll('.btnEditInception')?.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        console.log('✏️ Edit inception:', id);
        showToast('Edit feature coming soon', 'info');
      });
    });
  }

  showEmptyState() {
    document.getElementById('emptyInception')?.classList.remove('hidden');
    document.getElementById('inceptionContainer').innerHTML = '';
  }

  openCreateModal() {
    console.log('📱 openCreateModal called');
    const modal = document.getElementById('createInceptionModal');
    const form = document.getElementById('inceptionForm');
    
    console.log('Modal element:', modal);
    console.log('Form element:', form);
    
    if (!modal) {
      console.error('❌ Modal not found!');
      return;
    }

    if (form) {
      form.reset();
    }
    
    // Remove hidden class and force display
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    console.log('✅ Modal should now be visible');
    console.log('Modal display:', modal.style.display);
    console.log('Modal visibility:', modal.style.visibility);
  }

  closeCreateModal() {
    console.log('📱 closeCreateModal called');
    const modal = document.getElementById('createInceptionModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
      modal.style.visibility = 'hidden';
      console.log('✅ Modal hidden');
    }
  }

  async saveInception() {
    try {
      // Handle both object and string formats for project ID
      let currentProjectId = store.state.projects.current?._id || store.state.projects.current?.id || store.state.projects.current;
      console.log('🔍 Current Project ID:', currentProjectId);
      console.log('🔍 Store State:', store.state.projects.current);
      
      // Try to restore from localStorage if not in store
      if (!currentProjectId) {
        console.log('🔄 Restoring project from localStorage...');
        const STORAGE_KEYS = { CURRENT_PROJECT: 'CURRENT_PROJECT' };
        const savedProject = localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT);
        if (savedProject) {
          try {
            const projectData = typeof savedProject === 'string' ? JSON.parse(savedProject) : savedProject;
            currentProjectId = projectData?._id || projectData?.id || projectData;
            console.log('✅ Restored from localStorage:', currentProjectId);
          } catch (e) {
            console.error('Failed to parse saved project:', e);
            currentProjectId = savedProject;
          }
        }
      }
      
      if (!currentProjectId) {
        console.warn('⚠️ No project ID found');
        showToast('Please select a project first', 'warning');
        return;
      }

      const allowParallelMeetings = document.getElementById('inceptionParallelMeetings').checked;
      console.log('📝 Form Data:', { projectId: currentProjectId, allowParallelMeetings });

      // Show loading state
      const btn = document.getElementById('btnSaveInception');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Creating...';

      // Call service
      console.log('🚀 Calling API...');
      const response = await inceptionService.createInception({
        projectId: currentProjectId,
        allowParallelMeetings
      });

      console.log('📦 API Response:', response);

      // Reset button
      btn.disabled = false;
      btn.textContent = originalText;

      // Validate response
      if (!response.success) {
        console.error('❌ API returned success=false:', response.message);
        showToast(response.message || 'Failed to create inception', 'error');
        return;
      }

      console.log('✅ Success! Closing modal...');
      // Close modal and reload
      this.closeCreateModal();
      showToast('✅ Inception created successfully', 'success');
      
      // Reload inceptions list
      await this.loadInceptions();

    } catch (error) {
      console.error('❌ Exception caught:', error);
      showToast(error.message || 'Failed to create inception document', 'error');
      
      // Reset button
      const btn = document.getElementById('btnSaveInception');
      btn.disabled = false;
      btn.textContent = 'Create Inception';
    }
  }
}
