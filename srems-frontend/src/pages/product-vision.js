import { showToast, debounce, showConfirmDialog } from '../js/utils/helpers.js';
import productVisionService from '../js/services/product-vision.service.js';
import { store } from '../js/store/store.js';

export class ProductVisionPage {
  constructor() {
    this.visions = [];
    this.filteredVisions = [];
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.loadProductVisions();
  }

  attachEventListeners() {
    document.getElementById('btnCreateProductVision')?.addEventListener('click', () => this.openCreateModal());
    document.getElementById('btnCreateProductVisionEmpty')?.addEventListener('click', () => this.openCreateModal());
    
    document.getElementById('filterVisionStatus')?.addEventListener('change', () => this.applyFilters());
    document.getElementById('searchProductVision')?.addEventListener('input', debounce(() => this.applyFilters(), 300));
  }

  async loadProductVisions() {
    try {
      const container = document.getElementById('productVisionContainer');
      container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading product vision documents...</p></div>';

      // Get current project from store
      let currentProjectId = store.state.projects.current?._id || 
                            store.state.projects.current?.id || 
                            store.state.projects.current;
      
      // Fallback to localStorage if store is empty
      if (!currentProjectId) {
        const storedProject = localStorage.getItem('CURRENT_PROJECT');
        if (storedProject) {
          try {
            const projectData = typeof storedProject === 'string' ? JSON.parse(storedProject) : storedProject;
            currentProjectId = projectData?._id || projectData?.id || projectData;
            store.state.projects.current = projectData;
          } catch (e) {
            console.error('Failed to parse saved project:', e);
          }
        }
      }

      if (!currentProjectId) {
        showToast('No project selected. Please go back and select a project.', 'error');
        this.visions = [];
        this.filteredVisions = [];
        this.showEmptyState();
        return;
      }

      console.log('🔍 Loading product vision for project:', currentProjectId);
      const data = await productVisionService.getProductVisions(currentProjectId);
      
      // Ensure visions is always an array
      this.visions = Array.isArray(data) ? data : (data?.data || []);
      this.filteredVisions = [...this.visions];
      
      if (this.visions.length === 0) {
        console.log('ℹ️ No product vision found for project');
        showToast('No product vision created yet. Create one to get started.', 'info');
      }
      
      this.renderProductVisions();
    } catch (error) {
      console.error('Failed to load product visions:', error);
      showToast(error.message || 'Failed to load product vision documents', 'error');
      this.showEmptyState();
    }
  }

  applyFilters() {
    const status = document.getElementById('filterVisionStatus').value;
    const search = document.getElementById('searchProductVision').value.toLowerCase();

    this.filteredVisions = this.visions.filter(item => {
      const statusMatch = !status || item.status === status;
      const searchMatch = !search || 
        item.title?.toLowerCase().includes(search) ||
        item.productName?.toLowerCase().includes(search);
      return statusMatch && searchMatch;
    });

    this.renderProductVisions();
  }

  renderProductVisions() {
    const container = document.getElementById('productVisionContainer');
    const emptyState = document.getElementById('emptyProductVision');

    // Ensure filteredVisions is an array
    const visions = Array.isArray(this.filteredVisions) ? this.filteredVisions : [];

    if (visions.length === 0) {
      this.showEmptyState();
      return;
    }

    emptyState.classList.add('hidden');
    container.innerHTML = visions.map(item => {
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
        title: item.title || 'Untitled Vision',
        status: item.isFrozen ? 'Frozen' : (item.isDeleted ? 'Deleted' : 'Active'),
        productName: item.productName || 'N/A',
        visionStatement: item.visionStatement || 'Not defined',
        targetMarket: item.targetMarket || 'N/A',
        keyObjectives: Array.isArray(item.keyObjectives) ? item.keyObjectives : [],
        createdAt: createdDate
      };

      return `
        <div class="card vision-card">
          <div class="card-header">
            <h3>${displayItem.title}</h3>
            <span class="status-badge status-${displayItem.status.toLowerCase()}">${displayItem.status}</span>
          </div>
          <div class="card-body">
            <p><strong>Product:</strong> ${displayItem.productName}</p>
            <p><strong>Vision Statement:</strong> ${displayItem.visionStatement}</p>
            <p><strong>Target Market:</strong> ${displayItem.targetMarket}</p>
            <p><strong>Key Objectives:</strong></p>
            <ul class="objectives-list">
              ${displayItem.keyObjectives.slice(0, 3).map(obj => `<li>${obj}</li>`).join('')}
            </ul>
            <p><strong>Created:</strong> ${displayItem.createdAt}</p>
          </div>
          <div class="card-actions">
            <button class="btn btn-sm btn-primary btnViewProductVision" data-id="${displayItem.id}">View</button>
            <button class="btn btn-sm btn-warning btnEditProductVision" data-id="${displayItem.id}">Edit</button>
            <button class="btn btn-sm btn-danger btnDeleteProductVision" data-id="${displayItem.id}">Delete</button>
          </div>
        </div>
      `;
    }).join('');

    // Attach event listeners to buttons
    this.attachRenderEventListeners();
  }

  attachRenderEventListeners() {
    // View buttons
    document.querySelectorAll('.btnViewProductVision')?.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        console.log('View product vision:', id);
        // TODO: Open detail view
      });
    });

    // Edit buttons
    document.querySelectorAll('.btnEditProductVision')?.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        console.log('Edit product vision:', id);
        showToast('Edit feature coming soon', 'info');
      });
    });

    // Delete buttons
    document.querySelectorAll('.btnDeleteProductVision')?.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        console.log('Delete product vision:', id);
        const confirmed = await showConfirmDialog('Delete Product Vision', 'This action cannot be undone. Are you sure?');
        if (confirmed) {
          try {
            await productVisionService.deleteProductVision(store.state.projects.current?._id, id);
            showToast('Product vision deleted successfully', 'success');
            await this.loadProductVisions();
          } catch (error) {
            showToast(error.message || 'Failed to delete product vision', 'error');
          }
        }
      });
    });
  }

  showEmptyState() {
    document.getElementById('emptyProductVision')?.classList.remove('hidden');
    document.getElementById('productVisionContainer').innerHTML = '';
  }

  openCreateModal() {
    showToast('Create product vision document feature coming soon', 'info');
  }
}
