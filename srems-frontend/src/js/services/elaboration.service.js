/**
 * elaboration.service.js
 * Elaboration management operations
 */

import apiClient from './api.js';
import { API_CONFIG } from '../utils/constants.js';

class ElaborationService {
  /**
   * Create elaboration
   * Backend: POST /elaborations/create/:projectId
   */
  async createElaboration(elaborationData) {
    const { projectId, ...data } = elaborationData;
    return apiClient.post(
      `/phases/create/${projectId}`,
      { phaseType: 'elaborations', settings: data }
    );
  }

  /**
   * Get all elaborations
   * Backend: GET /phases/list/elaborations/:projectId
   */
  async getElaborations(projectId) {
    try {
      const response = await apiClient.get(
        `/phases/list/elaborations/${projectId}`
      );
      
      if (!response.success) {
        return [];
      }
      
      const phases = response.data?.data?.phases || response.data?.phases || response.data || [];
      return Array.isArray(phases) ? phases : [];
    } catch (error) {
      console.error('Failed to fetch elaborations:', error);
      return [];
    }
  }

  /**
   * Get single elaboration
   * Backend: GET /phases/get/elaborations/:elaborationId/:projectId
   */
  async getElaboration(projectId, elaborationId) {
    return apiClient.get(
      `/phases/get/elaborations/${elaborationId}/${projectId}`
    );
  }

  /**
   * Update elaboration
   * Backend: PATCH /phases/update-settings/:projectId
   */
  async updateElaboration(projectId, elaborationId, updateData) {
    return apiClient.patch(
      `/phases/update-settings/${projectId}`,
      { phaseType: 'elaborations', settings: { elaborationId, ...updateData } }
    );
  }

  /**
   * Delete elaboration
   * Backend: DELETE /phases/delete/:projectId
   */
  async deleteElaboration(projectId, elaborationId, deleteData = {}) {
    return apiClient.delete(
      `/phases/delete/${projectId}`,
      { phaseType: 'elaborations', elaborationId, ...deleteData }
    );
  }

  /**
   * Get elaborations by project
   */
  async getElaborationsByProject(projectId) {
    return this.getElaborations(projectId);
  }

  /**
   * Get latest (active) elaboration for a project
   * Backend: GET /phases/latest/elaborations/:projectId
   */
  async getLatestElaboration(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      const response = await apiClient.get(`/phases/latest/elaborations/${projectId}`);
      return response.data?.data?.phase || response.data?.phase || response.data?.data || null;
    } catch (error) {
      console.error('Failed to fetch latest elaboration:', error);
      return null;
    }
  }

  /**
   * Freeze elaboration
   * Backend: PATCH /phases/update-status/:projectId
   */
  async freezeElaboration(projectId) {
    return apiClient.patch(
      `/phases/update-status/${projectId}`,
      { phaseType: 'elaborations', status: 'COMPLETED' }
    );
  }

}

export const elaborationService = new ElaborationService();
export default elaborationService;
