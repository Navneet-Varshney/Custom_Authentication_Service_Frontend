/**
 * elicitation.service.js
 * Elicitation management operations
 */

import apiClient from './api.js';

class ElicitationService {
  normalizeElicitation(elicitation) {
    if (!elicitation) return null;

    const normalizedId = elicitation._id || elicitation.id;
    return {
      ...elicitation,
      _id: normalizedId,
      id: normalizedId,
      elicitationMode: elicitation.elicitationMode || elicitation.mode || elicitation.method || null
    };
  }

  normalizeList(response) {
    const payload = response?.data;
    const elicitations = payload?.data?.elicitations || payload?.elicitations || payload?.data || payload || [];
    return Array.isArray(elicitations) ? elicitations.map((item) => this.normalizeElicitation(item)) : [];
  }

  /**
   * Create elicitation
   * Backend: POST /elicitations/create/:projectId
   */
  async createElicitation(elicitationData) {
    const { projectId, ...data } = elicitationData;
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.PHASES}/create/${projectId}`,
      {
        phaseType: 'elicitations',
        workflowMode: data.mode,
        allowParallelMeetings: data.allowParallelMeetings === true
      }
    );
  }

  /**
   * Get all elicitations
   * Backend: GET /phases/list/elicitations/:projectId
   */
  async getElicitations(projectId, page = 1, pageSize = 10) {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.PHASES}/list/elicitations/${projectId}`
      );
      
      if (!response.success) {
        return [];
      }
      
      return this.normalizeList(response);
    } catch (error) {
      console.error('Failed to fetch elicitations:', error);
      return [];
    }
  }

  /**
   * Get latest (active) elicitation for a project
   * Backend: GET /phases/latest/elicitations/:projectId
   */
  async getLatestElicitation(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.PHASES}/latest/elicitations/${projectId}`);
      return this.normalizeElicitation(response.data?.data?.phase || response.data?.phase || response.data?.data || null);
    } catch (error) {
      console.error('Failed to fetch latest elicitation:', error);
      return null;
    }
  }

  /**
   * Freeze elicitation
   * Backend: PATCH /phases/update-status/:projectId
   */
  async freezeElicitation(projectId) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.PHASES}/update-status/${projectId}`,
      { phaseType: 'elicitations', phaseStatus: 'FROZEN' }
    );
  }

  /**
   * Get single elicitation
   * Backend: GET /phases/get/elicitations/:elicitationId/:projectId
   */
  async getElicitation(projectId, elicitationId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.PHASES}/get/elicitations/${elicitationId}/${projectId}`
    );
  }

  /**
   * Update elicitation
   * Backend: PATCH /phases/update-settings/:projectId
   */
  async updateElicitation(projectId, elicitationId, updateData) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.PHASES}/update-settings/${projectId}`,
      { phaseType: 'elicitations', ...updateData }
    );
  }

  /**
   * Delete elicitation
   * Backend: DELETE /phases/delete/:projectId
   */
  async deleteElicitation(projectId, elicitationId, deleteData = {}) {
    return apiClient.delete(
      `${API_CONFIG.ENDPOINTS.PHASES}/delete/${projectId}`,
      { phaseType: 'elicitations', ...deleteData }
    );
  }

  /**
   * Get elicitations by project
   */
  async getElicitationsByProject(projectId) {
    return this.getElicitations(projectId);
  }
}

export const elicitationService = new ElicitationService();
export default elicitationService;
