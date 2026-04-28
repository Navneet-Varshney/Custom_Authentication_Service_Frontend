/**
 * scope.service.js
 * Scope management (In-scope, Out-of-scope, Partial-scope items)
 */

import apiClient from './api.js';
import { API_CONFIG } from '../utils/constants.js';

class ScopeService {
  /**
   * Create scope item
   */
  async createScope(projectId, scopeData) {
    const payload = {
      title: scopeData.title || scopeData.description,
      ...scopeData
    };

    return apiClient.post(`${API_CONFIG.ENDPOINTS.SCOPE}/create/${projectId}`, payload);
  }

  /**
   * Get scopes by project
   */
  async getScopesByProject(projectId) {
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.SCOPE}/list/${projectId}`);
    
    // Check if response was successful
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch scopes');
    }
    
    // Backend response: { success, message, data: { scopes, pagination } }
    return response.data?.data?.scopes || [];
  }

  /**
   * Get scope by ID
   */
  async getScopeById(scopeId) {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.SCOPE}/get/${scopeId}`);
  }

  /**
   * Update scope item
   */
  async updateScope(scopeId, updateData) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.SCOPE}/update/${scopeId}`,
      updateData
    );
  }

  /**
   * Delete scope item
   * Backend: DELETE /scope/delete/:scopeId
   * OPTIONAL FIELDS: deletionReasonDescription
   */
  async deleteScope(scopeId, deleteData = {}) {
    return apiClient.delete(
      `${API_CONFIG.ENDPOINTS.SCOPE}/delete/${scopeId}`,
      deleteData
    );
  }

  /**
   * Get scopes by type
   */
  async getScopesByType(projectId, type) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.SCOPE}/list/${projectId}?type=${type}`
    );
  }
}

export const scopeService = new ScopeService();
export default scopeService;
