import { showToast, debounce } from '../js/utils/helpers.js';
import elicitationService from '../js/services/elicitation.service.js';

export class ElicitationPage {
  constructor() {
    this.elicitations = [];
    this.filteredElicitations = [];
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.loadElicitations();
  }

  attachEventListeners() {
    document.getElementById('btnCreateElicitation')?.addEventListener('click', () => this.openCreateModal());
    document.getElementById('btnCreateElicitationEmpty')?.addEventListener('click', () => this.openCreateModal());
    
    document.getElementById('filterMethod')?.addEventListener('change', () => this.applyFilters());
    document.getElementById('searchElicitation')?.addEventListener('input', debounce(() => this.applyFilters(), 300));
  }

  async loadElicitations() {
    try {
      const tableBody = document.getElementById('elicitationTableBody');
      tableBody.innerHTML = '<tr class="loading"><td colspan="6"><div class="loading-spinner"><div class="spinner"></div><p>Loading...</p></div></td></tr>';

      const data = await elicitationService.getElicitations();
      this.elicitations = Array.isArray(data) ? data : [];
      this.filteredElicitations = this.elicitations;
      this.renderElicitations();
    } catch (error) {
      console.error('Failed to load elicitations:', error);
      showToast(error.message || 'Failed to load elicitations', 'error');
      // Initialize with empty arrays to prevent .filter() errors
      this.elicitations = [];
      this.filteredElicitations = [];
      this.showEmptyState();
    }
  }

  applyFilters() {
    const method = document.getElementById('filterMethod').value;
    const search = document.getElementById('searchElicitation').value.toLowerCase();

    // Ensure elicitations is always an array
    if (!Array.isArray(this.elicitations)) {
      this.elicitations = [];
    }

    this.filteredElicitations = this.elicitations.filter(item => {
      const methodMatch = !method || item.method === method;
      const searchMatch = !search || 
        item.id?.toLowerCase().includes(search) ||
        item.stakeholder?.toLowerCase().includes(search);
      return methodMatch && searchMatch;
    });

    this.renderElicitations();
  }

  renderElicitations() {
    const tableBody = document.getElementById('elicitationTableBody');
    const emptyState = document.getElementById('emptyElicitation');

    if (this.filteredElicitations.length === 0) {
      this.showEmptyState();
      return;
    }

    emptyState.classList.add('hidden');
    tableBody.innerHTML = this.filteredElicitations.map(item => `
      <tr>
        <td>${item.id || 'N/A'}</td>
        <td><span class="badge">${item.method || 'N/A'}</span></td>
        <td>${item.stakeholder || 'N/A'}</td>
        <td>${new Date(item.date).toLocaleDateString() || 'N/A'}</td>
        <td><span class="status-badge status-${item.status || 'pending'}">${item.status || 'Pending'}</span></td>
        <td>
          <button class="btn btn-sm btn-primary" data-id="${item.id}" onclick="window.app.getStore().setCurrentElicitation('${item.id}')">View</button>
          <button class="btn btn-sm btn-danger" data-id="${item.id}">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  showEmptyState() {
    document.getElementById('emptyElicitation')?.classList.remove('hidden');
    document.getElementById('elicitationTableBody').innerHTML = '';
  }

  openCreateModal() {
    showToast('Create elicitation feature coming soon', 'info');
  }
}
