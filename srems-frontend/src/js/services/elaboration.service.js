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
      `${API_CONFIG.ENDPOINTS.ELABORATION}/create/${projectId}`,
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
        `${API_CONFIG.ENDPOINTS.ELABORATION}/list/${projectId}?pageNumber=${page}&pageSize=${pageSize}`
      );
      
      if (!response.success) {
        return [];
      }
      
      return Array.isArray(response.data?.data?.elaborations) ? response.data.data.elaborations : [];
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
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.ELABORATION}/get/${elaborationId}`
    );

    response.data = response.data?.data?.elaboration || response.data?.elaboration || response.data;
    return response;
  }

  /**
   * Update elaboration
   * Backend: PATCH /projects/:projectId/elaborations/:elaborationId
   */
  async updateElaboration(projectId, elaborationId, updateData) {
    const response = await apiClient.patch(
      `${API_CONFIG.ENDPOINTS.ELABORATION}/update/${projectId}`,
      { elaborationId, ...updateData }
    );

    response.data = response.data?.data?.elaboration || response.data?.elaboration || response.data;
    return response;
  }

  /**
   * Delete elaboration
   * Backend: DELETE /projects/:projectId/elaborations/:elaborationId
   */
  async deleteElaboration(projectId, elaborationId, deleteData = {}) {
    return apiClient.delete(
      `${API_CONFIG.ENDPOINTS.ELABORATION}/delete/${projectId}`,
      { elaborationId, ...deleteData }
    );
  }

  /**
   * Get elaborations by project
   */
  async getElaborationsByProject(projectId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.ELABORATION}/list/${projectId}`
    );
  }
}

export const elaborationService = new ElaborationService();
export default elaborationService;
