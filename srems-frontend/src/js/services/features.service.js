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
  async createFeature(projectId, featureData) {
    const payload = {
      ...featureData,
      title: featureData.title || featureData.name
    };

    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.HIGH_LEVEL_FEATURES}/create/${projectId}`,
      payload
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
    
    // Backend response: { success, message, data: { hlfs, pagination } }
    return response.data?.data?.hlfs || [];
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
    const payload = {
      ...updateData,
      ...(updateData.name ? { title: updateData.name } : {})
    };

    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.HIGH_LEVEL_FEATURES}/update/${featureId}`,
      payload
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
   * NOTE: Backend does not currently expose this nested endpoint
   * TODO: Either implement backend endpoint GET /high-level-features/:hlfId/requirements
   *       OR remove this method if feature requirements should be fetched separately
   */
  async getFeatureRequirements(featureId) {
    console.warn('getFeatureRequirements() calls non-existent backend endpoint. Requires backend implementation.');
    // Temporary fallback - fetch all requirements and filter by featureId
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.REQUIREMENTS}/list`
      );
      if (!response.success) {
        throw new Error('Failed to fetch requirements');
      }
      // Filter requirements by parentFeatureId
      const allRequirements = response.data || [];
      return allRequirements.filter(req => req.parentFeatureId === featureId);
    } catch (error) {
      console.error('Error fetching feature requirements:', error);
      throw new Error('Unable to fetch requirements linked to feature');
    }
  }
}

export const featuresService = new FeaturesService();
export default featuresService;
