/**
 * inception.service.js
 * Inception management operations
 */

import apiClient from './api.js';
import { API_CONFIG } from '../utils/constants.js';

class InceptionService {
  /**
   * Create inception document
   */
  async createInception(inceptionData) {
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.INCEPTION}/create`,
      inceptionData
    );
  }

  /**
   * Get all inception documents
   * Backend requires: /inceptions/list/:projectId
   * Using fallback projectId if not provided
   */
  async getInceptions(projectId = 'all', page = 1, pageSize = 10) {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.INCEPTION}/list/${projectId}`
      );
      
      if (!response.success) {
        // Return empty array instead of throwing to show "No data" state
        return [];
      }
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Failed to fetch inceptions:', error);
      return [];  // Fallback to empty array
    }
  }

  /**
   * Get single inception document
   */
  async getInception(inceptionId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.INCEPTION}/get/${inceptionId}`
    );
  }

  /**
   * Update inception document
   */
  async updateInception(inceptionId, updateData) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.INCEPTION}/update/${inceptionId}`,
      updateData
    );
  }

  /**
   * Delete inception document
   */
  async deleteInception(inceptionId) {
    return apiClient.delete(
      `${API_CONFIG.ENDPOINTS.INCEPTION}/delete/${inceptionId}`
    );
  }

  /**
   * Get inception documents by project
   */
  async getInceptionsByProject(projectId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.INCEPTION}/project/${projectId}`
    );
  }
}

export const inceptionService = new InceptionService();
export default inceptionService;
