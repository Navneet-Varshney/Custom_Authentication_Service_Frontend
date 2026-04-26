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
 * POST   /participants/create/:entityType/:meetingId
 * GET    /participants/list/:entityType/:meetingId
 * GET    /participants/get/:entityType/:participantId
 * PATCH  /participants/update/:entityType/:participantId
 * DELETE /participants/delete/:entityType/:participantId
 */
export const participantsService = {
  /**
   * Add participant to meeting
   * Backend: POST /participants/create/:entityType/:meetingId
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
      `${API_CONFIG.ENDPOINTS.PARTICIPANTS}/create/${entityType}/${meetingId}`,
      normalizedData
    );
    
    // Backend returns: {data: {participant: {...}}}
    response.data = response.data?.participant || response.data;
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
      
      // Backend returns: {data: {participants: [...], pagination: {...}}}
      const participants = response.data?.participants || [];
      return Array.isArray(participants) ? participants : [];
    } catch (error) {
      console.error('Failed to fetch participants:', error);
      return [];
    }
  },

  /**
   * Get single participant details
   * Backend: GET /participants/get/:entityType/:participantId
   * Response structure: {success: true, data: {participant: {...}}}
   */
  async getParticipant(entityType, participantId) {
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.PARTICIPANTS}/get/${entityType}/${participantId}`
    );
    
    // Backend returns: {data: {participant: {...}}}
    response.data = response.data?.participant || response.data;
    return response;
  },

  /**
   * Update participant
   * Backend: PATCH /participants/update/:entityType/:participantId
   * Response structure: {success: true, data: {participant: {...}}}
   * REQUIRED FIELDS: userId
   * OPTIONAL FIELDS: roleDescription
   */
  async updateParticipant(entityType, participantId, participantData) {
    const normalizedData = {
      userId: participantData.userId,  // REQUIRED
      ...(participantData.roleDescription && { roleDescription: participantData.roleDescription })
    };

    const response = await apiClient.patch(
      `${API_CONFIG.ENDPOINTS.PARTICIPANTS}/update/${entityType}/${participantId}`,
      normalizedData
    );
    
    // Backend returns: {data: {participant: {...}}}
    response.data = response.data?.participant || response.data;
    return response;
  },

  /**
   * Remove participant from meeting
   * Backend: PATCH /participants/remove/:entityType/:participantId
   * Response structure: {success: true, data: {participant: {...}}}
   * OPTIONAL FIELDS: removeReason
   */
  async removeParticipant(entityType, participantId, removeReason = null) {
    const removeData = removeReason ? { removeReason } : {};

    const response = await apiClient.patch(
      `${API_CONFIG.ENDPOINTS.PARTICIPANTS}/remove/${entityType}/${participantId}`,
      removeData
    );
    
    // Backend returns: {data: {participant: {...}}}
    response.data = response.data?.participant || response.data;
    return response;
  }
};
