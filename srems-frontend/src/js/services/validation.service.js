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
      `${API_CONFIG.ENDPOINTS.PHASES}/create/${projectId}`,
      { phaseType: 'validations', ...validationData }
    );
  }

  /**
   * Get all validations
   * Backend: GET /phases/list/validations/:projectId
   */
  async getValidations(projectId) {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.PHASES}/list/validations/${projectId}`
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
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.PHASES}/latest/validations/${projectId}`);
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
      `${API_CONFIG.ENDPOINTS.PHASES}/update-status/${projectId}`,
      { phaseType: 'validations', phaseStatus: 'FROZEN' }
    );
  }

  /**
   * Delete validation phase
   * Backend: DELETE /phases/delete/:projectId
   */
  async deleteValidation(projectId, deleteData = {}) {
    return apiClient.delete(
      `${API_CONFIG.ENDPOINTS.PHASES}/delete/${projectId}`,
      { phaseType: 'validations', ...deleteData }
    );
  }
}

export const validationService = new ValidationService();
export default validationService;
