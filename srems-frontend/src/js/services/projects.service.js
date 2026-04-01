/**
 * projects.service.js
 * Project CRUD operations and business logic
 * Like backend's projects service
 */

import apiClient from './api.js';
import { API_CONFIG } from '../utils/constants.js';

class ProjectsService {
  /**
   * Create a new project
   */
  async createProject(projectData) {
    const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.PROJECTS}/create`, projectData);
    
    // Check if response was successful
    if (!response.success) {
      throw new Error(response.message || 'Failed to create project');
    }
    
    // Return the project object from nested data structure
    // Backend response: { success, message, data: { project: {...} } }
    return response.data?.data?.project || {};
  }

  /**
   * Get all projects (with pagination)
   */
  async getProjects(page = 1, pageSize = 10) {
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.PROJECTS}/list?page=${page}&pageSize=${pageSize}`
    );
    
    // Check if response was successful
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch projects');
    }
    
    // Return the projects array from nested data structure
    // Backend response: { success, message, data: { projects: [...], pagination: {...} } }
    return response.data?.data?.projects || [];
  }

  /**
   * Get single project by ID
   */
  async getProjectById(projectId) {
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.PROJECTS}/get/${projectId}`);
    
    // Check if response was successful
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch project');
    }
    
    // Return the project object from nested data structure
    return response.data?.data?.project || {};
  }

  /**
   * Update project
   */
  async updateProject(projectId, updateData) {
    const response = await apiClient.patch(
      `${API_CONFIG.ENDPOINTS.PROJECTS}/update/${projectId}`,
      updateData
    );
    
    // Check if response was successful
    if (!response.success) {
      throw new Error(response.message || 'Failed to update project');
    }
    
    // Return the project object from nested data structure
    return response.data?.data?.project || {};
  }

  /**
   * Delete project
   */
  async deleteProject(projectId, deletionReason = 'other', description = '') {
    const deleteData = {
      deletionReasonType: deletionReason,
    };
    
    if (description) {
      deleteData.deletionReasonDescription = description;
    }
    
    console.log('[DELETE] Sending data:', deleteData);
    
    const response = await apiClient.delete(
      `${API_CONFIG.ENDPOINTS.PROJECTS}/delete/${projectId}`, 
      deleteData
    );
    
    console.log('[DELETE] Response:', response);
    
    // Check if response was successful
    if (!response.success) {
      // Log full error details for debugging
      console.error('[DELETE ERROR] Full response:', response);
      throw new Error(response.message || 'Failed to delete project');
    }
    
    return response.data || {};
  }

  /**
   * Put project on hold
   */
  async putProjectOnHold(projectId, reason) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.PROJECTS}/on-hold/${projectId}`,
      { projectOnHoldReasonType: reason }
    );
  }

  /**
   * Abort project
   */
  async abortProject(projectId, reason) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.PROJECTS}/abort/${projectId}`,
      { projectAbortReasonType: reason }
    );
  }

  /**
   * Complete project
   */
  async completeProject(projectId) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.PROJECTS}/complete/${projectId}`,
      {}
    );
  }

  /**
   * Resume project from hold or abort
   */
  async resumeProject(projectId, reason) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.PROJECTS}/resume/${projectId}`,
      { projectResumeReasonType: reason }
    );
  }

  /**
   * Activate project
   */
  async activateProject(projectId, reason) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.PROJECTS}/activate/${projectId}`,
      { projectActivationReasonType: reason }
    );
  }

  /**
   * Archive project
   */
  async archiveProject(projectId) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.PROJECTS}/archive/${projectId}`,
      {}
    );
  }
}

export const projectsService = new ProjectsService();
export default projectsService;
