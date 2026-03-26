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
    return apiClient.post(`${API_CONFIG.ENDPOINTS.PROJECTS}/create`, projectData);
  }

  /**
   * Get all projects (with pagination)
   */
  async getProjects(page = 1, pageSize = 10) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.PROJECTS}/list?page=${page}&pageSize=${pageSize}`
    );
  }

  /**
   * Get single project by ID
   */
  async getProjectById(projectId) {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.PROJECTS}/get/${projectId}`);
  }

  /**
   * Update project
   */
  async updateProject(projectId, updateData) {
    return apiClient.patch(
      `${API_CONFIG.ENDPOINTS.PROJECTS}/update/${projectId}`,
      updateData
    );
  }

  /**
   * Delete project
   */
  async deleteProject(projectId) {
    return apiClient.delete(`${API_CONFIG.ENDPOINTS.PROJECTS}/delete/${projectId}`);
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
