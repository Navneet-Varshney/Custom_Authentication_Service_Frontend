/**
 * inception.service.js
 * Inception management operations
 */

import apiClient from './api.js';
import { API_CONFIG } from '../utils/constants.js';

class InceptionService {
  /**
   * Create inception document
   * Backend: POST /inceptions/create/:projectId
   */
  async createInception(projectIdOrData, dataPayload = {}) {
    let projectId, data;
    if (typeof projectIdOrData === 'object' && projectIdOrData !== null) {
      const { projectId: pid, ...rest } = projectIdOrData;
      projectId = pid;
      data = rest;
    } else {
      projectId = projectIdOrData;
      data = dataPayload;
    }
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.PHASES}/create/${projectId}`,
      { phaseType: 'inceptions', workflowMode: data?.workflowMode, phaseStatus: data?.phaseStatus }
    );
  }

  /**
   * Get all inception documents for a project
   * Backend: GET /phases/list/inceptions/:projectId
   * @param {string} projectId - MongoDB ObjectId of the project (REQUIRED)
   * @returns {Array} List of inception documents or empty array on error
   */
  async getInceptions(projectId, page = 1, pageSize = 10) {
    try {
      console.debug('InceptionService.getInceptions called', { projectId, page, pageSize });
      if (!projectId) {
        throw new Error('Project ID is required to fetch inceptions');
      }

      const mongoIdRegex = /^[a-f\d]{24}$/i;
      if (!mongoIdRegex.test(projectId)) {
        throw new Error('Invalid project ID format');
      }

      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.PHASES}/list/inceptions/${projectId}`
      );
      
      if (!response.success) {
        return [];
      }
      
      const phases = response.data?.data?.phases || response.data?.phases || response.data || [];
      return Array.isArray(phases) ? phases : [];
    } catch (error) {
      console.error('Failed to fetch inceptions:', error);
      throw error;
    }
  }

  /**
   * Get latest (active) inception for a project
   * Backend: GET /phases/latest/inceptions/:projectId
   */
  async getLatestInception(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.PHASES}/latest/inceptions/${projectId}`);
      return response.data?.data?.phase || response.data?.phase || response.data || null;
    } catch (error) {
      console.error('Failed to fetch latest inception:', error);
      return null;
    }
  }

  /**
   * Get single inception document
   * Backend: GET /phases/get/inceptions/:inceptionId/:projectId
   */
  async getInception(inceptionId, projectId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.PHASES}/get/inceptions/${inceptionId}/${projectId}`
    );
  }

  /**
   * Update inception document
   * Backend: PATCH /phases/update-settings/:projectId
   */
  async updateInception(projectId, inceptionId, updateData) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.PHASES}/update-settings/${projectId}`,
      { phaseType: 'inceptions', ...updateData }
    );
  }

  /**
   * Freeze inception document
   * Backend: PATCH /phases/update-status/:projectId
   */
  async freezeInception(projectId) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.PHASES}/update-status/${projectId}`,
      { phaseType: 'inceptions', phaseStatus: 'FROZEN' }
    );
  }

  /**
   * Delete inception document
   * Backend: DELETE /phases/delete/:projectId
   */
  async deleteInception(projectId, inceptionId, deleteData = {}) {
    return apiClient.delete(
      `${API_CONFIG.ENDPOINTS.PHASES}/delete/${projectId}`,
      { phaseType: 'inceptions', ...deleteData }
    );
  }

  /**
   * Get inception documents by project
   */
  async getInceptionsByProject(projectId) {
    return this.getInceptions(projectId);
  }
}

export const inceptionService = new InceptionService();
export default inceptionService;
