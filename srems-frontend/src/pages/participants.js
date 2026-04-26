import { participantsService } from '../js/services/participants.service.js';
import { ENTITY_TYPES, PARTICIPANT_TYPES } from '../js/utils/constants.js';

/**
 * Participants Page Controller
 * 
 * IMPORTANT: This page links EXISTING users to meetings
 * It does NOT create new participant profiles
 * Backend expects: userId (USR-prefixed like "USR1100000")
 */
class ParticipantsPage {
  constructor() {
    this.participants = [];
    this.filteredParticipants = [];
    this.editingParticipantId = null;
    this.entityType = 'inceptions';  // Default (PLURAL form for backend API)
    this.meetingId = null;
    this.init();
  }

  async init() {
    setTimeout(() => {
      this.setupEventListeners();
      this.loadParticipants();
    }, 50);
  }

  setupEventListeners() {
    // Ensure modal is hidden on init
    const modal = document.getElementById('participantModal');
    if (modal) {
      modal.classList.remove('show');
    }

    // Add participant button
    const createBtn = document.getElementById('createParticipantBtn') || document.getElementById('newParticipantBtn');
    if (createBtn) {
      createBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openParticipantModal();
      });
    }

    // Form submission
    const form = document.getElementById('participantForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveParticipant();
      });
    }

    // Modal close buttons
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

    // Search and filters
    const searchBox = document.getElementById('searchParticipants');
    if (searchBox) {
      searchBox.addEventListener('input', () => {
        this.filterParticipants();
      });
    }
  }

  async loadParticipants() {
    try {
      // Get meetingId from URL or state - MUST be a specific meeting ID
      let meetingId = localStorage.getItem('CURRENT_MEETING');
      this.meetingId = meetingId;

      // If no meeting ID, show empty state
      if (!meetingId) {
        console.log('ℹ️ No meeting selected - participants list is empty');
        this.participants = [];
        this.renderParticipants();
        return;
      }

      console.log(`👥 Loading participants for entityType=${this.entityType}, meetingId=${meetingId}`);

      // Call service with entityType and meetingId
      // Service returns array directly (handles response wrapper internally)
      const participants = await participantsService.listParticipants(this.entityType, meetingId);
      this.participants = Array.isArray(participants) ? participants : [];
      
      this.filterParticipants();
      this.renderParticipants();
    } catch (error) {
      console.error('Failed to load participants:', error);
      this.participants = [];
      this.renderParticipants();
    }
  }

  filterParticipants() {
    const search = document.getElementById('searchParticipants')?.value?.toLowerCase() || '';

    this.filteredParticipants = this.participants.filter(participant => {
      // Search by userId, roleDescription, or any user info
      const matchesSearch = !search || 
        (participant.userId?.toLowerCase().includes(search)) ||
        (participant.roleDescription?.toLowerCase().includes(search)) ||
        (participant.userName?.toLowerCase().includes(search));
      
      return matchesSearch;
    });

    this.renderParticipants();
  }

  renderParticipants() {
    const tbody = document.getElementById('participantsBody');
    if (!tbody) return;

    if (!Array.isArray(this.filteredParticipants) || this.filteredParticipants.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center;">
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
        <td><strong>${participant.userId}</strong></td>
        <td>${participant.userName || 'N/A'}</td>
        <td>
          <span class="badge badge-secondary">${participant.roleDescription || 'Participant'}</span>
        </td>
        <td>${new Date(participant.createdAt).toLocaleDateString()}</td>
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
        document.getElementById('participantUserId').value = participant.userId || '';
        document.getElementById('participantRoleDescription').value = participant.roleDescription || '';
      }
    } else {
      // Create mode
      document.getElementById('modalTitle').textContent = 'Add Participant';
      form.reset();
    }

    modal.classList.add('show');
  }

  closeParticipantModal() {
    const modal = document.getElementById('participantModal');
    modal.classList.remove('show');
    this.editingParticipantId = null;
    document.getElementById('participantForm').reset();
  }

  async saveParticipant() {
    try {
      const userIdVal = document.getElementById('participantUserId')?.value?.trim();
      const roleDescriptionVal = document.getElementById('participantRoleDescription')?.value?.trim();

      // Backend REQUIRES userId (USR-prefixed like "USR1100000")
      if (!userIdVal) {
        alert('User ID is required (e.g., USR1100000)');
        return;
      }

      if (!this.meetingId) {
        alert('No meeting selected');
        return;
      }

      const participantData = {
        userId: userIdVal,
        ...(roleDescriptionVal && { roleDescription: roleDescriptionVal })
      };

      let response;
      if (this.editingParticipantId) {
        // UPDATE participant
        response = await participantsService.updateParticipant(
          this.entityType,
          this.editingParticipantId,
          participantData
        );
        console.log('✅ Participant updated:', response);
        alert('Participant updated successfully!');
      } else {
        // ADD participant to meeting
        response = await participantsService.addParticipant(
          this.entityType,
          this.meetingId,
          participantData
        );
        console.log('✅ Participant added:', response);
        alert('Participant added successfully!');
      }

      this.closeParticipantModal();
      await this.loadParticipants();
    } catch (error) {
      console.error('Failed to save participant:', error);
      alert(`Failed to save participant: ${error.message}`);
    }
  }

  async editParticipant(participantId) {
    this.openParticipantModal(participantId);
  }

  async deleteParticipant(participantId) {
    if (confirm('Are you sure you want to remove this participant?')) {
      try {
        await participantsService.removeParticipant(this.entityType, participantId);
        alert('Participant removed successfully!');
        await this.loadParticipants();
      } catch (error) {
        console.error('Failed to delete:', error);
        alert('Failed to remove participant');
      }
    }
  }
}

// Initialize page
const participantsPage = new ParticipantsPage();
window.participantsPage = participantsPage;

export { ParticipantsPage };
