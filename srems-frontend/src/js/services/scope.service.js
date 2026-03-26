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
  async createScope(scopeData) {
    return apiClient.post(`${API_CONFIG.ENDPOINTS.SCOPE}/create`, scopeData);
  }

  /**
   * Get scopes by project
   */
  async getScopesByProject(projectId) {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.SCOPE}/list/${projectId}`);
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
   */
  async deleteScope(scopeId) {
    return apiClient.delete(`${API_CONFIG.ENDPOINTS.SCOPE}/delete/${scopeId}`);
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
