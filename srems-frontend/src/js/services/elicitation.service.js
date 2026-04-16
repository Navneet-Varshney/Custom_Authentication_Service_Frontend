/**
 * elicitation.service.js
 * Elicitation management operations
 */

import apiClient from './api.js';
import { API_CONFIG } from '../utils/constants.js';

class ElicitationService {
  /**
   * Create elicitation
   * Backend: POST /projects/:projectId/elicitations
   */
  async createElicitation(elicitationData) {
    const { projectId, ...data } = elicitationData;
    return apiClient.post(
      `/projects/${projectId}/elicitations`,
      data
    );
  }

  /**
   * Get all elicitations
   * Backend: GET /projects/:projectId/elicitations
   */
  async getElicitations(projectId, page = 1, pageSize = 10) {
    try {
      const response = await apiClient.get(
        `/projects/${projectId}/elicitations`
      );
      
      if (!response.success) {
        return [];
      }
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Failed to fetch elicitations:', error);
      return [];
    }
  }

  /**
   * Get single elicitation
   * Backend: GET /projects/:projectId/elicitations/:elicitationId
   */
  async getElicitation(projectId, elicitationId) {
    return apiClient.get(
      `/projects/${projectId}/elicitations/${elicitationId}`
    );
  }

  /**
   * Update elicitation
   * Backend: PATCH /projects/:projectId/elicitations/:elicitationId
   */
  async updateElicitation(projectId, elicitationId, updateData) {
    return apiClient.patch(
      `/projects/${projectId}/elicitations/${elicitationId}`,
      updateData
    );
  }

  /**
   * Delete elicitation
   * Backend: DELETE /projects/:projectId/elicitations/:elicitationId
   */
  async deleteElicitation(projectId, elicitationId, deleteData = {}) {
    return apiClient.delete(
      `/projects/${projectId}/elicitations/${elicitationId}`,
      deleteData
    );
  }

  /**
   * Get elicitations by project
   */
  async getElicitationsByProject(projectId) {
    return apiClient.get(
      `/projects/${projectId}/elicitations`
    );
  }
}

export const elicitationService = new ElicitationService();
export default elicitationService;
