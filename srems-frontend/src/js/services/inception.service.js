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
   * Get all inception documents for a project
   * Backend requires: /inceptions/list/:projectId where projectId is MongoDB ObjectId
   * @param {string} projectId - MongoDB ObjectId of the project (REQUIRED)
   * @returns {Array} List of inception documents or empty array on error
   */
  async getInceptions(projectId, page = 1, pageSize = 10) {
    try {
      // Validate projectId is provided and is a valid MongoDB ObjectId format
      if (!projectId) {
        throw new Error('Project ID is required to fetch inceptions');
      }

      // MongoDB ObjectId regex: 24 hex characters
      const mongoIdRegex = /^[a-f\d]{24}$/i;
      if (!mongoIdRegex.test(projectId)) {
        throw new Error('Invalid project ID format');
      }

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
      throw error; // Propagate error to page handler
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
