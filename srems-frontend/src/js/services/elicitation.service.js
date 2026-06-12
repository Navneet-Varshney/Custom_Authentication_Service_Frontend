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
      `/phases/create/${projectId}`,
      {
        phaseType: 'elicitations',
        settings: {
          mode: data.mode,
          allowParallelMeetings: data.allowParallelMeetings === true
        }
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
        `/phases/list/elicitations/${projectId}`
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
      const response = await apiClient.get(`/phases/latest/elicitations/${projectId}`);
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
      `/phases/update-status/${projectId}`,
      { phaseType: 'elicitations', status: 'COMPLETED' }
    );
  }

  /**
   * Get single elicitation
   * Backend: GET /phases/get/elicitations/:elicitationId/:projectId
   */
  async getElicitation(projectId, elicitationId) {
    return apiClient.get(
      `/phases/get/elicitations/${elicitationId}/${projectId}`
    );
  }

  /**
   * Update elicitation
   * Backend: PATCH /phases/update-settings/:projectId
   */
  async updateElicitation(projectId, elicitationId, updateData) {
    return apiClient.patch(
      `/phases/update-settings/${projectId}`,
      { phaseType: 'elicitations', settings: { elicitationId, ...updateData } }
    );
  }

  /**
   * Delete elicitation
   * Backend: DELETE /phases/delete/:projectId
   */
  async deleteElicitation(projectId, elicitationId, deleteData = {}) {
    return apiClient.delete(
      `/phases/delete/${projectId}`,
      { phaseType: 'elicitations', elicitationId, ...deleteData }
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
