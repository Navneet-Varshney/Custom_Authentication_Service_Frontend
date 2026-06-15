/**
 * specification.service.js
 * Specification phase management operations
 */

import apiClient from './api.js';

class SpecificationService {
  /**
   * Create specification phase
   * Backend: POST /specifications/create/:projectId
   */
  async createSpecification(projectId, specificationData = {}) {
    return apiClient.post(
      `/phases/create/${projectId}`,
      { phaseType: 'specifications', settings: specificationData }
    );
  }

  /**
   * Get all specifications
   * Backend: GET /phases/list/specifications/:projectId
   */
  async getSpecifications(projectId) {
    try {
      const response = await apiClient.get(
        `/phases/list/specifications/${projectId}`
      );
      
      if (!response.success) {
        return [];
      }
      
      const phases = response.data?.data?.phases || response.data?.phases || response.data || [];
      return Array.isArray(phases) ? phases : [];
    } catch (error) {
      console.error('Failed to fetch specifications:', error);
      return [];
    }
  }

  /**
   * Get latest (active) specification for a project
   * Backend: GET /phases/latest/specifications/:projectId
   */
  async getLatestSpecification(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      const response = await apiClient.get(`/phases/latest/specifications/${projectId}`);
      return response.data?.data?.phase || response.data?.phase || response.data?.data || null;
    } catch (error) {
      console.error('Failed to fetch latest specification:', error);
      return null;
    }
  }

  /**
   * Freeze specification
   * Backend: PATCH /phases/update-status/:projectId
   */
  async freezeSpecification(projectId) {
    return apiClient.patch(
      `/phases/update-status/${projectId}`,
      { phaseType: 'specifications', status: 'COMPLETED' }
    );
  }

  /**
   * Get single specification
   * Backend: GET /phases/get/specifications/:specificationId/:projectId
   */
  async getSpecification(projectId, specificationId) {
    return apiClient.get(
      `/phases/get/specifications/${specificationId}/${projectId}`
    );
  }

  /**
   * Update specification
   * Backend: PATCH /phases/update-settings/:projectId
   */
  async updateSpecification(projectId, specificationId, updateData) {
    return apiClient.patch(
      `/phases/update-settings/${projectId}`,
      { phaseType: 'specifications', settings: { specificationId, ...updateData } }
    );
  }

  /**
   * Delete specification phase
   * Backend: DELETE /phases/delete/:projectId
   */
  async deleteSpecification(projectId, specificationId, deleteData = {}) {
    return apiClient.delete(
      `/phases/delete/${projectId}`,
      { phaseType: 'specifications', specificationId, ...deleteData }
    );
  }
}

export const specificationService = new SpecificationService();
export default specificationService;
