import { API_CONFIG } from '../utils/constants.js';
import { apiClient } from './api.js';

/**
 * Comments Service
 * Handles all comment-related API operations
 * 
 * Backend Endpoints:
 * POST   /comments/create/:entityType/:entityId
 * GET    /comments/list/:entityType/:entityId
 * GET    /comments/list-hierarchical/:entityType/:entityId
 * GET    /comments/get/:commentId
 * PATCH  /comments/update/:commentId
 * DELETE /comments/delete/:commentId
 */
export const commentsService = {
  /**
   * Create new comment
   * Backend: POST /comments/create/:entityType/:entityId
   * REQUIRED FIELDS: commentText
   * OPTIONAL FIELDS: parentCommentId (for replies)
   */
  async createComment(entityType, entityId, commentData) {
    // Backend expects: { commentText: "...", parentCommentId?: "..." }
    const normalizedData = {
      commentText: commentData.commentText,  // REQUIRED
      ...(commentData.parentCommentId && { parentCommentId: commentData.parentCommentId })
    };

    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.COMMENTS}/create/${entityType}/${entityId}`,
      normalizedData
    );
  },

  /**
   * List all comments (flat list)
   * Backend: GET /comments/list/:entityType/:entityId
   */
  async listComments(entityType = 'projects', entityId = 'all') {
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
   * Get comments for entity (flat list with pagination)
   */
  async getCommentsByEntity(entityType, entityId, params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
    }).toString();

    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.COMMENTS}/list/${entityType}/${entityId}?${queryParams}`
    );
  },

  /**
   * Get comments for entity (hierarchical/threaded structure)
   * Backend: GET /comments/list-hierarchical/:entityType/:entityId
   */
  async getCommentsByEntityHierarchical(entityType, entityId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.COMMENTS}/list-hierarchical/${entityType}/${entityId}`
    );
  },

  /**
   * Get single comment details
   * Backend: GET /comments/get/:commentId
   */
  async getComment(commentId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.COMMENTS}/get/${commentId}`
    );
  },

  /**
   * Update comment
   * Backend: PATCH /comments/update/:commentId
   * REQUIRED FIELDS: commentText
   */
  async updateComment(commentId, commentData) {
    const normalizedData = {
      commentText: commentData.commentText  // REQUIRED
    };

    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.COMMENTS}/update/${commentId}`,
      normalizedData
    );
  },

  /**
   * Delete comment
   * Backend: DELETE /comments/delete/:commentId
   * OPTIONAL FIELDS: deletedReason
   */
  async deleteComment(commentId, deletedReason = null) {
    const deleteData = deletedReason ? { deletedReason } : {};

    return apiClient.delete(
      `${API_CONFIG.ENDPOINTS.COMMENTS}/delete/${commentId}`,
      deleteData
    );
  },

  /**
   * Add reply to comment (uses parentCommentId in createComment)
   */
  async replyToComment(entityType, entityId, parentCommentId, replyData) {
    return this.createComment(entityType, entityId, {
      commentText: replyData.commentText,
      parentCommentId: parentCommentId
    });
  }
};
