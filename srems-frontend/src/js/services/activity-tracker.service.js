/**
 * activity-tracker.service.js
 * Activity tracker management operations
 */

import apiClient from './api.js';
import { API_CONFIG } from '../utils/constants.js';

class ActivityTrackerService {
  /**
   * Get current user's activity
   * Backend: GET /activity-trackers/my-activity?page=X&limit=Y
   * Accessible by: Admin and Client (everyone can view their own activity)
   * Returns: { success: true, data: { activities: [...], pagination: {...} } }
   */
  async getMyActivity(page = 1, pageSize = 20) {
    try {
      console.log('👤 [ACTIVITY-SERVICE] Fetching MY activities, page:', page, 'limit:', pageSize);
      
      const endpoint = `${API_CONFIG.ENDPOINTS.ACTIVITY_TRACKER}/my-activity?page=${page}&limit=${pageSize}`;
      console.log(`📡 [ACTIVITY-SERVICE] Calling API: ${endpoint}`);
      
      const response = await apiClient.get(endpoint);
      
      console.log('📦 [ACTIVITY-SERVICE] Raw response:', response);
      
      if (!response) {
        console.error('❌ [ACTIVITY-SERVICE] Response is null/undefined');
        throw new Error('API returned empty response');
      }
      
      if (!response.success) {
        console.error('❌ [ACTIVITY-SERVICE] API returned success=false:', response.message);
        throw new Error(response.message || 'Failed to fetch my activities');
      }
      
      console.log('✅ [ACTIVITY-SERVICE] Success! My activities:', response.data?.activities?.length || 0);
      
      return response;
      
    } catch (error) {
      console.error('❌ [ACTIVITY-SERVICE] Error fetching my activities:', error);
      throw error;
    }
  }

  /**
   * Get all activities (Admin only)
   * Backend: GET /activity-trackers/list?page=X&limit=Y
   * Accessible by: Admin only (requires API authorization)
   * Returns: { success: true, data: { activities: [...], pagination: {...} } }
   */
  async getActivities(page = 1, pageSize = 20) {
    try {
      console.log('🔍 [ACTIVITY-SERVICE] Fetching activities, page:', page, 'limit:', pageSize);
      
      const endpoint = `${API_CONFIG.ENDPOINTS.ACTIVITY_TRACKER}/list?page=${page}&limit=${pageSize}`;
      console.log(`📡 [ACTIVITY-SERVICE] Calling API: ${endpoint}`);
      
      const response = await apiClient.get(endpoint);
      
      console.log('📦 [ACTIVITY-SERVICE] Raw API response:', response);
      
      if (!response) {
        console.error('❌ [ACTIVITY-SERVICE] Response is null/undefined');
        throw new Error('API returned empty response');
      }
      
      if (!response.success) {
        console.error('❌ [ACTIVITY-SERVICE] API returned success=false:', response.message);
        throw new Error(response.message || 'Failed to fetch activities');
      }
      
      console.log('✅ [ACTIVITY-SERVICE] Success! Activities:', response.data?.activities?.length || 0);
      
      // Return full response so caller can access { success, data: { activities, pagination } }
      return response;
      
    } catch (error) {
      console.error('❌ [ACTIVITY-SERVICE] Error fetching activities:', error);
      throw error;
    }
  }

  /**
   * Get all activities with filters (Admin only)
   * Backend: GET /activity-trackers/list?userId=X&eventType=Y&dateFrom=Z&dateTo=W&page=P&limit=L
   * Supports filtering by: userId, eventType, dateFrom, dateTo
   */
  async getActivitiesByFilters(filters = {}, page = 1, pageSize = 20) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', pageSize);
      
      if (filters.userId) queryParams.append('userId', filters.userId);
      if (filters.eventType) queryParams.append('eventType', filters.eventType);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      
      const endpoint = `${API_CONFIG.ENDPOINTS.ACTIVITY_TRACKER}/list?${queryParams.toString()}`;
      console.log(`🔎 [ACTIVITY-SERVICE] Fetching with filters: ${JSON.stringify(filters)}`);
      console.log(`📡 [ACTIVITY-SERVICE] Calling API: ${endpoint}`);
      
      const response = await apiClient.get(endpoint);
      
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to fetch filtered activities');
      }
      
      console.log('✅ [ACTIVITY-SERVICE] Filtered activities:', response.data?.activities?.length || 0);
      return response;
      
    } catch (error) {
      console.error('❌ [ACTIVITY-SERVICE] Error fetching filtered activities:', error);
      throw error;
    }
  }

  /**
   * Get activity by ID
   */
  async getActivityById(activityId) {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.ACTIVITY_TRACKER}/get/${activityId}`
      );
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch activity');
      }
      
      return response;
    } catch (error) {
      console.error('Failed to fetch activity:', error);
      throw error;
    }
  }
}

export const activityTrackerService = new ActivityTrackerService();
export default activityTrackerService;
