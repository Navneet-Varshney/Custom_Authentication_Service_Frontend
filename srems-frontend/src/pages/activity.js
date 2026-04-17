import { store } from '../js/store/store.js';
import { showToast, formatDate, debounce } from '../js/utils/helpers.js';
import activityTrackerService from '../js/services/activity-tracker.service.js';

export class ActivityPage {
  constructor() {
    this.activities = [];
    this.filteredActivities = [];
    this.pagination = { page: 1, limit: 20, total: 0, totalPages: 0 };
    this.currentPage = 1;
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.loadActivities();
  }

  attachEventListeners() {
    document.getElementById('btnExportActivity')?.addEventListener('click', () => this.exportActivity());
    document.getElementById('btnNextPage')?.addEventListener('click', () => this.loadNextPage());
    document.getElementById('btnPrevPage')?.addEventListener('click', () => this.loadPrevPage());
    document.getElementById('filterActivityType')?.addEventListener('change', () => {
      console.log('🔽 [ACTIVITY] Filter changed');
      this.currentPage = 1;
      this.applyFilters();
      this.renderActivities();
    });
    document.getElementById('searchActivity')?.addEventListener('input', debounce(() => {
      console.log('🔍 [ACTIVITY] Search input detected');
      this.currentPage = 1;
      this.applyFilters();
      this.renderActivities();
    }, 300));
  }

  async loadActivities() {
    try {
      const container = document.getElementById('activityContainer');
      if (container) {
        container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading activities...</p></div>';
      }

      console.log('📋 [ACTIVITY] Loading MY activities, page:', this.currentPage);

      // Call service to get current user's activity
      const response = await activityTrackerService.getMyActivity(this.currentPage, 20);
      
      console.log('📦 [ACTIVITY] Response:', response);

      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to fetch activities');
      }

      // Parse backend response - handle both single and double-nested data structure
      let rawActivities = [];
      if (response?.data?.data?.activities && Array.isArray(response.data.data.activities)) {
        rawActivities = response.data.data.activities;
        console.log('✅ [ACTIVITY] Found activities in response.data.data.activities:', rawActivities.length);
      } else if (response?.data?.activities && Array.isArray(response.data.activities)) {
        rawActivities = response.data.activities;
        console.log('✅ [ACTIVITY] Found activities in response.data.activities:', rawActivities.length);
      } else if (Array.isArray(response?.data)) {
        rawActivities = response.data;
        console.log('✅ [ACTIVITY] Found activities as direct array:', rawActivities.length);
      } else {
        console.warn('⚠️ [ACTIVITY] Could not find activities in response structure');
      }
      
      // Parse pagination - handle both locations
      this.pagination = response?.data?.data?.pagination || 
                        response?.data?.pagination || 
                        { page: 1, limit: 20, total: 0, totalPages: 0 };

      console.log('✅ [ACTIVITY] Loaded', rawActivities.length, 'activities, total:', this.pagination.total);

      // Map backend fields to display format
      this.activities = rawActivities.map(activity => this.mapBackendActivity(activity));

      // Apply filters
      this.applyFilters();
      this.renderActivities();
      this.updatePagination();

    } catch (error) {
      console.error('❌ [ACTIVITY] Error:', error);
      showToast(error.message || 'Failed to load activities', 'error');
      const container = document.getElementById('activityContainer');
      if (container) {
        container.innerHTML = `<div class="error-message" style="padding: 20px; color: #d00;">${error.message || 'Failed to load activities'}</div>`;
      }
    }
  }

  mapBackendActivity(activity) {
    // Convert backend ActivityTrackerModel to frontend display format
    return {
      _id: activity._id,
      eventType: activity.eventType,
      description: activity.description,
      userId: activity.userId,
      userType: activity.userType,
      deviceName: activity.deviceName || 'Unknown',
      createdAt: activity.createdAt,
      oldData: activity.oldData,
      newData: activity.newData,
      
      // display shortcuts
      type: this.getActivityType(activity.eventType),
      user: activity.userType ? `${activity.userType} (${activity.userId})` : activity.userId,
      timestamp: new Date(activity.createdAt),
      changes: activity.oldData && activity.newData ? { before: activity.oldData, after: activity.newData } : {}
    };
  }

  getActivityType(eventType) {
    const types = {
      'CREATE_PROJECT': 'create',
      'UPDATE_PROJECT': 'update',
      'DELETE_PROJECT': 'delete',
      'CREATE_INCEPTION': 'create',
      'UPDATE_INCEPTION': 'update',
      'CREATE_COMMENT': 'comment',
    };
    return types[eventType] || (eventType.includes('CREATE') ? 'create' : eventType.includes('DELETE') ? 'delete' : 'update');
  }

  applyFilters() {
    const typeFilter = document.getElementById('filterActivityType')?.value || '';
    const searchFilter = (document.getElementById('searchActivity')?.value || '').toLowerCase();

    this.filteredActivities = this.activities.filter(activity => {
      const typeMatch = !typeFilter || activity.eventType === typeFilter;
      const searchMatch = !searchFilter || 
        (activity.description || '').toLowerCase().includes(searchFilter) ||
        (activity.user || '').toLowerCase().includes(searchFilter) ||
        (activity.eventType || '').toLowerCase().includes(searchFilter);

      return typeMatch && searchMatch;
    });

    console.log('🔍 [ACTIVITY] Filtered to', this.filteredActivities.length, 'of', this.activities.length);
  }

  renderActivities() {
    const container = document.getElementById('activityContainer');
    const empty = document.getElementById('emptyActivity');

    if (this.filteredActivities.length === 0) {
      if (container) container.classList.add('hidden');
      if (empty) empty.classList.remove('hidden');
      return;
    }

    if (container) container.classList.remove('hidden');
    if (empty) empty.classList.add('hidden');

    const grouped = this.groupActivitiesByDate(this.filteredActivities);
    if (container) {
      container.innerHTML = Object.entries(grouped)
        .map(([date, activities]) => this.createDateGroup(date, activities))
        .join('');
    }
  }

  groupActivitiesByDate(activities) {
    const groups = {};
    activities.forEach(activity => {
      const date = formatDate(activity.timestamp).split(' ')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(activity);
    });
    return groups;
  }

  createDateGroup(date, activities) {
    return `
      <div class="activity-date-group" style="margin-bottom: 20px;">
        <h3 class="date-header" style="color: #333; font-size: 14px; font-weight: bold; margin-bottom: 10px;">📅 ${date}</h3>
        <div class="activities-list" style="border-left: 3px solid #ddd; padding-left: 15px;">
          ${activities.map(activity => this.createActivityItem(activity)).join('')}
        </div>
      </div>
    `;
  }

  createActivityItem(activity) {
    const icon = this.getActivityIcon(activity.type);
    const color = this.getActivityColor(activity.type);
    const time = formatDate(activity.timestamp).split(' ')[1] || 'N/A';
    const eventDesc = this.getEventDescription(activity.eventType);

    return `
      <div class="activity-item" data-activity-id="${activity._id}" style="display: flex; gap: 12px; margin-bottom: 15px; padding: 10px; background: #f9f9f9; border-radius: 4px;">
        <div class="activity-icon" style="background: ${color}; color: white; display: flex; align-items: center; justify-content: center; border-radius: 50%; width: 40px; height: 40px; flex-shrink: 0; font-size: 18px;">
          ${icon}
        </div>
        <div class="activity-content" style="flex: 1;">
          <div class="activity-header" style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <h4 class="activity-title" style="margin: 0; color: #333;">
              <strong>${eventDesc}</strong>
            </h4>
            <span class="activity-time" style="color: #999; font-size: 12px;">${time}</span>
          </div>
          <p style="margin: 4px 0; color: #666; font-size: 13px;">${activity.description}</p>
          <div class="activity-meta" style="display: flex; gap: 15px; font-size: 12px; color: #888; margin-top: 6px;">
            <span>👤 ${activity.user}</span>
            <span>🖥️ ${activity.deviceName}</span>
            <span>📌 ${activity.eventType}</span>
          </div>
          ${Object.keys(activity.changes).length > 0 ? `
            <details style="margin-top: 8px; font-size: 12px;">
              <summary style="cursor: pointer; color: #0069d9;">View Changes</summary>
              <pre style="margin: 6px 0; padding: 8px; background: #fff; border: 1px solid #ddd; border-radius: 3px; overflow: auto; max-height: 150px; font-size: 11px;">${JSON.stringify(activity.changes, null, 2)}</pre>
            </details>
          ` : ''}
        </div>
      </div>
    `;
  }

  getEventDescription(eventType) {
    const map = {
      'CREATE_PROJECT': '✅ Project Created',
      'UPDATE_PROJECT': '✏️ Project Updated',
      'DELETE_PROJECT': '🗑️ Project Deleted',
      'ACTIVATE_PROJECT': '🔄 Project Activated',
      'CREATE_INCEPTION': '✅ Inception Created',
      'UPDATE_INCEPTION': '✏️ Inception Updated',
      'DELETE_INCEPTION': '🗑️ Inception Deleted',
      'CREATE_STAKEHOLDER': '👤 Stakeholder Added',
      'CREATE_COMMENT': '💬 Comment Added',
      'UPDATE_COMMENT': '✏️ Comment Updated',
      'DELETE_COMMENT': '🗑️ Comment Deleted',
    };
    return map[eventType] || eventType;
  }

  getActivityIcon(type) {
    const icons = {
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      comment: '💬',
      approve: '✓',
      reject: '✗',
      'status-change': '🔄',
      other: '📝'
    };
    return icons[type] || '📝';
  }

  getActivityColor(type) {
    const colors = {
      create: '#28a745',
      update: '#0069d9',
      delete: '#dc3545',
      comment: '#17a2b8',
      approve: '#20c997',
      reject: '#ff6b6b',
      'status-change': '#ffc107',
      other: '#6c757d'
    };
    return colors[type] || '#6c757d';
  }

  updatePagination() {
    const btnPrev = document.getElementById('btnPrevPage');
    const btnNext = document.getElementById('btnNextPage');
    const pageInfo = document.getElementById('pageInfo');

    if (btnPrev) {
      btnPrev.disabled = this.currentPage <= 1;
      btnPrev.style.opacity = this.currentPage <= 1 ? '0.5' : '1';
    }
    if (btnNext) {
      btnNext.disabled = this.currentPage >= this.pagination.totalPages;
      btnNext.style.opacity = this.currentPage >= this.pagination.totalPages ? '0.5' : '1';
    }
    if (pageInfo) {
      pageInfo.textContent = `Page ${this.currentPage} of ${this.pagination.totalPages} (Total: ${this.pagination.total})`;
    }
  }

  loadNextPage() {
    if (this.currentPage < this.pagination.totalPages) {
      this.currentPage++;
      this.loadActivities();
    }
  }

  loadPrevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadActivities();
    }
  }

  exportActivity() {
    if (this.filteredActivities.length === 0) {
      showToast('No activities to export', 'warning');
      return;
    }

    const headers = ['Date', 'Time', 'Event Type', 'Description', 'User', 'Device', 'User Type'];
    const rows = this.filteredActivities.map(activity => [
      formatDate(activity.timestamp).split(' ')[0],
      formatDate(activity.timestamp).split(' ')[1] || 'N/A',
      activity.eventType,
      activity.description,
      activity.user,
      activity.deviceName,
      activity.userType || 'N/A'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('✅ Activity log exported', 'success');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ActivityPage();
  });
} else {
  new ActivityPage();
}
