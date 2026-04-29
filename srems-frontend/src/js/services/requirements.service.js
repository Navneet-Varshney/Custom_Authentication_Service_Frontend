/**
 * requirements.service.js
 * Requirement management operations with validation & logging
 */

import apiClient from './api.js';
import { API_CONFIG } from '../utils/constants.js';

/**
 * Validation and logging utilities
 */
const logger = {
  log: (action, data = null) => console.log(`[RequirementsService] ${action}`, data),
  error: (action, error) => console.error(`[RequirementsService] ${action}`, error),
  validate: (fieldName, value, rules = {}) => {
    if (rules.required && !value) {
      logger.log('validation', `${fieldName} is required`);
      throw new Error(`${fieldName} is required`);
    }
    if (rules.minLength && value.length < rules.minLength) {
      throw new Error(`${fieldName} must be at least ${rules.minLength} characters`);
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      throw new Error(`${fieldName} cannot exceed ${rules.maxLength} characters`);
    }
  }
};

class RequirementsService {
  /**
   * Create requirement with validation
   */
  async createRequirement(requirementData) {
    logger.log('createRequirement', requirementData);
    
    try {
      // Validate requirement data
      if (!requirementData.title || requirementData.title.trim().length === 0) {
        throw new Error('Requirement title is required');
      }
      
      const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.REQUIREMENTS}/create`, requirementData);
      logger.log('createRequirement', 'Requirement created successfully');
      return response;
    } catch (error) {
      logger.error('createRequirement', error);
      throw error;
    }
  }

  /**
   * Get requirements by elicitation with logging
   */
  async getRequirements(projectId, page = 1, pageSize = 10) {
    logger.log('getRequirements', { projectId, page, pageSize });
    
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.REQUIREMENTS}/list?projectId=${projectId}&page=${page}&pageSize=${pageSize}`
      );
      
      // Check if response was successful
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch requirements');
      }
      
      logger.log('getRequirements', `Fetched requirements for project: ${projectId}`);
      
      // Return the data array
      return response.data || [];
    } catch (error) {
      logger.error('getRequirements', error);
      throw error;
    }
  }

  /**
   * Get requirement by ID
   */
  async getRequirementById(requirementId) {
    logger.log('getRequirementById', { requirementId });
    
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.REQUIREMENTS}/get/${requirementId}`);
      logger.log('getRequirementById', 'Requirement fetched successfully');
      return response;
    } catch (error) {
      logger.error('getRequirementById', error);
      throw error;
    }
  }

  /**
   * Update requirement with validation
   */
  async updateRequirement(requirementId, updateData) {
    logger.log('updateRequirement', { requirementId, updateData });
    
    try {
      if (!requirementId) {
        throw new Error('Requirement ID is required');
      }
      
      const response = await apiClient.patch(
        `${API_CONFIG.ENDPOINTS.REQUIREMENTS}/update/${requirementId}`,
        updateData
      );
      
      logger.log('updateRequirement', 'Requirement updated successfully');
      return response;
    } catch (error) {
      logger.error('updateRequirement', error);
      throw error;
    }
  }

  /**
   * Delete requirement
   */
  async deleteRequirement(requirementId) {
    logger.log('deleteRequirement', { requirementId });
    
    try {
      if (!requirementId) {
        throw new Error('Requirement ID is required for deletion');
      }
      
      const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.REQUIREMENTS}/delete/${requirementId}`);
      logger.log('deleteRequirement', 'Requirement deleted successfully');
      return response;
    } catch (error) {
      logger.error('deleteRequirement', error);
      throw error;
    }
  }

  /**
   * Classify requirements (QFD mode)
   */
  async classifyRequirements(elicitationId) {
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.REQUIREMENTS}/classify`,
      { elicitationId }
    );
  }

  /**
   * Bulk upload requirements from CSV
   */
  async bulkUploadRequirements(formData) {
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.REQUIREMENTS}/bulk-upload`,
      formData,
      { headers: {} } // Let browser set boundary
    );
  }

  /**
   * Move requirement to different category
   */
  async moveRequirement(requirementId, newType) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.REQUIREMENTS}/move/${requirementId}`,
      { type: newType }
    );
  }

  /**
   * Reorder requirements
   */
  async reorderRequirements(elicitationId, orderedIds) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.REQUIREMENTS}/reorder`,
      { elicitationId, orderedIds }
    );
  }
}

export const requirementsService = new RequirementsService();
export default requirementsService;
