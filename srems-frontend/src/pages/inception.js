import { showToast, debounce } from '../js/utils/helpers.js';
import inceptionService from '../js/services/inception.service.js';
import { store } from '../js/store/store.js';

export class InceptionPage {
  constructor() {
    this.inceptions = [];
    this.filteredInceptions = [];
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

      // Get current project from store (handle both object and string formats)
      let currentProjectId = store.state.projects.current?._id || store.state.projects.current?.id || store.state.projects.current;
      
      if (!currentProjectId) {
        console.log('🔄 Attempting to restore project from localStorage...');
        const STORAGE_KEYS = {
          CURRENT_PROJECT: 'CURRENT_PROJECT'
        };
        const savedProject = localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT);
        if (savedProject) {
          try {
            const projectData = typeof savedProject === 'string' ? JSON.parse(savedProject) : savedProject;
            currentProjectId = projectData?._id || projectData?.id || projectData;
            console.log('✅ Restored project from localStorage:', currentProjectId);
            // Update store with restored project
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

      const data = await inceptionService.getInceptions(currentProjectId);
      this.inceptions = Array.isArray(data) ? data : [];
      this.filteredInceptions = this.inceptions;
      this.renderInceptions();
    } catch (error) {
      console.error('Failed to load inceptions:', error);
      showToast(error.message || 'Failed to load inception documents', 'error');
      // Initialize with empty arrays to prevent .map() errors
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
    container.innerHTML = this.filteredInceptions.map(item => `
      <div class="card">
        <div class="card-header">
          <h3>${item.title || 'Untitled Inception'}</h3>
          <span class="status-badge status-${item.status || 'draft'}">${item.status || 'Draft'}</span>
        </div>
        <div class="card-body">
          <p><strong>Project:</strong> ${item.projectName || 'N/A'}</p>
          <p><strong>Vision:</strong> ${item.vision || 'Not defined'}</p>
          <p><strong>Created:</strong> ${new Date(item.createdAt).toLocaleDateString() || 'N/A'}</p>
        </div>
        <div class="card-actions">
          <button class="btn btn-sm btn-primary" data-id="${item.id}">View</button>
          <button class="btn btn-sm btn-warning" data-id="${item.id}">Edit</button>
          <button class="btn btn-sm btn-danger" data-id="${item.id}">Delete</button>
        </div>
      </div>
    `).join('');
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
