/**
 * validation.service.js
 * Validation phase management operations
 */

import apiClient from './api.js';

class ValidationService {
  /**
   * Create validation phase
   * Backend: POST /validations/create/:projectId
   */
  async createValidation(projectId, validationData = {}) {
    return apiClient.post(
      `/phases/create/${projectId}`,
      { phaseType: 'validations', settings: validationData }
    );
  }

  /**
   * Get all validations
   * Backend: GET /phases/list/validations/:projectId
   */
  async getValidations(projectId) {
    try {
      const response = await apiClient.get(
        `/phases/list/validations/${projectId}`
      );
      
      if (!response.success) {
        return [];
      }
      
      const phases = response.data?.data?.phases || response.data?.phases || response.data || [];
      return Array.isArray(phases) ? phases : [];
    } catch (error) {
      console.error('Failed to fetch validations:', error);
      return [];
    }
  }

  /**
   * Get latest (active) validation for a project
   * Backend: GET /phases/latest/validations/:projectId
   */
  async getLatestValidation(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      const response = await apiClient.get(`/phases/latest/validations/${projectId}`);
      return response.data?.data?.phase || response.data?.phase || response.data?.data || null;
    } catch (error) {
      console.error('Failed to fetch latest validation:', error);
      return null;
    }
  }

  /**
   * Freeze validation
   * Backend: PATCH /phases/update-status/:projectId
   */
  async freezeValidation(projectId) {
    return apiClient.patch(
      `/phases/update-status/${projectId}`,
      { phaseType: 'validations', status: 'COMPLETED' }
    );
  }

  /**
   * Delete validation phase
   * Backend: DELETE /phases/delete/:projectId
   */
  async deleteValidation(projectId, deleteData = {}) {
    return apiClient.delete(
      `/phases/delete/${projectId}`,
      { phaseType: 'validations', ...deleteData }
    );
  }
}

export const validationService = new ValidationService();
export default validationService;
