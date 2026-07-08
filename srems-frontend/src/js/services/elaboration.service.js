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
  async createElaboration(projectIdOrData, dataPayload = {}) {
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
      { phaseType: 'elaborations', allowParallelMeetings: data?.allowParallelMeetings === true, workflowMode: data?.workflowMode }
    );
  }

  /**
   * Get all elaborations
   * Backend: GET /phases/list/elaborations/:projectId
   */
  async getElaborations(projectId) {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.PHASES}/list/elaborations/${projectId}`
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
      `${API_CONFIG.ENDPOINTS.PHASES}/get/elaborations/${elaborationId}/${projectId}`
    );
  }

  /**
   * Update elaboration
   * Backend: PATCH /phases/update-settings/:projectId
   */
  async updateElaboration(projectId, elaborationId, updateData) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.PHASES}/update-settings/${projectId}`,
      { phaseType: 'elaborations', ...updateData }
    );
  }

  /**
   * Delete elaboration
   * Backend: DELETE /phases/delete/:projectId
   */
  async deleteElaboration(projectId, elaborationId, deleteData = {}) {
    return apiClient.delete(
      `${API_CONFIG.ENDPOINTS.PHASES}/delete/${projectId}`,
      { phaseType: 'elaborations', ...deleteData }
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
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.PHASES}/latest/elaborations/${projectId}`);
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
      `${API_CONFIG.ENDPOINTS.PHASES}/update-status/${projectId}`,
      { phaseType: 'elaborations', phaseStatus: 'FROZEN' }
    );
  }

}

export const elaborationService = new ElaborationService();
export default elaborationService;
