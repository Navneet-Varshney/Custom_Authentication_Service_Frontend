import { meetingsService } from '../js/services/meetings.service.js';
import { store } from '../js/store/store.js';
import { MEETING_PLATFORMS, MEETING_GROUPS, MEETING_STATUSES, MEETING_CANCELLATION_REASONS, ENTITY_TYPES } from '../js/utils/constants.js';

/**
 * Meetings Page Controller
 * 
 * Backend requires entityType for all operations (PLURAL forms):
 * - entityType: inceptions, elicitations, elaborations, negotiations, specifications, validations
 */
class MeetingsPage {
  constructor() {
    this.meetings = [];
    this.filteredMeetings = [];
    this.editingMeetingId = null;
    this.currentMeetingData = null;  // Store data between step 1 and step 2
    this.entityType = 'inceptions';  // Default entity type (PLURAL for backend)
    this.projectId = null;          // Will be loaded from store or localStorage
    this.init();
  }

  async init() {
    setTimeout(() => {
      this.setupEventListeners();
      this.loadMeetings();
    }, 50);
  }

  setupEventListeners() {
    // Hide modals on init
    const createModal = document.getElementById('createMeetingModal');
    const scheduleModal = document.getElementById('scheduleMeetingModal');
    if (createModal) createModal.classList.remove('show');
    if (scheduleModal) scheduleModal.classList.remove('show');

    // ===== CREATE MODAL EVENTS =====
    // Open create modal on button click
    const createBtn = document.getElementById('createMeetingBtn') || document.getElementById('newMeetingBtn');
    if (createBtn) {
      createBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openCreateMeetingModal();
      });
    }

    // CREATE form submission
    const createForm = document.getElementById('createMeetingForm');
    if (createForm) {
      createForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCreateMeetingSubmit();
      });
    }

    // CREATE modal close buttons
    const closeCreateBtn = document.getElementById('closeCreateModal');
    if (closeCreateBtn) {
      closeCreateBtn.addEventListener('click', () => {
        this.cancelCreateMeetingModal();
      });
    }

    const cancelCreateBtn = document.getElementById('cancelCreateBtn');
    if (cancelCreateBtn) {
      cancelCreateBtn.addEventListener('click', () => {
        this.cancelCreateMeetingModal();
      });
    }

    // CREATE modal backdrop click
    const createBackdrop = createModal?.querySelector('.modal-backdrop');
    if (createBackdrop) {
      createBackdrop.addEventListener('click', () => {
        this.cancelCreateMeetingModal();
      });
    }

    // ===== SCHEDULE MODAL EVENTS =====
    // SCHEDULE form submission
    const scheduleForm = document.getElementById('scheduleMeetingForm');
    if (scheduleForm) {
      scheduleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleScheduleMeetingSubmit();
      });
    }

    // SCHEDULE modal close buttons
    const closeScheduleBtn = document.getElementById('closeScheduleModal');
    if (closeScheduleBtn) {
      closeScheduleBtn.addEventListener('click', () => {
        this.cancelScheduleMeetingModal();
      });
    }

    // SCHEDULE modal back button
    const backToCreateBtn = document.getElementById('backToCreateBtn');
    if (backToCreateBtn) {
      backToCreateBtn.addEventListener('click', () => {
        this.goBackToCreateModal();
      });
    }

    // SCHEDULE modal backdrop click
    const scheduleBackdrop = scheduleModal?.querySelector('.modal-backdrop');
    if (scheduleBackdrop) {
      scheduleBackdrop.addEventListener('click', () => {
        this.cancelScheduleMeetingModal();
      });
    }

    // Search and filters
    const searchBox = document.getElementById('searchMeetings');
    if (searchBox) {
      searchBox.addEventListener('input', () => {
        this.filterMeetings();
      });
    }

    const statusFilter = document.getElementById('filterStatus');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => {
        this.filterMeetings();
      });
    }

    const typeFilter = document.getElementById('filterType');
    if (typeFilter) {
      typeFilter.addEventListener('change', () => {
        this.filterMeetings();
      });
    }
  }

  async loadMeetings() {
    try {
      // Get projectId from store or localStorage
      let projectId = store.state?.projects?.current?._id || store.state?.projects?.current?.id || store.state?.projects?.current;
      
      if (!projectId) {
        const savedProject = localStorage.getItem('CURRENT_PROJECT');
        if (savedProject) {
          try {
            const projectData = typeof savedProject === 'string' ? JSON.parse(savedProject) : savedProject;
            projectId = projectData?._id || projectData?.id || projectData;
          } catch (e) {
            console.error('Failed to parse saved project:', e);
          }
        }
      }

      if (!projectId) {
        console.warn('⚠️ No project selected');
        this.meetings = [];
        this.renderMeetings();
        return;
      }

      this.projectId = projectId;
      console.log(`📅 Loading meetings for entityType=${this.entityType}, projectId=${projectId}`);

      // Call service with entityType and projectId
      // Service returns array directly (handles response wrapper internally)
      const meetings = await meetingsService.listMeetings(this.entityType, projectId);
      console.log('✅ API Response received:', meetings);
      
      this.meetings = Array.isArray(meetings) ? meetings : [];
      console.log('📦 Total meetings loaded:', this.meetings.length);
      
      this.filterMeetings();
      this.renderMeetings();
    } catch (error) {
      console.error('❌ Failed to load meetings:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Show error message to user
      const container = document.getElementById('meetingsList');
      if (container) {
        const errorMsg = error?.message || 'Failed to load meetings';
        const htmlContent = '<div class="empty-state" style="color: #d32f2f;"><div class="empty-icon">⚠️</div><h3>Error Loading Meetings</h3><p>' + errorMsg + '</p><small style="display: block; margin-top: 10px; opacity: 0.7;">Tip: Inception phase may not exist. Create a phase first.</small></div>';
        container.innerHTML = htmlContent;
      }
      this.meetings = [];
    }
  }

  filterMeetings() {
    const search = document.getElementById('searchMeetings')?.value?.toLowerCase() || '';
    const statusFilter = document.getElementById('filterStatus')?.value || '';
    const groupFilter = document.getElementById('filterType')?.value || '';

    console.log('🔍 [filterMeetings] search:', search, 'status:', statusFilter, 'group:', groupFilter);
    console.log('📦 Total meetings:', this.meetings.length);

    this.filteredMeetings = this.meetings.filter(meeting => {
      const matchesSearch = !search || 
        meeting.title.toLowerCase().includes(search) ||
        (meeting.description?.toLowerCase().includes(search));
      
      const matchesStatus = !statusFilter || meeting.status === statusFilter;
      const matchesGroup = !groupFilter || meeting.meetingGroup === groupFilter;

      return matchesSearch && matchesStatus && matchesGroup;
    });

    console.log('✅ Filtered to:', this.filteredMeetings.length, 'meetings');
    this.renderMeetings();
  }

  renderMeetings() {
    const container = document.getElementById('meetingsList');
    
    console.log('🎨 [renderMeetings] Container found:', !!container, 'Meetings count:', this.filteredMeetings.length);
    console.log('📊 Filtered meetings:', this.filteredMeetings);
    
    if (!container) {
      console.error('❌ meetingsList container not found in HTML!');
      return;
    }

    if (!Array.isArray(this.filteredMeetings) || this.filteredMeetings.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📅</div>
          <h3>No Meetings</h3>
          <p>No meetings scheduled yet. Click "Schedule Meeting" to create one.</p>
        </div>
      `;
      console.log('📭 No meetings to display');
      return;
    }

    container.innerHTML = this.filteredMeetings.map(meeting => `
      <div class="meeting-card">
        <div class="card-header">
          <h3>${meeting.title}</h3>
          <span class="badge badge-${meeting.status?.toLowerCase() || 'default'}">${meeting.status || 'DRAFT'}</span>
        </div>
        <div class="card-body">
          <div class="meeting-meta">
            <div class="meta-item">
              <span class="meta-label">📅 Scheduled:</span>
              <span ${meeting.scheduledAt ? '' : 'style="opacity: 0.5;"'}>
                ${meeting.scheduledAt ? new Date(meeting.scheduledAt).toLocaleString() : 'Not scheduled'}
              </span>
            </div>
            <div class="meta-item">
              <span class="meta-label">🏷️ Group:</span>
              <span>${meeting.meetingGroup || 'General'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">⏱️ Duration:</span>
              <span>${meeting.expectedDuration || 60} minutes</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">🌐 Platform:</span>
              <span>${meeting.platform || 'Google Meet'}</span>
            </div>
            ${meeting.meetingLink ? `
              <div class="meta-item">
                <span class="meta-label">🔗 Link:</span>
                <a href="${meeting.meetingLink}" target="_blank">${meeting.meetingLink}</a>
              </div>
            ` : ''}
            ${meeting.description ? `
              <div class="meta-item">
                <span class="meta-label">📝 Description:</span>
                <p>${meeting.description}</p>
              </div>
            ` : ''}
          </div>
          
          ${meeting.participants && Array.isArray(meeting.participants) && meeting.participants.length > 0 ? `
            <div class="participants-list">
              <strong>👥 Participants (${meeting.participants.length}):</strong>
              <div class="participant-tags">
                ${meeting.participants.map(p => `
                  <span class="participant-tag">${p.userId || p}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
        <div class="card-footer">
          <div class="action-buttons">
            <button class="btn btn-sm btn-info" onclick="window.meetingsPage.viewMeetingDetails('${meeting._id}')">👁️ View Details</button>
            ${meeting.status === 'DRAFT' ? `
              <button class="btn btn-sm btn-primary" onclick="window.meetingsPage.scheduleMeeting('${meeting._id}')">📅 Schedule</button>
            ` : ''}
            ${meeting.status === 'SCHEDULED' ? `
              <button class="btn btn-sm btn-success" onclick="window.meetingsPage.startMeeting('${meeting._id}')">▶️ Start</button>
            ` : ''}
            ${meeting.status === 'ONGOING' ? `
              <button class="btn btn-sm btn-info" onclick="window.meetingsPage.endMeeting('${meeting._id}')">⏹️ End</button>
            ` : ''}
            <button class="btn btn-sm btn-secondary" onclick="window.meetingsPage.editMeeting('${meeting._id}')">✏️ Edit</button>
            ${meeting.status !== 'COMPLETED' && meeting.status !== 'CANCELLED' ? `
              <button class="btn btn-sm btn-warning" onclick="window.meetingsPage.rescheduleMeeting('${meeting._id}')">🔄 Reschedule</button>
            ` : ''}
            ${meeting.status !== 'COMPLETED' && meeting.status !== 'CANCELLED' ? `
              <button class="btn btn-sm btn-danger" onclick="window.meetingsPage.cancelMeeting('${meeting._id}')">❌ Cancel</button>
            ` : ''}
            ${meeting.status === 'COMPLETED' ? `
              <button class="btn btn-sm btn-tertiary" onclick="window.meetingsPage.freezeMeeting('${meeting._id}')">❄️ Freeze</button>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  openCreateMeetingModal() {
    this.currentMeetingData = null;  // Reset
    const form = document.getElementById('createMeetingForm');
    if (form) form.reset();
    
    const modal = document.getElementById('createMeetingModal');
    if (modal) modal.classList.add('show');
    
    console.log('✅ Opening CREATE Meeting modal');
  }

  closeCreateMeetingModal() {
    // DO NOT CLEAR DATA - we might be transitioning to next step!
    const modal = document.getElementById('createMeetingModal');
    if (modal) modal.classList.remove('show');
    console.log('❌ Closed CREATE Meeting modal');
  }

  cancelCreateMeetingModal() {
    // Clear data when actually cancelling (not transitioning)
    this.closeCreateMeetingModal();
    this.currentMeetingData = null;
    const form = document.getElementById('createMeetingForm');
    if (form) form.reset();
    console.log('❌ CANCELLED CREATE Meeting');
  }

  async handleCreateMeetingSubmit() {
    try {
      // Get form values
      const titleVal = document.getElementById('createTitle')?.value?.trim();
      const groupVal = document.getElementById('createGroup')?.value;
      const platformVal = document.getElementById('createPlatform')?.value;
      const descriptionVal = document.getElementById('createDescription')?.value?.trim();

      // Validate required fields
      if (!titleVal) {
        alert('❌ Meeting title is required');
        return;
      }
      if (!groupVal) {
        alert('❌ Meeting group is required');
        return;
      }
      if (!platformVal) {
        alert('❌ Platform is required');
        return;
      }

      if (!this.projectId) {
        alert('⚠️ No project selected. Please go back and select a project.');
        return;
      }

      const meetingData = {
        title: titleVal,
        meetingGroup: groupVal,
        platform: platformVal,
        ...(descriptionVal && { description: descriptionVal })
      };

      // Store data for step 2
      this.currentMeetingData = meetingData;

      // Close create modal
      this.closeCreateMeetingModal();

      // Open schedule modal
      console.log('📋 Meeting data saved, opening SCHEDULE modal...');
      setTimeout(() => {
        this.openScheduleMeetingModal();
      }, 300);

    } catch (error) {
      console.error('❌ Failed in CREATE step:', error);
      alert(`❌ Error: ${error.message}`);
    }
  }

  openScheduleMeetingModal() {
    const form = document.getElementById('scheduleMeetingForm');
    if (form) form.reset();
    
    const modal = document.getElementById('scheduleMeetingModal');
    if (modal) modal.classList.add('show');
    
    // Focus on date input
    setTimeout(() => {
      document.getElementById('scheduleDateTime')?.focus();
    }, 100);

    console.log('✅ Opening SCHEDULE Meeting modal');
  }

  closeScheduleMeetingModal() {
    // DO NOT CLEAR DATA - we might be going back!
    const modal = document.getElementById('scheduleMeetingModal');
    if (modal) modal.classList.remove('show');
    console.log('❌ Closed SCHEDULE Meeting modal');
  }

  cancelScheduleMeetingModal() {
    // Clear data when actually cancelling
    this.closeScheduleMeetingModal();
    this.currentMeetingData = null;
    const form = document.getElementById('scheduleMeetingForm');
    if (form) form.reset();
    console.log('❌ CANCELLED SCHEDULE Meeting');
  }

  goBackToCreateModal() {
    console.log('⬅️ Going back to CREATE modal...');
    this.closeScheduleMeetingModal();
    setTimeout(() => {
      this.openCreateMeetingModal();
      // Restore form data
      if (this.currentMeetingData) {
        document.getElementById('createTitle').value = this.currentMeetingData.title || '';
        document.getElementById('createGroup').value = this.currentMeetingData.meetingGroup || '';
        document.getElementById('createPlatform').value = this.currentMeetingData.platform || '';
        document.getElementById('createDescription').value = this.currentMeetingData.description || '';
      }
    }, 300);
  }

  async handleScheduleMeetingSubmit() {
    try {
      if (!this.currentMeetingData) {
        alert('❌ Meeting data not found. Please start over.');
        this.closeScheduleMeetingModal();
        return;
      }

      // Get schedule form values
      const dateTimeVal = document.getElementById('scheduleDateTime')?.value;
      const linkVal = document.getElementById('scheduleLink')?.value?.trim();
      const passwordVal = document.getElementById('schedulePassword')?.value?.trim();

      // Validate required fields
      if (!dateTimeVal) {
        alert('❌ Date & Time is required');
        return;
      }
      if (!linkVal) {
        alert('❌ Meeting link is required');
        return;
      }

      if (!this.projectId) {
        alert('⚠️ Project not found. Please refresh and try again.');
        return;
      }

      console.log('🔄 Creating meeting...');
      // Step 1: CREATE meeting
      const createResponse = await meetingsService.createMeeting(
        this.entityType,
        this.projectId,
        this.currentMeetingData
      );
      console.log('✅ Meeting created:', createResponse);

      // Extract meetingId from response
      // Service normalizes: { success, data: { meeting object } }
      // After normalization in service, we access directly from data
      const newMeetingId = createResponse.data?._id;
      
      if (!newMeetingId) {
        console.error('❌ Cannot extract meeting ID. Full response:', createResponse);
        throw new Error('Failed to extract meeting ID from response');
      }

      console.log(`📌 New Meeting ID: ${newMeetingId}`);

      // Step 2: SCHEDULE the meeting
      console.log('🔄 Scheduling meeting...');
      const scheduleData = {
        scheduledAt: new Date(dateTimeVal).toISOString(),
        meetingLink: linkVal,
        ...(passwordVal && { meetingPassword: passwordVal })
      };

      const scheduleResponse = await meetingsService.scheduleMeeting(
        this.entityType,
        newMeetingId,
        scheduleData
      );
      console.log('✅ Meeting scheduled:', scheduleResponse);

      // Success! Clear data and reload
      this.currentMeetingData = null;
      this.closeScheduleMeetingModal();
      alert('✅ Meeting created and scheduled successfully!');

      // Reload meetings
      await this.loadMeetings();

    } catch (error) {
      console.error('❌ Failed in SCHEDULE step:', error);
      alert(`❌ Error: ${error.message}`);
    }
  }

  async rescheduleMeeting(meetingId) {
    try {
      // Show reschedule modal to get all required fields
      this.showRescheduleModal(meetingId);
    } catch (error) {
      console.error('Failed to reschedule:', error);
      alert(`Failed to reschedule meeting: ${error.message}`);
    }
  }

  showRescheduleModal(meetingId) {
    // Get or create reschedule modal
    let modal = document.getElementById('rescheduleModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'rescheduleModal';
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h2>Reschedule Meeting</h2>
            <button type="button" class="close" id="closeRescheduleModal">&times;</button>
          </div>
          <div class="modal-body">
            <form id="rescheduleForm">
              <div class="form-group">
                <label for="rescheduledAt">New Date & Time *</label>
                <input type="datetime-local" id="rescheduledAt" required>
              </div>
              <div class="form-group">
                <label for="newMeetingLink">Meeting Link *</label>
                <input type="url" id="newMeetingLink" placeholder="https://zoom.us/j/..." required>
              </div>
              <div class="form-group">
                <label for="newMeetingPassword">Meeting Password</label>
                <input type="text" id="newMeetingPassword" placeholder="Optional password">
              </div>
              <div class="form-group">
                <label for="newExpectedDuration">Expected Duration (minutes)</label>
                <input type="number" id="newExpectedDuration" min="15" max="480" value="60">
              </div>
              <button type="submit" class="btn btn-primary">Reschedule</button>
              <button type="button" class="btn btn-secondary" id="cancelRescheduleBtn">Cancel</button>
            </form>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    // Setup event listeners
    modal.querySelector('#rescheduleForm').onsubmit = async (e) => {
      e.preventDefault();
      const scheduledAtEl = document.getElementById('rescheduledAt').value;
      const meetingLink = document.getElementById('newMeetingLink').value;
      const meetingPassword = document.getElementById('newMeetingPassword').value;
      const expectedDuration = parseInt(document.getElementById('newExpectedDuration').value);

      if (!scheduledAtEl || !meetingLink) {
        alert('Date & Time and Meeting Link are required');
        return;
      }

      try {
        const rescheduleData = {
          scheduledAt: new Date(scheduledAtEl).toISOString(),  // Convert to ISO format
          meetingLink: meetingLink,
          ...(meetingPassword && { meetingPassword }),
          ...(expectedDuration && { expectedDuration })
        };

        const response = await meetingsService.rescheduleMeeting(this.entityType, meetingId, rescheduleData);
        console.log('✅ Meeting rescheduled:', response);
        alert('Meeting rescheduled successfully!');
        modal.classList.remove('show');
        await this.loadMeetings();
      } catch (error) {
        console.error('Failed to reschedule:', error);
        alert(`Failed to reschedule: ${error.message}`);
      }
    };

    document.getElementById('closeRescheduleModal').onclick = () => {
      modal.classList.remove('show');
    };
    document.getElementById('cancelRescheduleBtn').onclick = () => {
      modal.classList.remove('show');
    };

    modal.classList.add('show');
  }

  async cancelMeeting(meetingId) {
    try {
      const reason = prompt('Enter cancellation reason:');
      if (!reason) return;

      const cancelData = {
        cancelReason: reason  // CORRECTED: was 'reason', should be 'cancelReason'
      };

      // Pass entityType and meetingId
      const response = await meetingsService.cancelMeeting(this.entityType, meetingId, cancelData);
      console.log('✅ Meeting cancelled:', response);
      alert('Meeting cancelled successfully!');
      await this.loadMeetings();
    } catch (error) {
      console.error('Failed to cancel:', error);
      alert(`Failed to cancel meeting: ${error.message}`);
    }
  }

  async startMeeting(meetingId) {
    try {
      const startData = {
        startedAt: new Date().toISOString()
      };

      // Pass entityType and meetingId
      const response = await meetingsService.startMeeting(this.entityType, meetingId, startData);
      console.log('✅ Meeting started:', response);
      alert('Meeting started successfully!');
      await this.loadMeetings();
    } catch (error) {
      console.error('Failed to start:', error);
      alert(`Failed to start meeting: ${error.message}`);
    }
  }

  async endMeeting(meetingId) {
    try {
      const notes = prompt('Enter meeting notes:');
      if (!notes) return;

      const endData = {
        notes: notes,
        endedAt: new Date().toISOString()
      };

      // Pass entityType and meetingId
      const response = await meetingsService.endMeeting(this.entityType, meetingId, endData);
      console.log('✅ Meeting ended:', response);
      alert('Meeting ended successfully!');
      await this.loadMeetings();
    } catch (error) {
      console.error('Failed to end:', error);
      alert(`Failed to end meeting: ${error.message}`);
    }
  }

  async freezeMeeting(meetingId) {
    try {
      const freezeReason = prompt('Enter freeze reason:');
      if (!freezeReason) return;

      const freezeData = {
        reason: freezeReason
      };

      // Pass entityType and meetingId
      const response = await meetingsService.freezeMeeting(this.entityType, meetingId, freezeData);
      console.log('✅ Meeting frozen:', response);
      alert('Meeting frozen successfully!');
      await this.loadMeetings();
    } catch (error) {
      console.error('Failed to freeze:', error);
      alert(`Failed to freeze meeting: ${error.message}`);
    }
  }

  async editMeeting(meetingId) {
    try {
      // Find the meeting
      const meeting = this.meetings.find(m => m._id === meetingId);
      if (!meeting) {
        alert('Meeting not found');
        return;
      }

      // Get or create edit modal
      let modal = document.getElementById('editMeetingModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'editMeetingModal';
        modal.className = 'modal';
        modal.innerHTML = `
          <div class="modal-content">
            <div class="modal-header">
              <h2>Edit Meeting</h2>
              <button type="button" class="close" id="closeEditModal">&times;</button>
            </div>
            <div class="modal-body">
              <form id="editMeetingForm">
                <div class="form-group">
                  <label for="editTitle">Title *</label>
                  <input type="text" id="editTitle" placeholder="Meeting title" required>
                </div>
                <div class="form-group">
                  <label for="editGroup">Meeting Group *</label>
                  <select id="editGroup" required>
                    <option value="">Select group</option>
                    <option value="GENERAL">GENERAL</option>
                    <option value="AUTH">AUTH</option>
                    <option value="PAYMENT">PAYMENT</option>
                    <option value="NOTIFICATION">NOTIFICATION</option>
                    <option value="SEARCH">SEARCH</option>
                    <option value="ANALYTICS">ANALYTICS</option>
                    <option value="USER_MANAGEMENT">USER_MANAGEMENT</option>
                    <option value="ORDER_MANAGEMENT">ORDER_MANAGEMENT</option>
                    <option value="INVENTORY">INVENTORY</option>
                    <option value="BILLING">BILLING</option>
                    <option value="THIRD_PARTY">THIRD_PARTY</option>
                    <option value="API">API</option>
                    <option value="INTEGRATION">INTEGRATION</option>
                    <option value="PERFORMANCE">PERFORMANCE</option>
                    <option value="SECURITY">SECURITY</option>
                    <option value="DATABASE">DATABASE</option>
                    <option value="INFRASTRUCTURE">INFRASTRUCTURE</option>
                    <option value="REQUIREMENTS">REQUIREMENTS</option>
                    <option value="DESIGN">DESIGN</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="PLANNING">PLANNING</option>
                    <option value="BUG_FIX">BUG_FIX</option>
                    <option value="ENHANCEMENT">ENHANCEMENT</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="editPlatform">Platform *</label>
                  <select id="editPlatform" required>
                    <option value="">Select platform</option>
                    <option value="ZOOM">ZOOM</option>
                    <option value="TEAMS">TEAMS</option>
                    <option value="GOOGLE_MEET">GOOGLE_MEET</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="editDescription">Description</label>
                  <textarea id="editDescription" placeholder="Meeting description" rows="3"></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Save Changes</button>
                <button type="button" class="btn btn-secondary" id="cancelEditBtn">Cancel</button>
              </form>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      }

      // Populate form with current data
      document.getElementById('editTitle').value = meeting.title || '';
      document.getElementById('editGroup').value = meeting.meetingGroup || 'GENERAL';
      document.getElementById('editPlatform').value = meeting.platform || 'GOOGLE_MEET';
      document.getElementById('editDescription').value = meeting.description || '';

      // Setup event listeners
      modal.querySelector('#editMeetingForm').onsubmit = async (e) => {
        e.preventDefault();
        try {
          const titleVal = document.getElementById('editTitle').value?.trim();
          const groupVal = document.getElementById('editGroup').value;
          const platformVal = document.getElementById('editPlatform').value;
          const descriptionVal = document.getElementById('editDescription').value?.trim();

          if (!titleVal) {
            alert('Title is required');
            return;
          }
          if (!groupVal) {
            alert('Meeting group is required');
            return;
          }
          if (!platformVal) {
            alert('Platform is required');
            return;
          }

          const updateData = {
            title: titleVal,
            meetingGroup: groupVal,
            platform: platformVal,
            ...(descriptionVal && { description: descriptionVal })
          };

          const response = await meetingsService.updateMeeting(this.entityType, meetingId, updateData);
          console.log('✅ Meeting updated:', response);
          alert('Meeting updated successfully!');
          modal.classList.remove('show');
          await this.loadMeetings();
        } catch (error) {
          console.error('Failed to update meeting:', error);
          alert(`Failed to update meeting: ${error.message}`);
        }
      };

      document.getElementById('closeEditModal').onclick = () => {
        modal.classList.remove('show');
      };
      document.getElementById('cancelEditBtn').onclick = () => {
        modal.classList.remove('show');
      };

      modal.classList.add('show');
    } catch (error) {
      console.error('Failed to open edit modal:', error);
      alert(`Failed to edit meeting: ${error.message}`);
    }
  }

  scheduleMeeting(meetingId) {
    try {
      const newDateTime = prompt('Enter date and time (YYYY-MM-DD HH:MM):');
      if (newDateTime) {
        this.rescheduleMeeting(meetingId);
      }
    } catch (error) {
      console.error('Failed to schedule:', error);
      alert('Failed to schedule meeting');
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VIEW MEETING DETAILS - Navigate to meeting-detail page with participant management
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  viewMeetingDetails(meetingId) {
    try {
      if (!meetingId) {
        console.error('❌ No meeting ID provided');
        alert('No meeting ID found');
        return;
      }

      // Store meeting ID and entity type in localStorage for meeting-detail page
      localStorage.setItem('CURRENT_MEETING', meetingId);
      localStorage.setItem('CURRENT_ENTITY_TYPE', this.entityType);

      // Navigate to meeting-detail page
      window.location.hash = `#/meeting-detail?meetingId=${meetingId}`;
      
      console.log(`✅ Navigating to meeting detail: ${meetingId}`);
    } catch (error) {
      console.error('Failed to view meeting details:', error);
      alert(`Failed to view meeting details: ${error.message}`);
    }
  }
}

// Export class for app.js to initialize when page loads
export { MeetingsPage };
