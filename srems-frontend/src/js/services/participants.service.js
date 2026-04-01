import { API_CONFIG } from '../utils/constants.js';
import { apiClient } from './api.js';

/**
 * Participants Service
 * Handles all participant-related API operations
 */
export const participantsService = {
  /**
   * Add participant
   */
  async addParticipant(participantData) {
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.PARTICIPANTS}/create`,
      participantData
    );
  },

  /**
   * List all participants
   * Backend: /participants/list/:entityType/:meetingId
   */
  async listParticipants(entityType = 'meeting', meetingId = 'all', params = {}) {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.PARTICIPANTS}/list/${entityType}/${meetingId}`
      );
      
      if (!response.success) {
        return [];
      }
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Failed to fetch participants:', error);
      return [];
    }
  },

  /**
   * Get single participant
   */
  async getParticipant(participantId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.PARTICIPANTS}/get/${participantId}`
    );
  },

  /**
   * Update participant
   */
  async updateParticipant(participantId, participantData) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.PARTICIPANTS}/update/${participantId}`,
      participantData
    );
  },

  /**
   * Remove participant
   */
  async removeParticipant(participantId) {
    return apiClient.delete(
      `${API_CONFIG.ENDPOINTS.PARTICIPANTS}/delete/${participantId}`
    );
  },

  /**
   * Get participants by meeting
   */
  async getParticipantsByMeeting(meetingId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.PARTICIPANTS}/list/by-meeting/${meetingId}`
    );
  },

  /**
   * Add multiple participants
   */
  async addBulkParticipants(participantsList) {
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.PARTICIPANTS}/bulk-create`,
      { participants: participantsList }
    );
  },
};
