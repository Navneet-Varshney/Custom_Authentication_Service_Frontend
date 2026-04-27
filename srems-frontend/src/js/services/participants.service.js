import { API_CONFIG } from '../utils/constants.js';
import { apiClient } from './api.js';

/**
 * Participants Service
 * Handles all participant-related API operations
 * 
 * IMPORTANT: Backend expects linking existing users by userId (USR-prefixed ID)
 * NOT creating new participant profiles
 * 
 * Backend Endpoints:
 * POST   /participants/add/:entityType/:meetingId
 * GET    /participants/list/:entityType/:meetingId
 * GET    /participants/get/:entityType/:meetingId/:participantId
 * PATCH  /participants/update/:entityType/:meetingId
 * PATCH  /participants/remove/:entityType/:meetingId
 */
export const participantsService = {
  /**
   * Add participant to meeting
    * Backend: POST /participants/add/:entityType/:meetingId
   * Response structure: {success: true, data: {participant: {...}}}
   * REQUIRED FIELDS: userId (USR-prefixed custom user ID)
   * OPTIONAL FIELDS: roleDescription
   */
  async addParticipant(entityType, meetingId, participantData) {
    // Backend expects: { userId: "USR1100000", roleDescription?: "SCRIBE" }
    const normalizedData = {
      userId: participantData.userId,  // REQUIRED - USR-prefixed ID like "USR1100000"
      ...(participantData.roleDescription && { roleDescription: participantData.roleDescription })
    };

    const response = await apiClient.post(
      `${API_CONFIG.ENDPOINTS.PARTICIPANTS}/add/${entityType}/${meetingId}`,
      normalizedData
    );
    
    // Backend returns: { success, message, data: participant }
    response.data = response.data?.data || response.data;
    return response;
  },

  /**
   * List all participants for a meeting
   * Backend: GET /participants/list/:entityType/:meetingId
   * Response structure: {success: true, data: {participants: [...], pagination: {...}}}
   * NOTE: meetingId must be a valid MongoDB ObjectId, cannot be 'all'
   */
  async listParticipants(entityType = 'inceptions', meetingId = null) {
    // If no meetingId provided, return empty array - user must select a specific meeting
    if (!meetingId) {
      console.warn('⚠️ No meetingId provided to listParticipants - returning empty array');
      return [];
    }

    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.PARTICIPANTS}/list/${entityType}/${meetingId}`
      );
      
      if (!response.success) {
        return [];
      }
      
      // Backend returns: { success, message, data: participants[], count }
      const participants = response.data?.data || [];
      return Array.isArray(participants) ? participants : [];
    } catch (error) {
      console.error('Failed to fetch participants:', error);
      return [];
    }
  },

  /**
   * Get single participant details
   * Backend: GET /participants/get/:entityType/:meetingId/:participantId
   * Response structure: {success: true, data: {participant: {...}}}
   */
  async getParticipant(entityType, meetingId, participantId) {
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.PARTICIPANTS}/get/${entityType}/${meetingId}/${participantId}`
    );
    
    // Backend returns: { success, message, data: participant }
    response.data = response.data?.data || response.data;
    return response;
  },

  /**
   * Update participant
   * Backend: PATCH /participants/update/:entityType/:meetingId
   * Response structure: {success: true, data: {participant: {...}}}
   * REQUIRED FIELDS: userId
   * OPTIONAL FIELDS: roleDescription
   */
  async updateParticipant(entityType, meetingId, participantData) {
    const normalizedData = {
      userId: participantData.userId,  // REQUIRED
      ...(participantData.roleDescription && { roleDescription: participantData.roleDescription })
    };

    const response = await apiClient.patch(
      `${API_CONFIG.ENDPOINTS.PARTICIPANTS}/update/${entityType}/${meetingId}`,
      normalizedData
    );
    
    // Backend returns: { success, message, data: participant }
    response.data = response.data?.data || response.data;
    return response;
  },

  /**
   * Remove participant from meeting
   * Backend: PATCH /participants/remove/:entityType/:meetingId
   * Response structure: {success: true, data: {participant: {...}}}
   * REQUIRED FIELDS: userId
   * OPTIONAL FIELDS: removeReason
   */
  async removeParticipant(entityType, meetingId, userId, removeReason = null) {
    const removeData = {
      userId,
      ...(removeReason ? { removeReason } : {})
    };

    const response = await apiClient.patch(
      `${API_CONFIG.ENDPOINTS.PARTICIPANTS}/remove/${entityType}/${meetingId}`,
      removeData
    );
    
    // Backend returns: { success, message, data: participant }
    response.data = response.data?.data || response.data;
    return response;
  }
};
