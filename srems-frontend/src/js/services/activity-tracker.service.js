/**
 * activity-tracker.service.js
 * Activity tracker management operations
 */

import apiClient from './api.js';
import { API_CONFIG } from '../utils/constants.js';

class ActivityTrackerService {
  /**
   * Get all activities
   * Backend: /activity-trackers/list (no query params)
   */
  async getActivities(page = 1, pageSize = 20) {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.ACTIVITY_TRACKER}/list`
      );
      
      if (!response.success) {
        return [];
      }
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      return [];
    }
  }

  /**
   * Get activity by ID
   */
  async getActivityById(activityId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.ACTIVITY_TRACKER}/get/${activityId}`
    );
  }

  /**
   * Get activities by entity type
   */
  async getActivitiesByEntity(entityType) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.ACTIVITY_TRACKER}/entity/${entityType}`
    );
  }

  /**
   * Get activities by user
   */
  async getActivitiesByUser(userId) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.ACTIVITY_TRACKER}/user/${userId}`
    );
  }

  /**
   * Get activities by date range
   */
  async getActivitiesByDateRange(startDate, endDate) {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.ACTIVITY_TRACKER}/date-range?startDate=${startDate}&endDate=${endDate}`
    );
  }
}

export const activityTrackerService = new ActivityTrackerService();
export default activityTrackerService;
