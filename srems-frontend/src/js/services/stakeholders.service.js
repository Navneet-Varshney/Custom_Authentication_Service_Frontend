/**
 * stakeholders.service.js
 * Stakeholder management operations
 */

import apiClient from './api.js';
import { API_CONFIG } from '../utils/constants.js';

class StakeholdersService {
  /**
   * Add stakeholder to project
   */
  async addStakeholder(stakeholderData) {
    return apiClient.post(`${API_CONFIG.ENDPOINTS.STAKEHOLDERS}/create`, stakeholderData);
  }

  /**
   * Get all stakeholders
   */
  async getStakeholders(page = 1, pageSize = 10) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.STAKEHOLDERS}/list?page=${page}&pageSize=${pageSize}`
    );
  }

  /**
   * Get stakeholder by ID
   */
  async getStakeholderById(stakeholderId) {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.STAKEHOLDERS}/get/${stakeholderId}`);
  }

  /**
   * Update stakeholder
   */
  async updateStakeholder(stakeholderId, updateData) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.STAKEHOLDERS}/update/${stakeholderId}`,
      updateData
    );
  }

  /**
   * Remove stakeholder from project
   */
  async deleteStakeholder(stakeholderId) {
    return apiClient.delete(`${API_CONFIG.ENDPOINTS.STAKEHOLDERS}/delete/${stakeholderId}`);
  }

  /**
   * Get stakeholders by project ID
   */
  async getProjectStakeholders(projectId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.STAKEHOLDERS}/list?projectId=${projectId}`
    );
  }
}

export const stakeholdersService = new StakeholdersService();
export default stakeholdersService;
