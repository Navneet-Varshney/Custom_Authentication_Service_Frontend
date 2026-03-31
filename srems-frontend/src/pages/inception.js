import { showToast, debounce } from '../js/utils/helpers.js';
import inceptionService from '../js/services/inception.service.js';

export class InceptionPage {
  constructor() {
    this.inceptions = [];
    this.filteredInceptions = [];
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.loadInceptions();
  }

  attachEventListeners() {
    document.getElementById('btnCreateInception')?.addEventListener('click', () => this.openCreateModal());
    document.getElementById('btnCreateInceptionEmpty')?.addEventListener('click', () => this.openCreateModal());
    
    document.getElementById('filterStatus')?.addEventListener('change', () => this.applyFilters());
    document.getElementById('searchInception')?.addEventListener('input', debounce(() => this.applyFilters(), 300));
  }

  async loadInceptions() {
    try {
      const container = document.getElementById('inceptionContainer');
      container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading inception documents...</p></div>';

      const data = await inceptionService.getInceptions();
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
    showToast('Create inception document feature coming soon', 'info');
  }
}
