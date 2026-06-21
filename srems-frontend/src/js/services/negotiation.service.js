/**
 * negotiation.service.js
 * Negotiation phase management operations
 */

import apiClient from './api.js';

class NegotiationService {
  /**
   * Create negotiation phase
   * Backend: POST /negotiations/create/:projectId
   */
  async createNegotiation(projectId, negotiationData = {}) {
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.PHASES}/create/${projectId}`,
      { phaseType: 'negotiations', ...negotiationData }
    );
  }

  /**
   * Get all negotiations
   * Backend: GET /phases/list/negotiations/:projectId
   */
  async getNegotiations(projectId) {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.PHASES}/list/negotiations/${projectId}`
      );
      
      if (!response.success) {
        return [];
      }
      
      const phases = response.data?.data?.phases || response.data?.phases || response.data || [];
      return Array.isArray(phases) ? phases : [];
    } catch (error) {
      console.error('Failed to fetch negotiations:', error);
      return [];
    }
  }

  /**
   * Get latest (active) negotiation for a project
   * Backend: GET /phases/latest/negotiations/:projectId
   */
  async getLatestNegotiation(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.PHASES}/latest/negotiations/${projectId}`);
      return response.data?.data?.phase || response.data?.phase || response.data?.data || null;
    } catch (error) {
      console.error('Failed to fetch latest negotiation:', error);
      return null;
    }
  }

  /**
   * Freeze negotiation
   * Backend: PATCH /phases/update-status/:projectId
   */
  async freezeNegotiation(projectId) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.PHASES}/update-status/${projectId}`,
      { phaseType: 'negotiations', phaseStatus: 'FROZEN' }
    );
  }

  /**
   * Get single negotiation
   * Backend: GET /phases/get/negotiations/:negotiationId/:projectId
   */
  async getNegotiation(projectId, negotiationId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.PHASES}/get/negotiations/${negotiationId}/${projectId}`
    );
  }

  /**
   * Update negotiation
   * Backend: PATCH /phases/update-settings/:projectId
   */
  async updateNegotiation(projectId, negotiationId, updateData) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.PHASES}/update-settings/${projectId}`,
      { phaseType: 'negotiations', ...updateData }
    );
  }

  /**
   * Delete negotiation phase
   * Backend: DELETE /phases/delete/:projectId
   */
  async deleteNegotiation(projectId, negotiationId, deleteData = {}) {
    return apiClient.delete(
      `${API_CONFIG.ENDPOINTS.PHASES}/delete/${projectId}`,
      { phaseType: 'negotiations', ...deleteData }
    );
  }
}

export const negotiationService = new NegotiationService();
export default negotiationService;
