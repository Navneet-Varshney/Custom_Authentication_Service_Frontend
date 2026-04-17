/**
 * elicitation.service.js
 * Elicitation management operations
 */

import apiClient from './api.js';
import { API_CONFIG } from '../utils/constants.js';

class ElicitationService {
  /**
   * Create elicitation
   * Backend: POST /elicitations/create/:projectId
   */
  async createElicitation(elicitationData) {
    const { projectId, ...data } = elicitationData;
    return apiClient.post(
      `/elicitations/create/${projectId}`,
      data
    );
  }

  /**
   * Get all elicitations
   * Backend: GET /elicitations/list/:projectId
   */
  async getElicitations(projectId, page = 1, pageSize = 10) {
    try {
      const response = await apiClient.get(
        `/elicitations/list/${projectId}`
      );
      
      if (!response.success) {
        return [];
      }
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Failed to fetch elicitations:', error);
      return [];
    }
  }

  /**
   * Get latest (active) elicitation for a project
   * Backend: GET /elicitations/latest/:projectId
   */
  async getLatestElicitation(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      const response = await apiClient.get(`/elicitations/latest/${projectId}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to fetch latest elicitation:', error);
      return null;
    }
  }

  /**
   * Get single elicitation
   * Backend: GET /elicitations/get/:elicitationId
   */
  async getElicitation(projectId, elicitationId) {
    return apiClient.get(
      `/elicitations/get/${elicitationId}`
    );
  }

  /**
   * Update elicitation
   * Backend: PATCH /elicitations/update/:projectId
   */
  async updateElicitation(projectId, elicitationId, updateData) {
    return apiClient.patch(
      `/elicitations/update/${projectId}`,
      { elicitationId, ...updateData }
    );
  }

  /**
   * Delete elicitation
   * Backend: DELETE /elicitations/delete/:projectId
   */
  async deleteElicitation(projectId, elicitationId, deleteData = {}) {
    return apiClient.delete(
      `/elicitations/delete/${projectId}`,
      { elicitationId, ...deleteData }
    );
  }

  /**
   * Get elicitations by project
   */
  async getElicitationsByProject(projectId) {
    return apiClient.get(
      `/elicitations/list/${projectId}`
    );
  }
}

export const elicitationService = new ElicitationService();
export default elicitationService;
