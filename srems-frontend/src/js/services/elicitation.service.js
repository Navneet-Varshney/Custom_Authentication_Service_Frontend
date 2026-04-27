/**
 * elicitation.service.js
 * Elicitation management operations
 */

import apiClient from './api.js';
import { API_CONFIG } from '../utils/constants.js';

class ElicitationService {
  /**
   * Create elicitation
   * Backend: POST /elicitations/create/:projectId
   */
  async createElicitation(elicitationData) {
    const { projectId, ...data } = elicitationData;
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.ELICITATION}/create/${projectId}`,
      data
    );
  }

  /**
   * Get all elicitations
   * Backend: GET /elicitations/list/:projectId
   */
  async getElicitations(projectId, page = 1, pageSize = 10) {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.ELICITATION}/list/${projectId}`
      );
      
      if (!response.success) {
        return [];
      }
      
      return Array.isArray(response.data?.data?.elicitations) ? response.data.data.elicitations : [];
    } catch (error) {
      console.error('Failed to fetch elicitations:', error);
      return [];
    }
  }

  /**
   * Get latest (active) elicitation for a project
   * Backend: GET /elicitations/latest/:projectId
   */
  async getLatestElicitation(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.ELICITATION}/latest/${projectId}`);
      return response.data?.data?.elicitation || null;
    } catch (error) {
      console.error('Failed to fetch latest elicitation:', error);
      return null;
    }
  }

  /**
   * Get single elicitation
   * Backend: GET /elicitations/get/:elicitationId
   */
  async getElicitation(projectId, elicitationId) {
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.ELICITATION}/get/${elicitationId}`
    );

    response.data = response.data?.data?.elicitation || response.data?.elicitation || response.data;
    return response;
  }

  /**
   * Update elicitation
   * Backend: PATCH /elicitations/update/:projectId
   */
  async updateElicitation(projectId, elicitationId, updateData) {
    const response = await apiClient.patch(
      `${API_CONFIG.ENDPOINTS.ELICITATION}/update/${projectId}`,
      { elicitationId, ...updateData }
    );

    response.data = response.data?.data?.elicitation || response.data?.elicitation || response.data;
    return response;
  }

  /**
   * Delete elicitation
   * Backend: DELETE /elicitations/delete/:projectId
   */
  async deleteElicitation(projectId, elicitationId, deleteData = {}) {
    return apiClient.delete(
      `${API_CONFIG.ENDPOINTS.ELICITATION}/delete/${projectId}`,
      { elicitationId, ...deleteData }
    );
  }

  /**
   * Get elicitations by project
   */
  async getElicitationsByProject(projectId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.ELICITATION}/list/${projectId}`
    );
  }
}

export const elicitationService = new ElicitationService();
export default elicitationService;
