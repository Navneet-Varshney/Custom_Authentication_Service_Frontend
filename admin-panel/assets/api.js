/**
 * Admin Panel API Client
 * Handles all communication with Auth Service (8080) and Admin Panel Service (8081)
 * Supports dual token formats (accessToken from Project, adminAuthToken from Admin Panel)
 * Includes device UUID header for backend middleware validation
 * Features: Request timeout, retry logic, error recovery
 */

// Service URLs
const AUTH_SERVICE_BASE_URL = 'http://localhost:8080/custom-auth-service/api/v1';
const ADMIN_PANEL_API_BASE_URL = 'http://localhost:8081/admin-panel-service/api/v1';

// API Configuration
const API_CONFIG = {
  REQUEST_TIMEOUT: 15000, // 15 seconds
  MAX_RETRIES: 2,
  RETRY_DELAY: 1000, // milliseconds
  RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504], // Retry on these statuses
};

// Request queue to prevent concurrent operations
let requestQueue = [];
let isProcessingQueue = false;

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
   * Generic HTTP request handler with timeout and retry logic
   * @param {string} method - HTTP method (GET, POST, PUT, PATCH, DELETE)
   * @param {string} endpoint - API endpoint path
   * @param {Object} data - Request body data (optional)
   * @param {string} baseUrl - Base URL for the request
   * @param {number} retryCount - Internal retry counter
   * @returns {Promise} Response data from API
   * @throws {Error} On API errors or invalid responses
   */
  async request(method, endpoint, data = null, baseUrl = ADMIN_PANEL_API_BASE_URL, retryCount = 0) {
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
      console.debug(`📡 API Request [Attempt ${retryCount + 1}/${API_CONFIG.MAX_RETRIES + 1}]: ${method} ${endpoint}`);
      console.debug(`📋 Request Body:`, config.body ? JSON.parse(config.body) : 'No body');
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);
      config.signal = controller.signal;

      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      const result = await response.json();

      if (!response.ok) {
        // Handle unauthorized - token expired
        if (response.status === 401) {
          console.warn('🔓 Unauthorized: Token expired - Clearing admin credentials');
          localStorage.removeItem('adminAuthToken');
          localStorage.removeItem('adminRefreshToken');
          localStorage.removeItem('adminData');
          // Keep accessToken and deviceUUID
          
          // Redirect to Project login page if token expired
          setTimeout(() => {
            window.location.href = 'http://127.0.0.1:5500/project/index.html';
          }, 500);
          return;
        }
        
        // Check if error is retryable
        if (API_CONFIG.RETRY_STATUS_CODES.includes(response.status) && retryCount < API_CONFIG.MAX_RETRIES) {
          console.warn(`⚠️ Retryable error (${response.status}): Retrying in ${API_CONFIG.RETRY_DELAY}ms`);
          await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
          return this.request(method, endpoint, data, baseUrl, retryCount + 1);
        }
        
        // Log detailed error information including warnings
        console.error(`❌ API Error ${response.status}:`, result);
        if (result.warning) {
          console.error('⚠️  Validation Warning Details:', JSON.stringify(result.warning, null, 2));
        }
        throw new Error(result.message || `API Error: ${response.status}`);
      }

      console.debug(`✅ API Success: ${method} ${endpoint}`);
      return result.data || result;
    } catch (error) {
      // Handle timeout errors
      if (error.name === 'AbortError') {
        console.error(`⏱️ Request timeout (${API_CONFIG.REQUEST_TIMEOUT}ms): ${method} ${endpoint}`);
        if (retryCount < API_CONFIG.MAX_RETRIES) {
          console.warn(`⚠️ Retrying after timeout...`);
          await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
          return this.request(method, endpoint, data, baseUrl, retryCount + 1);
        }
        throw new Error('Request timeout - Server not responding');
      }
      
      console.error(`🚨 API Request Failed: ${method} ${endpoint}`, error);
      throw error;
    }
  },

  // Auth Endpoints (External Auth Service) - Using Project's auth endpoints
  // Note: Admin panel uses same auth system as Project (port 8080)
  
  /**
   * Admin login endpoint
   * @param {Object} credentials - Login credentials { email, password }
   * @returns {Promise} Authentication response with tokens
   */
  async adminLogin(credentials) {
    return this.request('POST', '/auth/login', credentials, AUTH_SERVICE_BASE_URL);
  },

  // Use /auth/signout instead of /auth/logout
  async adminSignOut() {
    // Call the correct auth endpoint
    return this.request('POST', '/auth/signout', {}, AUTH_SERVICE_BASE_URL);
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

  async blockAdmin(adminId, blockReason = '', reasonDescription = '') {
    const data = { adminId };
    if (blockReason) data.blockReason = blockReason;
    if (reasonDescription) data.reasonDescription = reasonDescription;
    return this.request('POST', `/admins/block-admin`, data);
  },

  async unblockAdmin(adminId, unblockReason = '', reasonDescription = '') {
    const data = { adminId };
    if (unblockReason) data.unblockReason = unblockReason;
    if (reasonDescription) data.reasonDescription = reasonDescription;
    return this.request('POST', `/admins/unblock-admin`, data);
  },

  async deleteAdmin(adminId, deletionReason = '') {
    const data = { adminId };
    if (deletionReason) data.deletionReason = deletionReason;
    return this.request('POST', `/admins/delete-admin`, data);
  },

  async createClient(clientData) {
    return this.request('POST', '/admins/create-client', clientData);
  },

  // User Endpoints
  async getUsers(page = 1, limit = 10) {
    return this.request('GET', `/users?page=${page}&limit=${limit}`);
  },

  async getUser(userId) {
    return this.request('GET', `/users?userId=${userId}`);
  },

  async blockUser(userId, blockReason = '', reasonDescription = '') {
    const data = { userId };
    if (blockReason) data.blockReason = blockReason;
    if (reasonDescription) data.reasonDescription = reasonDescription;
    return this.request('POST', `/users/block`, data);
  },

  async unblockUser(userId, unblockReason = '', reasonDescription = '') {
    const data = { userId };
    if (unblockReason) data.unblockReason = unblockReason;
    if (reasonDescription) data.reasonDescription = reasonDescription;
    return this.request('POST', `/users/unblock`, data);
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

  async removeUserFromOrganization(orgUserId, deletionReason = '') {
    const data = {};
    if (deletionReason) data.deletionReason = deletionReason;
    return this.request('DELETE', `/organizations/delete-org-user/${orgUserId}`, data);
  },

  async disableOrganization(orgId, disablitionReason = '') {
    const data = {};
    if (disablitionReason) data.disablitionReason = disablitionReason;
    return this.request('PATCH', `/organizations/disable/${orgId}`, data);
  },

  async enableOrganization(orgId, enableReason = '') {
    const data = {};
    if (enableReason) data.enableReason = enableReason;
    return this.request('PATCH', `/organizations/enable/${orgId}`, data);
  },

  async deleteOrganization(orgId, deletionReason = '') {
    const data = {};
    if (deletionReason) data.deletionReason = deletionReason;
    return this.request('DELETE', `/organizations/delete/${orgId}`, data);
  },

  async updateOrgUser(orgUserId, orgUserData) {
    return this.request('PATCH', `/organizations/update-org-user/${orgUserId}`, orgUserData);
  },

  async getOrgUser(orgUserId) {
    return this.request('GET', `/organizations/get-org-user/${orgUserId}`);
  },

  async listOrgUsers(orgId, page = 1, limit = 10) {
    return this.request('GET', `/organizations/list-org-users/${orgId}?page=${page}&limit=${limit}`);
  },

  async disableOrgUser(orgUserId, disablitionReason = '') {
    const data = {};
    if (disablitionReason) data.disablitionReason = disablitionReason;
    return this.request('PATCH', `/organizations/disable-org-user/${orgUserId}`, data);
  },

  async enableOrgUser(orgUserId, enableReason = '') {
    const data = {};
    if (enableReason) data.enableReason = enableReason;
    return this.request('PATCH', `/organizations/enable-org-user/${orgUserId}`, data);
  },

  // Device Endpoints
  async getDevices(page = 1, limit = 10) {
    return this.request('GET', `/devices?page=${page}&limit=${limit}`);
  },

  async getDevice(deviceId) {
    return this.request('GET', `/devices?deviceId=${deviceId}`);
  },

  async blockDevice(deviceUUID, blockReason = '', reasonDescription = '') {
    const data = { deviceUUID };
    if (blockReason) data.blockReason = blockReason;
    if (reasonDescription) data.reasonDescription = reasonDescription;
    return this.request('POST', `/devices/block`, data);
  },

  async unblockDevice(deviceUUID, unblockReason = '', reasonDescription = '') {
    const data = { deviceUUID };
    if (unblockReason) data.unblockReason = unblockReason;
    if (reasonDescription) data.reasonDescription = reasonDescription;
    return this.request('POST', `/devices/unblock`, data);
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

  // Device Block/Unblock Methods
  async blockDevice(deviceUUID, blockReason = '', reasonDescription = '') {
    const data = { deviceUUID };
    if (blockReason) data.blockReason = blockReason;
    if (reasonDescription) data.reasonDescription = reasonDescription;
    return this.request('POST', `/devices/block`, data);
  },

  async unblockDevice(deviceUUID, unblockReason = '', reasonDescription = '') {
    const data = { deviceUUID };
    if (unblockReason) data.unblockReason = unblockReason;
    if (reasonDescription) data.reasonDescription = reasonDescription;
    return this.request('POST', `/devices/unblock`, data);
  },
};

console.log('✅ API module loaded - Connected to Auth Service (8080) & Admin Panel Service (8081)');
