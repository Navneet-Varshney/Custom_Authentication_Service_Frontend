import { API_CONFIG } from '../utils/constants.js';
import { apiClient } from './api.js';

/**
 * Meetings Service
 * Handles all meeting-related API operations
 */
export const meetingsService = {
  /**
   * Create new meeting
   */
  async createMeeting(meetingData) {
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.MEETINGS}/create`,
      meetingData
    );
  },

  /**
   * List all meetings
   * Backend: /meetings/list/:entityType/:projectId
   */
  async listMeetings(entityType = 'project', projectId = 'all', params = {}) {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.MEETINGS}/list/${entityType}/${projectId}`
      );
      
      if (!response.success) {
        return [];
      }
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
      return [];
    }
  },

  /**
   * Get single meeting
   */
  async getMeeting(meetingId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.MEETINGS}/get/${meetingId}`
    );
  },

  /**
   * Update meeting
   */
  async updateMeeting(meetingId, meetingData) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.MEETINGS}/update/${meetingId}`,
      meetingData
    );
  },

  /**
   * Delete meeting
   */
  async deleteMeeting(meetingId) {
    return apiClient.delete(
      `${API_CONFIG.ENDPOINTS.MEETINGS}/delete/${meetingId}`
    );
  },

  /**
   * Schedule meeting
   */
  async scheduleMeeting(meetingData) {
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.MEETINGS}/schedule`,
      meetingData
    );
  },

  /**
   * Cancel meeting
   */
  async cancelMeeting(meetingId) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.MEETINGS}/cancel/${meetingId}`
    );
  },

  /**
   * Reschedule meeting
   */
  async rescheduleMeeting(meetingId, newDateTime) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.MEETINGS}/reschedule/${meetingId}`,
      { dateTime: newDateTime }
    );
  },
};
