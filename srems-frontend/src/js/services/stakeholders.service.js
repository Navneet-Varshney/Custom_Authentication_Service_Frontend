/**
 * stakeholders.service.js
 * Stakeholder management operations with enhanced logging & error handling
 */

import apiClient from './api.js';
import { API_CONFIG } from '../utils/constants.js';

/**
 * Service logger for structured logging
 */
const logger = {
  log: (action, data = null) => console.log(`[StakeholdersService] ${action}`, data),
  error: (action, error) => console.error(`[StakeholdersService] ${action}`, error),
  validate: (fieldName, value) => {
    if (!value) {
      throw new Error(`${fieldName} is required`);
    }
  }
};

class StakeholdersService {
  /**
   * Add stakeholder to project with validation
   * Backend expects: { userId, role, projectId, orgId (optional) }
   */
  async addStakeholder(userId, role, orgId = null, projectId = null) {
    logger.log('addStakeholder', { userId, role, orgId, projectId });
    
    try {
      // Validate required fields
      if (!userId) throw new Error('User ID is required');
      if (!role) throw new Error('Role is required');
      
      const payload = {
        userId,
        role,
        projectId
      };
      if (orgId) {
        payload.orgId = orgId;
      }
      
      const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.STAKEHOLDERS}/create`, payload);
      
      logger.log('addStakeholder', 'Stakeholder added successfully');
      return response;
    } catch (error) {
      logger.error('addStakeholder', error);
      throw error;
    }
  }

  /**
   * Get all stakeholders with pagination
   */
  async getStakeholders(page = 1, pageSize = 10) {
    logger.log('getStakeholders', { page, pageSize });
    
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.STAKEHOLDERS}/list?page=${page}&pageSize=${pageSize}`
      );
      
      logger.log('getStakeholders', `Fetched stakeholders - Page: ${page}, Size: ${pageSize}`);
      return response;
    } catch (error) {
      logger.error('getStakeholders', error);
      throw error;
    }
  }

  /**
   * Get stakeholder by ID with error handling
   */
  async getStakeholderById(stakeholderId) {
    logger.log('getStakeholderById', { stakeholderId });
    
    try {
      if (!stakeholderId) {
        throw new Error('Stakeholder ID is required');
      }
      
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.STAKEHOLDERS}/get/${stakeholderId}`);
      logger.log('getStakeholderById', 'Stakeholder fetched successfully');
      return response;
    } catch (error) {
      logger.error('getStakeholderById', error);
      throw error;
    }
  }

  /**
   * Update stakeholder role with validation
   * Backend expects: { role }
   */
  async updateStakeholder(stakeholderId, role) {
    logger.log('updateStakeholder', { stakeholderId, role });
    
    try {
      if (!stakeholderId) throw new Error('Stakeholder ID is required');
      if (!role) throw new Error('Role is required');
      
      const response = await apiClient.patch(
        `${API_CONFIG.ENDPOINTS.STAKEHOLDERS}/update/${stakeholderId}`,
        { role }
      );
      
      logger.log('updateStakeholder', 'Stakeholder updated successfully');
      return response;
    } catch (error) {
      logger.error('updateStakeholder', error);
      throw error;
    }
  }

  /**
   * Delete stakeholder (soft-delete) with validation
   * Backend expects: { deletionReasonType, deletionReasonDescription (optional) }
   */
  async deleteStakeholder(stakeholderId, deletionReasonType, deletionReasonDescription = null) {
    logger.log('deleteStakeholder', { stakeholderId, deletionReasonType });
    
    try {
      if (!stakeholderId) throw new Error('Stakeholder ID is required');
      if (!deletionReasonType) throw new Error('Deletion reason is required');
      
      const payload = {
        deletionReasonType
      };
      if (deletionReasonDescription) {
        payload.deletionReasonDescription = deletionReasonDescription;
      }
      
      const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.STAKEHOLDERS}/delete/${stakeholderId}`, payload);
      logger.log('deleteStakeholder', 'Stakeholder deleted successfully');
      return response;
    } catch (error) {
      logger.error('deleteStakeholder', error);
      throw error;
    }
  }

  /**
   * Get stakeholders by project ID with enhanced logging
   * Backend: GET /stakeholders/list?projectId=xxx
   */
  async getProjectStakeholders(projectId) {
    logger.log('getProjectStakeholders', { projectId });
    
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.STAKEHOLDERS}/list?projectId=${projectId}`
      );
      
      logger.log('getProjectStakeholders', {
        success: response?.success,
        stakeholderCount: response?.data?.data?.stakeholders?.length || 0
      });

      // API returns double-nested structure: response.data.data.stakeholders
      return response;
    } catch (error) {
      logger.error('getProjectStakeholders', error);
      throw error;
    }
  }
}

export const stakeholdersService = new StakeholdersService();
export default stakeholdersService;
