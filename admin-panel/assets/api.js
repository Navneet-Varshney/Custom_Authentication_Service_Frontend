/**
 * Admin Panel API Client
 * Handles all communication with Auth Service (8080) and Admin Panel Service (8081)
 * Supports dual token formats (accessToken from Project, adminAuthToken from Admin Panel)
 * Includes device UUID header for backend middleware validation
 */

// Service URLs
const AUTH_SERVICE_BASE_URL = 'http://localhost:8080/custom-auth-service/api/v1';
const ADMIN_PANEL_API_BASE_URL = 'http://localhost:8081/admin-panel-service/api/v1';

/**
 * API Client Object
 * Provides methods for all admin panel endpoints
 */
const API = {
  /**
   * Get HTTP headers with authentication and device identification
   * @returns {Object} Headers object with authorization and device UUID
   */
  getHeaders() {
    const token = localStorage.getItem('adminAuthToken') || localStorage.getItem('accessToken');
    const deviceUUID = localStorage.getItem('deviceUUID');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add device UUID if available (required by backend middleware)
    if (deviceUUID) {
      headers['x-device-uuid'] = deviceUUID;
    }
    
    return headers;
  },

  /**
   * Generic HTTP request handler
   * @param {string} method - HTTP method (GET, POST, PUT, PATCH, DELETE)
   * @param {string} endpoint - API endpoint path
   * @param {Object} data - Request body data (optional)
   * @param {string} baseUrl - Base URL for the request
   * @returns {Promise} Response data from API
   * @throws {Error} On API errors or invalid responses
   */
  async request(method, endpoint, data = null, baseUrl = ADMIN_PANEL_API_BASE_URL) {
    const url = `${baseUrl}${endpoint}`;
    const config = {
      method,
      headers: this.getHeaders(),
      mode: 'cors',
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      console.debug(`📡 API Request: ${method} ${endpoint}`);
      const response = await fetch(url, config);
      const result = await response.json();

      if (!response.ok) {
        // Handle unauthorized - token expired
        if (response.status === 401) {
          console.warn('🔓 Unauthorized: Token expired - Clearing credentials and redirecting to login');
          localStorage.removeItem('adminAuthToken');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('adminRefreshToken');
          localStorage.removeItem('adminData');
          window.location.href = '../auth/login.html';
          return;
        }
        
        // Log detailed error information
        console.error(`❌ API Error ${response.status}:`, result);
        throw new Error(result.message || `API Error: ${response.status}`);
      }

      console.debug(`✅ API Success: ${method} ${endpoint}`);
      return result.data || result;
    } catch (error) {
      console.error(`🚨 API Request Failed: ${method} ${endpoint}`, error);
      throw error;
    }
  },

  // Auth Endpoints (External Auth Service)
  async adminLogin(credentials) {
    return this.request('POST', '/auth/login', {
      email: credentials.email,
      password: credentials.password,
    }, AUTH_SERVICE_BASE_URL);
  },

  async adminLogout() {
    return this.request('POST', '/auth/logout', {}, AUTH_SERVICE_BASE_URL);
  },

  // Admin Endpoints
  async getAdmins(page = 1, limit = 10) {
    return this.request('GET', `/admins?page=${page}&limit=${limit}`);
  },

  async createAdmin(adminData) {
    return this.request('POST', '/admins/create-admin', adminData);
  },

  async getAdmin(adminId) {
    return this.request('GET', `/admins/get-admin`, { adminId });
  },

  async updateAdmin(adminId, adminData) {
    return this.request('PUT', `/admins/update-admin`, { ...adminData, adminId });
  },

  async blockAdmin(adminId) {
    return this.request('POST', `/admins/block-admin`, { adminId });
  },

  async unblockAdmin(adminId) {
    return this.request('POST', `/admins/unblock-admin`, { adminId });
  },

  // User Endpoints
  async getUsers(page = 1, limit = 10) {
    return this.request('GET', `/users?page=${page}&limit=${limit}`);
  },

  async getUser(userId) {
    return this.request('GET', `/users?userId=${userId}`);
  },

  async blockUser(userId) {
    return this.request('POST', `/users/block`, { userId });
  },

  async unblockUser(userId) {
    return this.request('POST', `/users/unblock`, { userId });
  },

  async convertUserToClient(userId) {
    return this.request('POST', `/admins/convert-user-to-client`, { userId });
  },

  // Organization Endpoints
  async getOrganizations(page = 1, limit = 10) {
    return this.request('GET', `/organizations/list?page=${page}&limit=${limit}`);
  },

  async createOrganization(orgData) {
    return this.request('POST', '/organizations/create', orgData);
  },

  async getOrganization(orgId) {
    return this.request('GET', `/organizations/get/${orgId}`);
  },

  async updateOrganization(orgId, orgData) {
    return this.request('PATCH', `/organizations/update/${orgId}`, orgData);
  },

  async addUserToOrganization(orgId, userId) {
    return this.request('POST', `/organizations/create-org-user`, { organizationId: orgId, userId });
  },

  async removeUserFromOrganization(orgId, userId) {
    return this.request('DELETE', `/organizations/delete-org-user/${orgId}`, { userId });
  },

  async disableOrganization(orgId) {
    return this.request('PATCH', `/organizations/disable/${orgId}`, {});
  },

  async enableOrganization(orgId) {
    return this.request('PATCH', `/organizations/enable/${orgId}`, {});
  },

  // Device Endpoints
  async getDevices(page = 1, limit = 10) {
    return this.request('GET', `/devices?page=${page}&limit=${limit}`);
  },

  async getDevice(deviceId) {
    return this.request('GET', `/devices?deviceId=${deviceId}`);
  },

  async blockDevice(deviceId) {
    return this.request('POST', `/devices/block`, { deviceId });
  },

  async unblockDevice(deviceId) {
    return this.request('POST', `/devices/unblock`, { deviceId });
  },

  // Activity Tracker Endpoints
  async getActivityTracker(adminId, page = 1, limit = 10) {
    return this.request('POST', `/activity-trackers/admin-activities`, { 
      adminId, 
      reason: 'Admin Check',
      reasonDescription: 'Checking admin activities',
      page,
      limit
    });
  },

  async getMyActivities(page = 1, limit = 10) {
    return this.request('GET', `/activity-trackers/my-activities?page=${page}&limit=${limit}`);
  },

  async getActivityDetail(activityId) {
    return this.request('GET', `/activity-trackers?activityId=${activityId}`);
  },

  async listActivities(page = 1, limit = 10) {
    return this.request('GET', `/activity-trackers/list?page=${page}&limit=${limit}`);
  },
};

console.log('✅ API module loaded - Connected to Auth Service (8080) & Admin Panel Service (8081)');
