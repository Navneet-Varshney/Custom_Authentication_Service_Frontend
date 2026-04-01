import { meetingsService } from '../js/services/meetings.service.js';

/**
 * Meetings Page Controller
 */
class MeetingsPage {
  constructor() {
    this.meetings = [];
    this.filteredMeetings = [];
    this.editingMeetingId = null;
  }

  async init() {
    this.setupEventListeners();
    await this.loadMeetings();
  }

  setupEventListeners() {
    // Create/New meeting buttons
    const createBtn = document.getElementById('createMeetingBtn') || document.getElementById('newMeetingBtn');
    if (createBtn) {
      createBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openMeetingModal();
      });
    }

    const emptyCreateBtn = document.getElementById('emptyCreateBtn');
    if (emptyCreateBtn) {
      emptyCreateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openMeetingModal();
      });
    }

    // Form submission
    const form = document.getElementById('meetingForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveMeeting();
      });
    }

    // Modal close buttons
    const cancelBtn = document.getElementById('cancelMeetingBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.closeMeetingModal();
      });
    }

    const closeBtn = document.getElementById('closeMeetingModal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeMeetingModal();
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
      const response = await meetingsService.listMeetings();
      this.meetings = response.data || [];
      this.filterMeetings();
      this.renderMeetings();
    } catch (error) {
      console.error('Failed to load meetings:', error);
      this.meetings = [];
      this.renderMeetings();
    }
  }

  filterMeetings() {
    const search = document.getElementById('searchMeetings').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const typeFilter = document.getElementById('filterType').value;

    this.filteredMeetings = this.meetings.filter(meeting => {
      const matchesSearch = !search || 
        meeting.title.toLowerCase().includes(search) ||
        (meeting.description?.toLowerCase().includes(search));
      
      const matchesStatus = !statusFilter || meeting.status === statusFilter;
      const matchesType = !typeFilter || meeting.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    this.renderMeetings();
  }

  renderMeetings() {
    const container = document.getElementById('meetingsList');

    if (!Array.isArray(this.filteredMeetings) || this.filteredMeetings.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📅</div>
          <h3>No Meetings</h3>
          <p>No meetings scheduled yet. Click "Schedule Meeting" to create one.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.filteredMeetings.map(meeting => `
      <div class="meeting-card">
        <div class="card-header">
          <h3>${meeting.title}</h3>
          <span class="badge badge-${meeting.status?.toLowerCase() || 'default'}">${meeting.status || 'PENDING'}</span>
        </div>
        <div class="card-body">
          <div class="meeting-meta">
            <div class="meta-item">
              <span class="meta-label">📅 Date & Time:</span>
              <span ${meeting.dateTime ? '' : 'style="opacity: 0.5;"'}>
                ${meeting.dateTime ? new Date(meeting.dateTime).toLocaleString() : 'Not set'}
              </span>
            </div>
            <div class="meta-item">
              <span class="meta-label">🏷️ Type:</span>
              <span>${meeting.type || 'Other'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">⏱️ Duration:</span>
              <span>${meeting.duration || 'N/A'} minutes</span>
            </div>
            ${meeting.location ? `
              <div class="meta-item">
                <span class="meta-label">📍 Location:</span>
                <span>${meeting.location}</span>
              </div>
            ` : ''}
            ${meeting.description ? `
              <div class="meta-item">
                <span class="meta-label">📝 Description:</span>
                <p>${meeting.description}</p>
              </div>
            ` : ''}
          </div>
          
          ${meeting.participants && Array.isArray(meeting.participants) ? `
            <div class="participants-list">
              <strong>Participants:</strong>
              <div class="participant-tags">
                ${meeting.participants.map(p => `
                  <span class="participant-tag">${p}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
        <div class="card-footer">
          <button class="btn btn-sm btn-secondary" onclick="window.meetingsPage.editMeeting('${meeting._id}')">✏️ Edit</button>
          <button class="btn btn-sm btn-warning" onclick="window.meetingsPage.rescheduleMeeting('${meeting._id}')">🔄 Reschedule</button>
          <button class="btn btn-sm btn-danger" onclick="window.meetingsPage.cancelMeeting('${meeting._id}')">❌ Cancel</button>
        </div>
      </div>
    `).join('');
  }

  openMeetingModal(meetingId = null) {
    this.editingMeetingId = meetingId;
    const modal = document.getElementById('meetingModal');
    const form = document.getElementById('meetingForm');

    if (meetingId) {
      // Edit mode
      document.getElementById('modalTitle').textContent = 'Edit Meeting';
      const meeting = this.meetings.find(m => m._id === meetingId);
      if (meeting) {
        document.getElementById('meetingTitle').value = meeting.title || '';
        document.getElementById('meetingType').value = meeting.type || '';
        document.getElementById('meetingLocation').value = meeting.location || '';
        document.getElementById('meetingDescription').value = meeting.description || '';
        document.getElementById('meetingDuration').value = meeting.duration || 60;
        if (meeting.dateTime) {
          const date = new Date(meeting.dateTime);
          document.getElementById('meetingDate').value = date.toISOString().split('T')[0];
          document.getElementById('meetingTime').value = date.toTimeString().split(' ')[0].slice(0, 5);
        }
      }
    } else {
      // Create mode
      document.getElementById('modalTitle').textContent = 'Schedule Meeting';
      form.reset();
    }

    modal.style.display = 'flex';
  }

  closeMeetingModal() {
    const modal = document.getElementById('meetingModal');
    modal.style.display = 'none';
    this.editingMeetingId = null;
    document.getElementById('meetingForm').reset();
  }

  async saveMeeting() {
    try {
      const meetingData = {
        title: document.getElementById('meetingTitle').value,
        type: document.getElementById('meetingType').value,
        location: document.getElementById('meetingLocation').value,
        description: document.getElementById('meetingDescription').value,
        duration: parseInt(document.getElementById('meetingDuration').value),
        dateTime: new Date(
          `${document.getElementById('meetingDate').value}T${document.getElementById('meetingTime').value}`
        ).toISOString(),
        participants: document.getElementById('meetingParticipants').value
          .split(',')
          .map(p => p.trim())
          .filter(p => p)
      };

      let response;
      if (this.editingMeetingId) {
        response = await meetingsService.updateMeeting(this.editingMeetingId, meetingData);
        alert('Meeting updated successfully!');
      } else {
        response = await meetingsService.createMeeting(meetingData);
        alert('Meeting scheduled successfully!');
      }

      this.closeMeetingModal();
      await this.loadMeetings();
    } catch (error) {
      console.error('Failed to save meeting:', error);
      alert('Failed to save meeting');
    }
  }

  async editMeeting(meetingId) {
    this.openMeetingModal(meetingId);
  }

  async rescheduleMeeting(meetingId) {
    const newDateTime = prompt('Enter new date and time (YYYY-MM-DD HH:MM):');
    if (newDateTime) {
      try {
        await meetingsService.rescheduleMeeting(meetingId, newDateTime);
        alert('Meeting rescheduled successfully!');
        await this.loadMeetings();
      } catch (error) {
        console.error('Failed to reschedule:', error);
        alert('Failed to reschedule meeting');
      }
    }
  }

  async cancelMeeting(meetingId) {
    if (confirm('Are you sure you want to cancel this meeting?')) {
      try {
        await meetingsService.cancelMeeting(meetingId);
        alert('Meeting cancelled successfully!');
        await this.loadMeetings();
      } catch (error) {
        console.error('Failed to cancel:', error);
        alert('Failed to cancel meeting');
      }
    }
  }
}

// Initialize page
const meetingsPage = new MeetingsPage();
window.meetingsPage = meetingsPage;
meetingsPage.init();

export { MeetingsPage };
