/**
 * inception.service.js
 * Inception management operations
 */

import apiClient from './api.js';
import { API_CONFIG } from '../utils/constants.js';

class InceptionService {
  /**
   * Create inception document
   * Backend: POST /projects/:projectId/inceptions
   */
  async createInception(inceptionData) {
    const { projectId, ...data } = inceptionData;
    return apiClient.post(
      `/projects/${projectId}/inceptions`,
      data
    );
  }

  /**
   * Get all inception documents for a project
   * Backend: GET /projects/:projectId/inceptions
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
        `/projects/${projectId}/inceptions`
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
   * Backend: GET /projects/:projectId/inceptions/:inceptionId
   */
  async getInception(inceptionId, projectId) {
    return apiClient.get(
      `/projects/${projectId}/inceptions/${inceptionId}`
    );
  }

  /**
   * Update inception document
   * Backend: PATCH /projects/:projectId/inceptions/:inceptionId
   */
  async updateInception(projectId, inceptionId, updateData) {
    return apiClient.patch(
      `/projects/${projectId}/inceptions/${inceptionId}`,
      updateData
    );
  }

  /**
   * Delete inception document
   * Backend: DELETE /projects/:projectId/inceptions/:inceptionId
   */
  async deleteInception(projectId, inceptionId, deleteData = {}) {
    return apiClient.delete(
      `/projects/${projectId}/inceptions/${inceptionId}`,
      deleteData
    );
  }

  /**
   * Get inception documents by project
   */
  async getInceptionsByProject(projectId) {
    return apiClient.get(
      `/projects/${projectId}/inceptions`
    );
  }
}

export const inceptionService = new InceptionService();
export default inceptionService;
