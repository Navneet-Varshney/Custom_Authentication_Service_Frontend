import { projectsService } from '../js/services/projects.service.js';
import { activityTrackerService } from '../js/services/activity-tracker.service.js';
import { requirementsService } from '../js/services/requirements.service.js';
import { showToast, formatDate } from '../js/utils/helpers.js';

export class DashboardPage {
  constructor() {
    this.projects = [];
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.animateStatCounters();
    this.loadDashboardData();
  }

  attachEventListeners() {
    document.getElementById('btnNewProject')?.addEventListener('click', () => {
      window.location.hash = '#/projects';
    });
  }

  /**
   * Animate stat counters from 0 to target value
   */
  animateStatCounters() {
    const counters = document.querySelectorAll('.stat-hero-value');
    
    counters.forEach(counter => {
      const targetValue = parseInt(counter.getAttribute('data-count'), 10);
      if (!isNaN(targetValue)) {
        this.animateCounter(counter, 0, targetValue, 1500);
      }
    });
  }

  /**
   * Animate a counter with easing function
   */
  animateCounter(element, start, end, duration) {
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function: ease-out-quart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (end - start) * easeProgress);
      
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  async loadDashboardData() {
    try {
      // Load projects
      const data = await projectsService.getProjects();
      this.projects = Array.isArray(data) ? data : [];
      this.renderMetrics();
      this.renderRecentProjects();
      await this.renderRecentActivity();
    } catch (error) {
      showToast(error.message || 'Failed to load dashboard data', 'error');
      // Initialize with empty array to prevent .filter/.reduce errors
      this.projects = [];
      this.renderMetrics();
    }
  }

  renderMetrics() {
    const isCompleted = (p) => {
      const status = (p.status || p.projectStatus || '').toUpperCase();
      return status === 'COMPLETED';
    };

    const activeProjects = this.projects.filter(p => !isCompleted(p)).length;
    const totalRequirements = this.projects.reduce((sum, p) => sum + (p.requirementCount || p.requirementsCount || 0), 0);
    const completedProjects = this.projects.filter(p => isCompleted(p)).length;
    const completionRate = this.projects.length > 0 ? Math.round((completedProjects / this.projects.length) * 100) : 0;
    const teamMembers = new Set(this.projects.flatMap(p => p.stakeholders || [])).size;

    const elActive = document.getElementById('activeProjects');
    const elReqs = document.getElementById('totalRequirements');
    const elRate = document.getElementById('completionRate');
    const elTeam = document.getElementById('teamMembers');

    if (elActive) elActive.textContent = activeProjects;
    if (elReqs) elReqs.textContent = totalRequirements;
    if (elRate) elRate.textContent = completionRate + '%';
    if (elTeam) elTeam.textContent = teamMembers;
  }

  renderRecentProjects() {
    const container = document.getElementById('recentProjectsList');
    if (!container) return;

    const recent = this.projects.slice(0, 3);

    if (recent.length === 0) {
      container.innerHTML = '<p class="empty-message">No projects yet. Create one to get started!</p>';
      return;
    }

    container.innerHTML = recent.map(p => {
      const projectId = p._id || p.id || p.projectId;
      const projectName = p.projectName || p.name || 'Untitled Project';
      const phase = p.currentPhase || p.phase || 'INCEPTION';
      return `
        <a href="#/projects/${projectId}" class="project-mini-card">
          <h4>${projectName}</h4>
          <p class="text-muted">${p.description?.substring(0, 60) || 'No description'}</p>
          <div class="card-footer">
            <span class="badge">${phase}</span>
            <span class="text-sm">${formatDate(p.createdAt)}</span>
          </div>
        </a>
      `;
    }).join('');
  }

  async renderRecentActivity() {
    const container = document.getElementById('recentActivityList');

    let activities = [];
    try {
      const response = await activityTrackerService.getMyActivity(1, 3);
      activities = response?.data?.activities || [];
    } catch (error) {
      console.error('Failed to load recent activity:', error);
      activities = [];
    }

    if (activities.length === 0) {
      container.innerHTML = '<p class="empty-message">No recent activity</p>';
      return;
    }

    container.innerHTML = activities.map(activity => `
      <div class="activity-feed-item">
        <div class="activity-icon">${this.getIcon(activity.type)}</div>
        <div class="activity-text">
          <p><strong>${activity.user?.name || activity.user?.fullName || 'You'}</strong> ${activity.message || activity.description || 'Updated an item'}</p>
          <span class="text-muted">${activity.createdAt ? formatDate(activity.createdAt) : (activity.time || '')}</span>
        </div>
      </div>
    `).join('');
  }

  getIcon(type) {
    const icons = { create: '➕', update: '✏️', delete: '🗑️', approve: '✓' };
    return icons[type] || '📝';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new DashboardPage();
  });
} else {
  new DashboardPage();
}
