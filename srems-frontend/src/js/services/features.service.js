/**
 * features.service.js
 * High-Level Features management
 */

import apiClient from './api.js';
import { API_CONFIG } from '../utils/constants.js';

class FeaturesService {
  /**
   * Create high-level feature
   */
  async createFeature(featureData) {
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.HIGH_LEVEL_FEATURES}/create/${featureData.projectId}`,
      featureData
    );
  }

  /**
   * Get features by project
   */
  async getFeaturesByProject(projectId) {
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.HIGH_LEVEL_FEATURES}/list/${projectId}`
    );
    
    // Check if response was successful
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch features');
    }
    
    // Return the data array
    return response.data || [];
  }

  /**
   * Get feature by ID
   */
  async getFeatureById(featureId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.HIGH_LEVEL_FEATURES}/get/${featureId}`
    );
  }

  /**
   * Update feature
   */
  async updateFeature(featureId, updateData) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.HIGH_LEVEL_FEATURES}/update/${featureId}`,
      updateData
    );
  }

  /**
   * Delete feature
   */
  async deleteFeature(featureId) {
    return apiClient.delete(
      `${API_CONFIG.ENDPOINTS.HIGH_LEVEL_FEATURES}/delete/${featureId}`
    );
  }

  /**
   * Get requirements linked to feature
   */
  async getFeatureRequirements(featureId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.HIGH_LEVEL_FEATURES}/${featureId}/requirements`
    );
  }
}

export const featuresService = new FeaturesService();
export default featuresService;
