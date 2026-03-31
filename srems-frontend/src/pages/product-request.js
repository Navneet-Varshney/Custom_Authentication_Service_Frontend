import { showToast, debounce } from '../js/utils/helpers.js';
import productRequestService from '../js/services/product-request.service.js';

export class ProductRequestPage {
  constructor() {
    this.requests = [];
    this.filteredRequests = [];
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.loadProductRequests();
  }

  attachEventListeners() {
    document.getElementById('btnCreateProductRequest')?.addEventListener('click', () => this.openCreateModal());
    document.getElementById('btnCreateProductRequestEmpty')?.addEventListener('click', () => this.openCreateModal());
    
    document.getElementById('filterPriority')?.addEventListener('change', () => this.applyFilters());
    document.getElementById('filterRequestStatus')?.addEventListener('change', () => this.applyFilters());
    document.getElementById('searchProductRequest')?.addEventListener('input', debounce(() => this.applyFilters(), 300));
  }

  async loadProductRequests() {
    try {
      const container = document.getElementById('productRequestContainer');
      container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading product requests...</p></div>';

      const data = await productRequestService.getProductRequests();
      this.requests = Array.isArray(data) ? data : [];
      this.filteredRequests = this.requests;
      this.renderProductRequests();
    } catch (error) {
      console.error('Failed to load product requests:', error);
      showToast(error.message || 'Failed to load product requests', 'error');
      // Initialize with empty arrays to prevent .filter() errors
      this.requests = [];
      this.filteredRequests = [];
      this.showEmptyState();
    }
  }

  applyFilters() {
    const priority = document.getElementById('filterPriority').value;
    const status = document.getElementById('filterRequestStatus').value;
    const search = document.getElementById('searchProductRequest').value.toLowerCase();

    // Ensure requests is always an array
    if (!Array.isArray(this.requests)) {
      this.requests = [];
    }

    this.filteredRequests = this.requests.filter(item => {
      const priorityMatch = !priority || item.priority === priority;
      const statusMatch = !status || item.status === status;
      const searchMatch = !search || 
        item.title?.toLowerCase().includes(search) ||
        item.requestor?.toLowerCase().includes(search);
      return priorityMatch && statusMatch && searchMatch;
    });

    this.renderProductRequests();
  }

  renderProductRequests() {
    const container = document.getElementById('productRequestContainer');
    const emptyState = document.getElementById('emptyProductRequest');

    if (this.filteredRequests.length === 0) {
      this.showEmptyState();
      return;
    }

    emptyState.classList.add('hidden');
    container.innerHTML = '<div class="list-items">' + this.filteredRequests.map(item => `
      <div class="list-item">
        <div class="list-item-header">
          <h4>${item.title || 'Untitled Request'}</h4>
          <span class="priority-badge priority-${item.priority || 'medium'}">${item.priority || 'Medium'}</span>
        </div>
        <div class="list-item-body">
          <p><strong>Requestor:</strong> ${item.requestor || 'N/A'}</p>
          <p><strong>Description:</strong> ${item.description || 'No description'}</p>
          <p><strong>Submitted:</strong> ${new Date(item.submittedDate).toLocaleDateString() || 'N/A'}</p>
        </div>
        <div class="list-item-status">
          <span class="status-badge status-${item.status || 'submitted'}">${item.status || 'Submitted'}</span>
        </div>
        <div class="list-item-actions">
          <button class="btn btn-sm btn-primary" data-id="${item.id}">View</button>
          <button class="btn btn-sm btn-warning" data-id="${item.id}">Edit</button>
          <button class="btn btn-sm btn-danger" data-id="${item.id}">Delete</button>
        </div>
      </div>
    `).join('') + '</div>';
  }

  showEmptyState() {
    document.getElementById('emptyProductRequest')?.classList.remove('hidden');
    document.getElementById('productRequestContainer').innerHTML = '';
  }

  openCreateModal() {
    showToast('Create product request feature coming soon', 'info');
  }
}
