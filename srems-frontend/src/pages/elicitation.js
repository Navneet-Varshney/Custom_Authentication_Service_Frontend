import { showToast, debounce, showConfirmDialog } from '../js/utils/helpers.js';
import elicitationService from '../js/services/elicitation.service.js';
import { store } from '../js/store/store.js';

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
      // Get projectId from store or localStorage with fallback
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
        this.elicitations = [];
        this.filteredElicitations = [];
        this.showEmptyState();
        return;
      }

      const tableBody = document.getElementById('elicitationTableBody');
      tableBody.innerHTML = '<tr class="loading"><td colspan="6"><div class="loading-spinner"><div class="spinner"></div><p>Loading...</p></div></td></tr>';

      // ✅ TRY TO LOAD EXISTING ELICITATION FIRST
      console.log('🔍 Checking for existing elicitation...');
      const existingElicitation = await elicitationService.getLatestElicitation(currentProjectId);
      
      if (existingElicitation) {
        console.log('✅ Found existing elicitation:', existingElicitation);
        this.elicitations = [existingElicitation];
        this.filteredElicitations = [existingElicitation];
        this.renderElicitations();
        showToast('Elicitation loaded successfully', 'success');
        return;
      }

      // If no existing elicitation, show empty state
      console.log('ℹ️ No existing elicitation found');
      this.elicitations = [];
      this.filteredElicitations = [];
      this.showEmptyState();
      
    } catch (error) {
      console.error('Failed to load elicitations:', error);
      showToast(error.message || 'Failed to load elicitations', 'error');
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
    tableBody.innerHTML = this.filteredElicitations.map(item => {
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
        method: item.method || 'N/A',
        stakeholder: item.stakeholder || 'N/A',
        date: createdDate,
        status: item.isFrozen ? 'Frozen' : (item.isDeleted ? 'Deleted' : 'Active')
      };

      return `
        <tr>
          <td>${displayItem.id}</td>
          <td><span class="badge">${displayItem.method}</span></td>
          <td>${displayItem.stakeholder}</td>
          <td>${displayItem.date}</td>
          <td><span class="status-badge status-${displayItem.status.toLowerCase()}">${displayItem.status}</span></td>
          <td>
            <button class="btn btn-sm btn-primary btnViewElicitation" data-id="${displayItem.id}">View</button>
            <button class="btn btn-sm btn-danger btnDeleteElicitation" data-id="${displayItem.id}">Delete</button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach event listeners to buttons
    this.attachRenderEventListeners();
  }

  attachRenderEventListeners() {
    // View buttons
    document.querySelectorAll('.btnViewElicitation')?.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        console.log('View elicitation:', id);
        // TODO: Open detail view
      });
    });

    // Delete buttons
    document.querySelectorAll('.btnDeleteElicitation')?.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        console.log('Delete elicitation:', id);
        const confirmed = await showConfirmDialog('Delete Elicitation', 'This action cannot be undone. Are you sure?');
        if (confirmed) {
          try {
            await elicitationService.deleteElicitation(store.state.projects.current?._id, id);
            showToast('Elicitation deleted successfully', 'success');
            await this.loadElicitations();
          } catch (error) {
            showToast(error.message || 'Failed to delete elicitation', 'error');
          }
        }
      });
    });
  }

  showEmptyState() {
    document.getElementById('emptyElicitation')?.classList.remove('hidden');
    document.getElementById('elicitationTableBody').innerHTML = '';
  }

  openCreateModal() {
    showToast('Create elicitation feature coming soon', 'info');
  }
}
