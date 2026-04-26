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
   * Backend: POST /comments/create
   * Body format (entityType and entityId go in request body, not URL)
   * REQUIRED FIELDS: entityType, entityId, commentText
   * OPTIONAL FIELDS: parentCommentId (for replies)
   * 
   * Valid entityTypes: scopes, requirements, inceptions, high-level-features
   * NOTE: entityId must be a specific entity ID, not 'all'
   */
  async createComment(entityType, entityId, commentData) {
    // Validate entityId - cannot be 'all' or empty
    if (!entityId || entityId === 'all') {
      console.error('❌ Invalid entityId for comment creation:', entityId, '- must be a specific entity ID');
      return { success: false, message: 'Invalid entity ID' };
    }

    // Validate entityType - must be one of the supported types
    const validEntityTypes = ['scopes', 'requirements', 'inceptions', 'high-level-features'];
    if (!entityType || !validEntityTypes.includes(entityType)) {
      console.error('❌ Invalid entityType for comment:', entityType, '- must be one of:', validEntityTypes.join(', '));
      return { success: false, message: 'Invalid entity type' };
    }

    // Backend expects: { entityType: "...", entityId: "...", commentText: "...", parentCommentId?: "..." }
    const normalizedData = {
      entityType: entityType,  // REQUIRED
      entityId: entityId,      // REQUIRED
      commentText: commentData.commentText,  // REQUIRED
      ...(commentData.parentCommentId && { parentCommentId: commentData.parentCommentId })
    };

    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.COMMENTS}/create`,
      normalizedData
    );
  },

  /**
   * List all comments (flat list)
   * Backend: GET /comments/list/:entityType/:entityId
   * NOTE: entityId must be a specific entity ID, not 'all'
   */
  async listComments(entityType = 'projects', entityId = null) {
    // Validate entityId - cannot be 'all' or empty
    if (!entityId || entityId === 'all') {
      console.warn('⚠️ Invalid entityId for comments:', entityId, '- must be a specific entity ID');
      return [];
    }

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
   * Note: entityId must be a specific entity ID, not 'all'
   */
  async getCommentsByEntityHierarchical(entityType, entityId) {
    // Validate that entityId is not 'all' - backend doesn't support listing all comments across entities
    if (!entityId || entityId === 'all') {
      console.warn('⚠️ Invalid entityId for comments:', entityId, '- must be a specific entity ID');
      return { success: false, data: [] };
    }
    
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
