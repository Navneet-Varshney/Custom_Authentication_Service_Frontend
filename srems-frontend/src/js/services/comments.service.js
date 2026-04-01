import { API_CONFIG } from '../utils/constants.js';
import { apiClient } from './api.js';

/**
 * Comments Service
 * Handles all comment-related API operations
 */
export const commentsService = {
  /**
   * Create new comment
   */
  async createComment(commentData) {
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.COMMENTS}/create`,
      commentData
    );
  },

  /**
   * List all comments
   * Backend: /comments/list/:entityType/:entityId
   */
  async listComments(entityType = 'project', entityId = 'all', params = {}) {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.COMMENTS}/list/${entityType}/${entityId}`
      );
      
      if (!response.success) {
        return [];
      }
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      return [];
    }
  },

  /**
   * Get comments for entity (flat list)
   */
  async getCommentsByEntity(entityType, entityId, params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      pageSize: params.pageSize || 20,
    }).toString();

    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.COMMENTS}/list/${entityType}/${entityId}?${queryParams}`
    );
  },

  /**
   * Get comments for entity (hierarchical/threaded)
   */
  async getCommentsByEntityHierarchical(entityType, entityId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.COMMENTS}/list-hierarchical/${entityType}/${entityId}`
    );
  },

  /**
   * Get single comment
   */
  async getComment(commentId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.COMMENTS}/get/${commentId}`
    );
  },

  /**
   * Update comment
   */
  async updateComment(commentId, commentData) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.COMMENTS}/update/${commentId}`,
      commentData
    );
  },

  /**
   * Delete comment
   */
  async deleteComment(commentId) {
    return apiClient.delete(
      `${API_CONFIG.ENDPOINTS.COMMENTS}/delete/${commentId}`
    );
  },

  /**
   * Add reply to comment (thread)
   */
  async replyToComment(parentCommentId, replyData) {
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.COMMENTS}/${parentCommentId}/reply`,
      replyData
    );
  },

  /**
   * Like/upvote comment
   */
  async likeComment(commentId) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.COMMENTS}/${commentId}/like`
    );
  },

  /**
   * Unlike comment
   */
  async unlikeComment(commentId) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.COMMENTS}/${commentId}/unlike`
    );
  },
};
