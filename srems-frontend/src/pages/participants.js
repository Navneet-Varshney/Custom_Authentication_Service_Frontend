import { participantsService } from '../js/services/participants.service.js';

/**
 * Participants Page Controller
 */
class ParticipantsPage {
  constructor() {
    this.participants = [];
    this.filteredParticipants = [];
    this.editingParticipantId = null;
  }

  async init() {
    this.setupEventListeners();
    await this.loadParticipants();
  }

  setupEventListeners() {
    const createBtn = document.getElementById('createParticipantBtn') || document.getElementById('newParticipantBtn');
    if (createBtn) {
      createBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openParticipantModal();
      });
    }

    const emptyCreateBtn = document.getElementById('emptyCreateBtn');
    if (emptyCreateBtn) {
      emptyCreateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openParticipantModal();
      });
    }

    const form = document.getElementById('participantForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveParticipant();
      });
    }

    const cancelBtn = document.getElementById('cancelParticipantBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.closeParticipantModal();
      });
    }

    const closeBtn = document.getElementById('closeParticipantModal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeParticipantModal();
      });
    }

    const searchBox = document.getElementById('searchParticipants');
    if (searchBox) {
      searchBox.addEventListener('input', () => {
        this.filterParticipants();
      });
    }

    const roleFilter = document.getElementById('filterRole');
    if (roleFilter) {
      roleFilter.addEventListener('change', () => {
        this.filterParticipants();
      });
    }

    const statusFilter = document.getElementById('filterStatus');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => {
        this.filterParticipants();
      });
    }
  }

  async loadParticipants() {
    try {
      const response = await participantsService.listParticipants();
      this.participants = response.data || [];
      this.filterParticipants();
      this.renderParticipants();
    } catch (error) {
      console.error('Failed to load participants:', error);
      this.participants = [];
      this.renderParticipants();
    }
  }

  filterParticipants() {
    const search = document.getElementById('searchParticipants').value.toLowerCase();
    const roleFilter = document.getElementById('filterRole').value;
    const statusFilter = document.getElementById('filterStatus').value;

    this.filteredParticipants = this.participants.filter(participant => {
      const fullName = `${participant.firstName || ''} ${participant.lastName || ''}`.toLowerCase();
      const matchesSearch = !search || 
        fullName.includes(search) ||
        participant.email?.toLowerCase().includes(search) ||
        participant.department?.toLowerCase().includes(search);
      
      const matchesRole = !roleFilter || participant.role === roleFilter;
      const matchesStatus = !statusFilter || 
        (statusFilter === 'ACTIVE' ? participant.isActive : 
         statusFilter === 'INACTIVE' ? !participant.isActive : 
         true);

      return matchesSearch && matchesRole && matchesStatus;
    });

    this.renderParticipants();
  }

  renderParticipants() {
    const tbody = document.getElementById('participantsBody');

    if (!Array.isArray(this.filteredParticipants) || this.filteredParticipants.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center;">
            <div class="empty-state">
              <div class="empty-icon">👥</div>
              <h3>No Participants</h3>
              <p>No participants added yet. Click "Add Participant" to add one.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.filteredParticipants.map(participant => `
      <tr>
        <td>
          <strong>${participant.firstName || ''} ${participant.lastName || ''}</strong>
        </td>
        <td>${participant.email || 'N/A'}</td>
        <td>
          <span class="badge badge-secondary">${participant.role || 'Other'}</span>
        </td>
        <td>${participant.department || '—'}</td>
        <td>
          <span class="status-badge ${participant.isActive ? 'active' : 'inactive'}">
            ${participant.isActive ? '✓ Active' : '✗ Inactive'}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-sm btn-secondary" onclick="window.participantsPage.editParticipant('${participant._id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="window.participantsPage.deleteParticipant('${participant._id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  openParticipantModal(participantId = null) {
    this.editingParticipantId = participantId;
    const modal = document.getElementById('participantModal');
    const form = document.getElementById('participantForm');

    if (participantId) {
      // Edit mode
      document.getElementById('modalTitle').textContent = 'Edit Participant';
      const participant = this.participants.find(p => p._id === participantId);
      if (participant) {
        document.getElementById('participantFirstName').value = participant.firstName || '';
        document.getElementById('participantLastName').value = participant.lastName || '';
        document.getElementById('participantEmail').value = participant.email || '';
        document.getElementById('participantRole').value = participant.role || '';
        document.getElementById('participantDepartment').value = participant.department || '';
        document.getElementById('participantPhone').value = participant.phone || '';
        document.getElementById('participantExpertise').value = (participant.expertise || []).join(', ');
        document.getElementById('participantIsActive').checked = participant.isActive !== false;
      }
    } else {
      // Create mode
      document.getElementById('modalTitle').textContent = 'Add Participant';
      form.reset();
      document.getElementById('participantIsActive').checked = true;
    }

    modal.style.display = 'flex';
  }

  closeParticipantModal() {
    const modal = document.getElementById('participantModal');
    modal.style.display = 'none';
    this.editingParticipantId = null;
    document.getElementById('participantForm').reset();
  }

  async saveParticipant() {
    try {
      const participantData = {
        firstName: document.getElementById('participantFirstName').value,
        lastName: document.getElementById('participantLastName').value,
        email: document.getElementById('participantEmail').value,
        role: document.getElementById('participantRole').value,
        department: document.getElementById('participantDepartment').value,
        phone: document.getElementById('participantPhone').value,
        expertise: document.getElementById('participantExpertise').value
          .split(',')
          .map(e => e.trim())
          .filter(e => e),
        isActive: document.getElementById('participantIsActive').checked
      };

      let response;
      if (this.editingParticipantId) {
        response = await participantsService.updateParticipant(
          this.editingParticipantId, 
          participantData
        );
        alert('Participant updated successfully!');
      } else {
        response = await participantsService.addParticipant(participantData);
        alert('Participant added successfully!');
      }

      this.closeParticipantModal();
      await this.loadParticipants();
    } catch (error) {
      console.error('Failed to save participant:', error);
      alert('Failed to save participant');
    }
  }

  async editParticipant(participantId) {
    this.openParticipantModal(participantId);
  }

  async deleteParticipant(participantId) {
    if (confirm('Are you sure you want to delete this participant?')) {
      try {
        await participantsService.removeParticipant(participantId);
        alert('Participant deleted successfully!');
        await this.loadParticipants();
      } catch (error) {
        console.error('Failed to delete:', error);
        alert('Failed to delete participant');
      }
    }
  }
}

// Initialize page
const participantsPage = new ParticipantsPage();
window.participantsPage = participantsPage;
participantsPage.init();

export { ParticipantsPage };
