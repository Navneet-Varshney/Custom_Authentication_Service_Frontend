/**
 * elicitation.service.js
 * Elicitation management operations
 */

import apiClient from './api.js';
import { API_CONFIG } from '../utils/constants.js';

class ElicitationService {
  /**
   * Create elicitation
   */
  async createElicitation(elicitationData) {
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.ELICITATION}/create`,
      elicitationData
    );
  }

  /**
   * Get all elicitations
   * Backend requires: /elicitations/list/:projectId
   * Using fallback projectId if not provided
   */
  async getElicitations(projectId = 'all', page = 1, pageSize = 10) {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.ELICITATION}/list/${projectId}`
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
   */
  async getElicitation(elicitationId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.ELICITATION}/get/${elicitationId}`
    );
  }

  /**
   * Update elicitation
   */
  async updateElicitation(elicitationId, updateData) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.ELICITATION}/update/${elicitationId}`,
      updateData
    );
  }

  /**
   * Delete elicitation
   */
  async deleteElicitation(elicitationId) {
    return apiClient.delete(
      `${API_CONFIG.ENDPOINTS.ELICITATION}/delete/${elicitationId}`
    );
  }

  /**
   * Get elicitations by project
   */
  async getElicitationsByProject(projectId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.ELICITATION}/project/${projectId}`
    );
  }
}

export const elicitationService = new ElicitationService();
export default elicitationService;
