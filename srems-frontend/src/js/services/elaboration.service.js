/**
 * elaboration.service.js
 * Elaboration management operations
 */

import apiClient from './api.js';
import { API_CONFIG } from '../utils/constants.js';

class ElaborationService {
  /**
   * Create elaboration
   * Backend: POST /projects/:projectId/elaborations
   */
  async createElaboration(elaborationData) {
    const { projectId, ...data } = elaborationData;
    return apiClient.post(
      `/projects/${projectId}/elaborations`,
      data
    );
  }

  /**
   * Get all elaborations
   * Backend: GET /projects/:projectId/elaborations
   */
  async getElaborations(projectId, page = 1, pageSize = 10) {
    try {
      const response = await apiClient.get(
        `/projects/${projectId}/elaborations`
      );
      
      if (!response.success) {
        return [];
      }
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Failed to fetch elaborations:', error);
      return [];
    }
  }

  /**
   * Get single elaboration
   * Backend: GET /projects/:projectId/elaborations/:elaborationId
   */
  async getElaboration(projectId, elaborationId) {
    return apiClient.get(
      `/projects/${projectId}/elaborations/${elaborationId}`
    );
  }

  /**
   * Update elaboration
   * Backend: PATCH /projects/:projectId/elaborations/:elaborationId
   */
  async updateElaboration(projectId, elaborationId, updateData) {
    return apiClient.patch(
      `/projects/${projectId}/elaborations/${elaborationId}`,
      updateData
    );
  }

  /**
   * Delete elaboration
   * Backend: DELETE /projects/:projectId/elaborations/:elaborationId
   */
  async deleteElaboration(projectId, elaborationId, deleteData = {}) {
    return apiClient.delete(
      `/projects/${projectId}/elaborations/${elaborationId}`,
      deleteData
    );
  }

  /**
   * Get elaborations by project
   */
  async getElaborationsByProject(projectId) {
    return apiClient.get(
      `/projects/${projectId}/elaborations`
    );
  }
}

export const elaborationService = new ElaborationService();
export default elaborationService;
