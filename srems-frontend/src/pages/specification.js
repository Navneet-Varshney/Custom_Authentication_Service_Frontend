import { requirementsService } from '../js/services/requirements.service.js';
import { scopeService } from '../js/services/scope.service.js';
import { projectsService } from '../js/services/projects.service.js';
import { store } from '../js/store/store.js';
import { showToast, formatDate } from '../js/utils/helpers.js';

export class SpecificationPage {
  constructor() {
    this.project = null;
    this.requirements = [];
    this.scopeItems = [];
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.loadSpecification();
  }

  attachEventListeners() {
    document.getElementById('btnExportSRS')?.addEventListener('click', () => this.exportPDF());
    document.getElementById('btnPrintSRS')?.addEventListener('click', () => window.print());
  }

  async loadSpecification() {
    try {
      // Get current project from store or localStorage
      let projectId = store.state.projects.current?._id || 
                     store.state.projects.current?.id || 
                     store.state.projects.current;
      
      if (!projectId) {
        const savedProject = localStorage.getItem('CURRENT_PROJECT');
        if (savedProject) {
          try {
            const projectData = typeof savedProject === 'string' ? JSON.parse(savedProject) : savedProject;
            projectId = projectData?._id || projectData?.id || projectData;
            store.state.projects.current = projectData;
          } catch (e) {
            console.error('Failed to parse saved project:', e);
          }
        }
      }

      if (!projectId) {
        showToast('Please select a project', 'warning');
        return;
      }

      // Load all data
      this.project = await projectsService.getProjectById(projectId);
      this.requirements = await requirementsService.getRequirements(projectId);
      this.scopeItems = await scopeService.getScopesByProject(projectId);

      this.renderSRS();
    } catch (error) {
      showToast(error.message || 'Failed to load specification', 'error');
    }
  }

  renderSRS() {
    // Title page
    const now = new Date();
    document.getElementById('srsProjectName').textContent = this.project?.name || '—';
    document.getElementById('srsVersion').textContent = this.project?.version || '1.0';
    document.getElementById('srsDate').textContent = formatDate(now);
    document.getElementById('srsStatus').textContent = this.project?.currentPhase || 'Draft';
    document.getElementById('srsCreated').textContent = formatDate(this.project?.createdAt) || '—';
    document.getElementById('srsUpdated').textContent = formatDate(this.project?.updatedAt) || '—';
    document.getElementById('srsStakeholders').textContent = this.project?.stakeholderCount || '0';

    // Functional requirements
    const functionalReqs = this.requirements.filter(r => r.type === 'functional');
    document.getElementById('functionalReqs').innerHTML = functionalReqs.length === 0
      ? '<p>No functional requirements defined</p>'
      : functionalReqs.map(r => this.createRequirementClause(r)).join('');

    // Non-functional requirements
    const nonFunctionalReqs = this.requirements.filter(r => r.type === 'non-functional');
    document.getElementById('nonFunctionalReqs').innerHTML = nonFunctionalReqs.length === 0
      ? '<p>No non-functional requirements defined</p>'
      : nonFunctionalReqs.map(r => this.createRequirementClause(r)).join('');

    // Scope
    const inScope = this.scopeItems.filter(s => s.type === 'included');
    const outOfScope = this.scopeItems.filter(s => s.type === 'excluded');

    document.getElementById('inScopeItems').innerHTML = inScope.length === 0
      ? '<li>—</li>'
      : inScope.map(s => `<li>${s.description}</li>`).join('');

    document.getElementById('outOfScopeItems').innerHTML = outOfScope.length === 0
      ? '<li>—</li>'
      : outOfScope.map(s => `<li>${s.description}</li>`).join('');

    // Acceptance criteria
    const withCriteria = this.requirements.filter(r => r.elaborationDetails?.acceptanceCriteria);
    document.getElementById('acceptanceCriteria').innerHTML = withCriteria.length === 0
      ? '<p>No acceptance criteria defined</p>'
      : withCriteria.map(r => `
          <div class="acceptance-item">
            <h4>${r.description}</h4>
            <pre>${r.elaborationDetails.acceptanceCriteria}</pre>
          </div>
        `).join('');
  }

  createRequirementClause(req) {
    return `
      <div class="requirement-clause">
        <h3>${req.description}</h3>
        <table class="requirement-details">
          <tr>
            <td><strong>Requirement ID:</strong></td>
            <td>${req._id.substring(0, 8)}</td>
          </tr>
          <tr>
            <td><strong>Priority:</strong></td>
            <td>${req.priority}</td>
          </tr>
          <tr>
            <td><strong>Category:</strong></td>
            <td>${req.category || '—'}</td>
          </tr>
          ${req.elaborationDetails?.acceptanceCriteria ? `
          <tr>
            <td><strong>Acceptance Criteria:</strong></td>
            <td><pre>${req.elaborationDetails.acceptanceCriteria}</pre></td>
          </tr>
          ` : ''}
          ${req.elaborationDetails?.dependencies ? `
          <tr>
            <td><strong>Dependencies:</strong></td>
            <td>${req.elaborationDetails.dependencies}</td>
          </tr>
          ` : ''}
          ${req.elaborationDetails?.effort ? `
          <tr>
            <td><strong>Estimated Effort:</strong></td>
            <td>${req.elaborationDetails.effort} hours</td>
          </tr>
          ` : ''}
        </table>
      </div>
    `;
  }

  exportPDF() {
    // In a real app, integrate with a PDF library like jsPDF or html2pdf
    showToast('PDF export functionality would be integrated here', 'info');
    // window.print(); could be used as fallback
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SpecificationPage();
  });
} else {
  new SpecificationPage();
}
