import { participantsService } from '../js/services/participants.service.js';
import { meetingsService } from '../js/services/meetings.service.js';
import { store } from '../js/store/store.js';
import { ENTITY_TYPES, PARTICIPANT_TYPES } from '../js/utils/constants.js';

/**
 * Meeting Detail Page Controller
 * 
 * Displays meeting details and manages participants for a specific meeting
 * Features:
 * - View meeting details (title, platform, scheduled time, etc.)
 * - List meeting participants
 * - Add new participant to meeting (requires FACILITATOR or OWNER role)
 * - Remove participant from meeting
 * - Update participant role description
 * 
 * IMPORTANT:
 * - meetingId MUST be passed via URL hash or localStorage
 * - entityType MUST be PLURAL (inceptions, elicitations, etc.)
 * - Only FACILITATOR or PROJECT_OWNER can add/remove/update participants
 */
class MeetingDetailPage {
  constructor() {
    this.meeting = null;
    this.participants = [];
    this.entityType = 'inceptions';  // Default, will be determined from meeting
    this.meetingId = null;
    this.projectId = null;
    this.editingParticipantId = null;  // Track which participant we're editing
    this.canManageParticipants = false;  // Will be set based on user role
    this.init();
  }

  async init() {
    setTimeout(() => {
      this.setupEventListeners();
      this.loadMeetingDetails();
      this.loadParticipants();
    }, 50);
  }

  setupEventListeners() {
    // ═══════════════════════════════════════════════════════════════════════
    // BACK BUTTON
    // ═══════════════════════════════════════════════════════════════════════
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.history.back();
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ADD PARTICIPANT MODAL EVENTS
    // ═══════════════════════════════════════════════════════════════════════
    const addParticipantBtn = document.getElementById('addParticipantBtn');
    if (addParticipantBtn) {
      addParticipantBtn.addEventListener('click', () => {
        this.openAddParticipantModal();
      });
    }

    const closeAddModalBtn = document.getElementById('closeAddParticipantModal');
    if (closeAddModalBtn) {
      closeAddModalBtn.addEventListener('click', () => {
        this.closeAddParticipantModal();
      });
    }

    const cancelAddBtn = document.getElementById('cancelAddParticipantBtn');
    if (cancelAddBtn) {
      cancelAddBtn.addEventListener('click', () => {
        this.closeAddParticipantModal();
      });
    }

    const addForm = document.getElementById('addParticipantForm');
    if (addForm) {
      addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddParticipant();
      });
    }

    // Add real-time validation for userId
    const userIdInput = document.getElementById('addParticipantUserId');
    if (userIdInput) {
      userIdInput.addEventListener('input', () => {
        this.validateUserId(userIdInput.value);
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EDIT PARTICIPANT MODAL EVENTS
    // ═══════════════════════════════════════════════════════════════════════
    const closeEditModalBtn = document.getElementById('closeEditParticipantModal');
    if (closeEditModalBtn) {
      closeEditModalBtn.addEventListener('click', () => {
        this.closeEditParticipantModal();
      });
    }

    const cancelEditBtn = document.getElementById('cancelEditParticipantBtn');
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', () => {
        this.closeEditParticipantModal();
      });
    }

    const editForm = document.getElementById('editParticipantForm');
    if (editForm) {
      editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleEditParticipant();
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // REMOVE PARTICIPANT MODAL EVENTS
    // ═══════════════════════════════════════════════════════════════════════
    const closeRemoveModalBtn = document.getElementById('closeRemoveParticipantModal');
    if (closeRemoveModalBtn) {
      closeRemoveModalBtn.addEventListener('click', () => {
        this.closeRemoveParticipantModal();
      });
    }

    const cancelRemoveBtn = document.getElementById('cancelRemoveParticipantBtn');
    if (cancelRemoveBtn) {
      cancelRemoveBtn.addEventListener('click', () => {
        this.closeRemoveParticipantModal();
      });
    }

    const submitRemoveBtn = document.getElementById('submitRemoveParticipantBtn');
    if (submitRemoveBtn) {
      submitRemoveBtn.addEventListener('click', () => {
        this.handleRemoveParticipant();
      });
    }

    // Modal backdrop clicks
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        e.target.parentElement.classList.remove('show');
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOAD MEETING DETAILS
  // ═══════════════════════════════════════════════════════════════════════════

  async loadMeetingDetails() {
    try {
      // Get meetingId from URL or localStorage
      this.meetingId = this.getMeetingIdFromContext();
      
      if (!this.meetingId) {
        console.error('❌ No meeting ID found');
        this.showError('Meeting not found. Please select a meeting first.');
        return;
      }

      console.log(`📅 Loading meeting details for meetingId=${this.meetingId}`);

      // Get projectId from store or localStorage
      let projectId = store.state?.projects?.current?._id || 
                      store.state?.projects?.current?.id ||
                      localStorage.getItem('CURRENT_PROJECT');
      
      if (!projectId) {
        console.error('❌ No project ID found');
        this.showError('Project context not found. Please select a project first.');
        return;
      }

      this.projectId = projectId;

      // Determine entityType from stored value or default to 'inceptions'
      const storedEntityType = localStorage.getItem('CURRENT_ENTITY_TYPE');
      this.entityType = storedEntityType || 'inceptions';

      console.log(`🔍 Using entityType: ${this.entityType}`);

      // Call service to get specific meeting
      const response = await meetingsService.getMeeting(this.entityType, this.meetingId);
      
      if (!response || !response.success) {
        console.error('❌ Failed to load meeting:', response?.message || 'Unknown error');
        this.showError('Failed to load meeting details');
        return;
      }

      this.meeting = response.data;
      console.log('✅ Meeting loaded:', this.meeting);

      // Check if user can manage participants
      this.checkParticipantManagementPermission();

      // Render meeting details
      this.renderMeetingDetails();
    } catch (error) {
      console.error('❌ Error loading meeting details:', error);
      this.showError(`Error: ${error.message}`);
    }
  }

  getMeetingIdFromContext() {
    // Try URL hash first
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const meetingIdFromUrl = hashParams.get('meetingId');
    
    if (meetingIdFromUrl) {
      return meetingIdFromUrl;
    }

    // Try localStorage
    const storedMeetingId = localStorage.getItem('CURRENT_MEETING');
    if (storedMeetingId) {
      return storedMeetingId;
    }

    // Try store state
    return store.state?.meetings?.current?._id;
  }

  checkParticipantManagementPermission() {
    // For now, assume current user has permission if meeting exists
    // In a real app, you'd check:
    // - Is user the meeting FACILITATOR?
    // - Is user the PROJECT_OWNER?
    // - What's the current user's role?

    // Simplified: Allow if user is authenticated
    const hasAuth = !!localStorage.getItem('accessToken');
    this.canManageParticipants = hasAuth;

    console.log(`🔐 User can manage participants: ${this.canManageParticipants}`);

    // Show/hide add button based on permission
    const addBtn = document.getElementById('addParticipantBtn');
    if (addBtn) {
      addBtn.style.display = this.canManageParticipants ? 'inline-block' : 'none';
    }
  }

  renderMeetingDetails() {
    if (!this.meeting) {
      console.warn('⚠️ No meeting data to render');
      return;
    }

    // Update title and description
    const titleEl = document.getElementById('meetingTitle');
    if (titleEl) titleEl.textContent = this.meeting.title || 'Meeting';

    const descEl = document.getElementById('meetingDescription');
    if (descEl) descEl.textContent = this.meeting.description || 'Meeting details';

    // Update status badge
    const badgeEl = document.getElementById('meetingStatusBadge');
    if (badgeEl) {
      badgeEl.textContent = this.meeting.status || 'DRAFT';
      badgeEl.className = `badge badge-${(this.meeting.status || 'draft').toLowerCase()}`;
    }

    // Update meeting info grid
    const platformEl = document.getElementById('meetingPlatform');
    if (platformEl) platformEl.textContent = this.meeting.platform || 'N/A';

    const scheduledAtEl = document.getElementById('meetingScheduledAt');
    if (scheduledAtEl) {
      if (this.meeting.scheduledAt) {
        const date = new Date(this.meeting.scheduledAt);
        scheduledAtEl.textContent = date.toLocaleString();
      } else {
        scheduledAtEl.textContent = 'Not scheduled';
        scheduledAtEl.style.opacity = '0.5';
      }
    }

    const durationEl = document.getElementById('meetingDuration');
    if (durationEl) durationEl.textContent = `${this.meeting.expectedDuration || 60} minutes`;

    const groupEl = document.getElementById('meetingGroup');
    if (groupEl) groupEl.textContent = this.meeting.meetingGroup || 'General';

    // Show/hide meeting link
    if (this.meeting.meetingLink) {
      const linkCardEl = document.getElementById('meetingLinkCard');
      if (linkCardEl) linkCardEl.style.display = 'block';

      const linkEl = document.getElementById('meetingLink');
      if (linkEl) {
        linkEl.href = this.meeting.meetingLink;
        linkEl.textContent = this.meeting.meetingLink;
      }
    }

    console.log('🎨 Meeting details rendered');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOAD PARTICIPANTS
  // ═══════════════════════════════════════════════════════════════════════════

  async loadParticipants() {
    try {
      if (!this.meetingId || !this.entityType) {
        console.warn('⚠️ Missing meetingId or entityType for loading participants');
        return;
      }

      console.log(`👥 Loading participants for meetingId=${this.meetingId}, entityType=${this.entityType}`);

      // Call service to list participants
      const participants = await participantsService.listParticipants(this.entityType, this.meetingId);
      
      this.participants = Array.isArray(participants) ? participants : [];
      console.log(`✅ Loaded ${this.participants.length} participants`);

      this.renderParticipants();
    } catch (error) {
      console.error('❌ Error loading participants:', error);
      this.showError(`Failed to load participants: ${error.message}`);
    }
  }

  renderParticipants() {
    const tableBody = document.getElementById('participantsTableBody');
    const emptyState = document.getElementById('participantsEmptyState');
    
    if (!tableBody) return;

    if (!this.participants || this.participants.length === 0) {
      tableBody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      console.log('📭 No participants to display');
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tableBody.innerHTML = this.participants.map(participant => {
      const role = participant.role || PARTICIPANT_TYPES.PARTICIPANT;
      const isFacilitator = role === PARTICIPANT_TYPES.FACILITATOR;
      
      return `
        <tr>
          <td><strong>${participant.userId || 'Unknown'}</strong></td>
          <td>
            <span class="badge ${isFacilitator ? 'badge-active' : 'badge-draft'}">
              ${isFacilitator ? '👤 FACILITATOR' : '👥 PARTICIPANT'}
            </span>
          </td>
          <td>${participant.roleDescription || '-'}</td>
          <td>
            <span class="badge badge-active">Active</span>
          </td>
          <td>
            <div style="display: flex; gap: 5px;">
              ${this.canManageParticipants ? `
                <button class="btn btn-sm btn-secondary" onclick="window.meetingDetailPage.editParticipant('${participant._id}', '${participant.userId}', '${participant.roleDescription || ''}')">
                  ✏️ Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="window.meetingDetailPage.removeParticipant('${participant._id}', '${participant.userId}')">
                  ❌ Remove
                </button>
              ` : `
                <span style="color: #999; font-size: 12px;">View only</span>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    console.log('🎨 Participants rendered');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADD PARTICIPANT MODAL HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  openAddParticipantModal() {
    if (!this.canManageParticipants) {
      this.showError('You do not have permission to add participants');
      return;
    }

    const modal = document.getElementById('addParticipantModal');
    if (modal) {
      modal.classList.add('show');
      // Clear form
      document.getElementById('addParticipantForm').reset();
      // Clear error messages
      document.getElementById('addParticipantError').style.display = 'none';
    }
  }

  closeAddParticipantModal() {
    const modal = document.getElementById('addParticipantModal');
    if (modal) {
      modal.classList.remove('show');
      document.getElementById('addParticipantForm').reset();
      document.getElementById('addParticipantError').style.display = 'none';
      document.getElementById('userIdError').style.display = 'none';
    }
  }

  validateUserId(userId) {
    const errorEl = document.getElementById('userIdError');
    if (!errorEl) return;

    if (!userId) {
      errorEl.style.display = 'none';
      return;
    }

    // Check format: must start with USR
    if (!userId.startsWith('USR')) {
      errorEl.textContent = '❌ User ID must start with "USR" (e.g., USR1100000)';
      errorEl.style.display = 'block';
      return;
    }

    // Check if already participant
    const isDuplicate = this.participants.some(p => p.userId === userId);
    if (isDuplicate) {
      errorEl.textContent = '❌ This user is already a participant in this meeting';
      errorEl.style.display = 'block';
      return;
    }

    errorEl.style.display = 'none';
  }

  async handleAddParticipant() {
    try {
      const userIdInput = document.getElementById('addParticipantUserId');
      const roleInput = document.getElementById('addParticipantRole');
      const errorEl = document.getElementById('addParticipantError');
      const submitBtn = document.getElementById('submitAddParticipantBtn');

      const userId = userIdInput.value.trim();
      const roleDescription = roleInput.value.trim();

      // Validate
      if (!userId) {
        errorEl.textContent = '❌ User ID is required';
        errorEl.style.display = 'block';
        return;
      }

      // Run all validations
      this.validateUserId(userId);
      const userIdError = document.getElementById('userIdError');
      if (userIdError && userIdError.style.display !== 'none') {
        return;  // Validation failed
      }

      // Disable submit button
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ Adding...';

      console.log(`➕ Adding participant: userId=${userId}, roleDescription=${roleDescription}`);

      // Call service
      const response = await participantsService.addParticipant(
        this.entityType,
        this.meetingId,
        {
          userId,
          ...(roleDescription && { roleDescription })
        }
      );

      if (!response || !response.success) {
        errorEl.textContent = `❌ ${response?.message || 'Failed to add participant'}`;
        errorEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Participant';
        return;
      }

      console.log('✅ Participant added successfully');
      this.showSuccess(`Participant ${userId} added successfully!`);
      
      // Reload participants
      this.closeAddParticipantModal();
      await this.loadParticipants();

      submitBtn.disabled = false;
      submitBtn.textContent = 'Add Participant';
    } catch (error) {
      console.error('❌ Error adding participant:', error);
      const errorEl = document.getElementById('addParticipantError');
      errorEl.textContent = `❌ ${error.message}`;
      errorEl.style.display = 'block';

      const submitBtn = document.getElementById('submitAddParticipantBtn');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Add Participant';
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EDIT PARTICIPANT MODAL HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  editParticipant(participantId, userId, roleDescription) {
    if (!this.canManageParticipants) {
      this.showError('You do not have permission to edit participants');
      return;
    }

    this.editingParticipantId = participantId;
    
    const userIdInput = document.getElementById('editParticipantUserId');
    const roleInput = document.getElementById('editParticipantRole');

    if (userIdInput) userIdInput.value = userId;
    if (roleInput) roleInput.value = roleDescription || '';

    const modal = document.getElementById('editParticipantModal');
    if (modal) {
      modal.classList.add('show');
      document.getElementById('editParticipantError').style.display = 'none';
      document.getElementById('editParticipantSuccess').style.display = 'none';
    }
  }

  closeEditParticipantModal() {
    const modal = document.getElementById('editParticipantModal');
    if (modal) {
      modal.classList.remove('show');
      this.editingParticipantId = null;
      document.getElementById('editParticipantForm').reset();
      document.getElementById('editParticipantError').style.display = 'none';
      document.getElementById('editParticipantSuccess').style.display = 'none';
    }
  }

  async handleEditParticipant() {
    try {
      const userIdInput = document.getElementById('editParticipantUserId');
      const roleInput = document.getElementById('editParticipantRole');
      const errorEl = document.getElementById('editParticipantError');
      const successEl = document.getElementById('editParticipantSuccess');
      const submitBtn = document.getElementById('submitEditParticipantBtn');

      const userId = userIdInput.value.trim();
      const roleDescription = roleInput.value.trim();

      // Disable submit button
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ Updating...';
      errorEl.style.display = 'none';
      successEl.style.display = 'none';

      console.log(`✏️ Updating participant: userId=${userId}, roleDescription=${roleDescription}`);

      // Call service
      const response = await participantsService.updateParticipant(
        this.entityType,
        this.meetingId,
        {
          userId,
          ...(roleDescription && { roleDescription })
        }
      );

      if (!response || !response.success) {
        errorEl.textContent = `❌ ${response?.message || 'Failed to update participant'}`;
        errorEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Participant';
        return;
      }

      // Check for "No changes detected" response
      if (response.message === 'No changes detected') {
        successEl.textContent = '✅ No changes made to participant';
        successEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Participant';
        return;
      }

      console.log('✅ Participant updated successfully');
      this.showSuccess(`Participant ${userId} updated successfully!`);
      
      // Reload participants
      this.closeEditParticipantModal();
      await this.loadParticipants();

      submitBtn.disabled = false;
      submitBtn.textContent = 'Update Participant';
    } catch (error) {
      console.error('❌ Error updating participant:', error);
      const errorEl = document.getElementById('editParticipantError');
      errorEl.textContent = `❌ ${error.message}`;
      errorEl.style.display = 'block';

      const submitBtn = document.getElementById('submitEditParticipantBtn');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Update Participant';
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REMOVE PARTICIPANT MODAL HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  removeParticipant(participantId, userId) {
    if (!this.canManageParticipants) {
      this.showError('You do not have permission to remove participants');
      return;
    }

    this.editingParticipantId = participantId;

    const nameEl = document.getElementById('removeParticipantName');
    if (nameEl) nameEl.textContent = userId;

    const modal = document.getElementById('removeParticipantModal');
    if (modal) {
      modal.classList.add('show');
      document.getElementById('removeParticipantForm').reset();
      document.getElementById('removeParticipantError').style.display = 'none';
    }
  }

  closeRemoveParticipantModal() {
    const modal = document.getElementById('removeParticipantModal');
    if (modal) {
      modal.classList.remove('show');
      this.editingParticipantId = null;
      document.getElementById('removeParticipantForm').reset();
      document.getElementById('removeParticipantError').style.display = 'none';
    }
  }

  async handleRemoveParticipant() {
    try {
      const reasonInput = document.getElementById('removeParticipantReason');
      const errorEl = document.getElementById('removeParticipantError');
      const submitBtn = document.getElementById('submitRemoveParticipantBtn');
      const nameEl = document.getElementById('removeParticipantName');

      const removeReason = reasonInput.value.trim();
      const userId = nameEl.textContent;

      // Disable submit button
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ Removing...';
      errorEl.style.display = 'none';

      console.log(`❌ Removing participant: userId=${userId}, reason=${removeReason}`);

      // Call service
      const response = await participantsService.removeParticipant(
        this.entityType,
        this.meetingId,
        userId,
        removeReason || null
      );

      if (!response || !response.success) {
        errorEl.textContent = `❌ ${response?.message || 'Failed to remove participant'}`;
        errorEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Remove Participant';
        return;
      }

      console.log('✅ Participant removed successfully');
      this.showSuccess(`Participant ${userId} removed successfully!`);
      
      // Reload participants
      this.closeRemoveParticipantModal();
      await this.loadParticipants();

      submitBtn.disabled = false;
      submitBtn.textContent = 'Remove Participant';
    } catch (error) {
      console.error('❌ Error removing participant:', error);
      const errorEl = document.getElementById('removeParticipantError');
      errorEl.textContent = `❌ ${error.message}`;
      errorEl.style.display = 'block';

      const submitBtn = document.getElementById('submitRemoveParticipantBtn');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Remove Participant';
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTIFICATION HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  showError(message) {
    console.error(`❌ ${message}`);
    this.showToast(message, 'error');
  }

  showSuccess(message) {
    console.log(`✅ ${message}`);
    this.showToast(message, 'success');
  }

  showInfo(message) {
    console.info(`ℹ️ ${message}`);
    this.showToast(message, 'info');
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
      toast.remove();
    }, 4000);
  }
}

// Initialize page when DOM is ready
window.meetingDetailPage = new MeetingDetailPage();

// Export class for app.js to initialize when page loads
export { MeetingDetailPage };
