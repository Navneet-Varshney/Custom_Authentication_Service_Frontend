/**
 * Dashboard Module
 * Manages admin panel dashboard functionality, data loading, and state management
 * Integrated with Project dashboard via token synchronization
 */

/**
 * Dashboard state object
 * Stores cached data from admin panel API
 * @type {Object}
 */
let dashboardData = {
  admins: [],
  users: [],
  organizations: [],
  devices: [],
  activities: [],
};

/**
 * Authenticates admin user
 * Supports both token formats (accessToken from Project, adminAuthToken from Admin Panel)
 * Creates fallback admin object when coming from Project dashboard
 * @returns {Object|null} Admin object with email and fullName, or null if not authenticated
 */
function checkAdminAuth() {
  const token = localStorage.getItem('adminAuthToken') || localStorage.getItem('accessToken');
  
  // Only token is required - adminData is optional (may not exist when redirecting from Project)
  if (!token) {
    console.warn('🔓 No authentication token found');
    return null;
  }
  
  // Try to get admin data, fallback to basic admin object if not available
  let adminData = localStorage.getItem('adminData');
  if (!adminData) {
    // When coming from Project, adminData won't exist initially
    // Create a minimal admin object from token for seamless integration
    console.log('ℹ️ Admin data not in localStorage - Will be loaded from API on demand');
    return { 
      email: 'Admin',
      fullName: 'Admin User'
    };
  }
  
  try {
    return JSON.parse(adminData);
  } catch (e) {
    console.error('❌ Invalid admin data in localStorage:', e);
    // Return fallback even if JSON parse fails - ensures dashboard doesn't break
    return { 
      email: 'Admin',
      fullName: 'Admin User'
    };
  }
}

/**
 * Logout admin user completely
 * Clears all admin credentials and returns to Project login
 */
function logoutAdmin() {
  console.log('🚪 Logging out admin completely...');
  
  // Clear ALL admin-related data
  localStorage.removeItem('adminAuthToken');
  localStorage.removeItem('adminRefreshToken');
  localStorage.removeItem('adminData');
  
  // NOTE: Keep accessToken and deviceUUID for potential future Project dashboard login
  // This allows seamless return to Project dashboard
  
  // Show success message
  showNotification('✓ Logged out successfully. Redirecting...', 'success', 1500);
  
  // Redirect to Project login page after short delay
  setTimeout(() => {
    // Redirect to Project index/login page - complete logout
    window.location.href = 'http://127.0.0.1:5500/project/index.html';
  }, 1000);
}

// Show notification
function showNotification(message, type = 'success', duration = 3000) {
  const notification = document.getElementById('notification') || (() => {
    const div = document.createElement('div');
    div.id = 'notification';
    document.body.appendChild(div);
    return div;
  })();

  notification.textContent = message;
  notification.className = `notification show ${type}`;
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.padding = '15px 20px';
  notification.style.borderRadius = '8px';
  notification.style.color = 'white';
  notification.style.fontWeight = '500';
  notification.style.zIndex = '9999';
  notification.style.background = type === 'success' ? '#48bb78' : (type === 'error' ? '#f56565' : '#ed8936');

  setTimeout(() => {
    notification.classList.remove('show');
  }, duration);
}

// Initialize Dashboard
window.addEventListener('load', async () => {
  console.log('✅ Dashboard loaded - Connecting to backend services...');

  // Check authentication
  const admin = checkAdminAuth();
  if (!admin) {
    window.location.href = '../auth/login.html';
    return;
  }

  // Set admin name
  document.getElementById('adminName').textContent = admin.fullName || admin.email || 'Admin';

  // Setup event listeners
  setupNavigation();
  setupLogout();
  setupBackButton();
  setupSidebarToggle();
  setupFilters();
  setupButtonListeners();

  // Load initial dashboard data
  loadDashboardData();
});

// Navigation
function setupNavigation() {
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      if (page) {
        navigateToPage(page);
      }
    });
  });
}

async function navigateToPage(page) {
  // Hide all pages
  document.querySelectorAll('.page').forEach((p) => {
    p.classList.remove('active');
  });

  // Show active page
  const activePage = document.getElementById(page);
  if (activePage) {
    activePage.classList.add('active');
  }

  // Update nav links
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.classList.remove('active');
    if (link.dataset.page === page) {
      link.classList.add('active');
    }
  });

  // Update page title
  const titles = {
    dashboard: 'Dashboard',
    admins: 'Admin Management',
    users: 'User Management',
    organizations: 'Organization Management',
    devices: 'Device Management',
    activities: 'Activity Logs',
  };

  document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';

  // Load page-specific data (DEMO VERSION)
  switch (page) {
    case 'admins':
      loadAdminsData();
      break;
    case 'users':
      loadUsersData();
      break;
    case 'organizations':
      loadOrganizationsData();
      break;
    case 'devices':
      loadDevicesData();
      break;
    case 'activities':
      loadActivitiesData();
      break;
  }

  // Close mobile sidebar
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.remove('mobile-open');
}

// Sidebar Toggle
function setupSidebarToggle() {
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }
}

// Logout
/**
 * Setup logout button and event handlers
 * Confirms logout and handles backend session termination
 */
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const confirmed = confirm('Are you sure you want to logout?');
      
      if (confirmed) {
        try {
          console.log('📡 Calling backend logout API...');
          await API.adminSignOut();
          console.log('✅ Backend logout successful');
        } catch (error) {
          console.warn('⚠️ Backend logout failed (continuing with local logout):', error.message);
          // Continue with logout even if backend call fails
        }
        
        // Perform local logout and redirect
        logoutAdmin();
      }
    });
  }
}

/**
 * Setup back to dashboard button
 * Allows quick return to Project dashboard
 */
function setupBackButton() {
  const backBtn = document.getElementById('backToDashboardBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      console.log('🔙 Returning to Project dashboard...');
      window.location.href = 'http://127.0.0.1:5500/project/app/dashboard.html';
    });
  }
}

// Dashboard Data - Real API
async function loadDashboardData() {
  try {
    console.log('📋 Dashboard initializing - Listing endpoints not available on backend');
    
    // Set placeholder stats - backend doesn't provide listing endpoints
    document.getElementById('totalAdmins').textContent = '-';
    document.getElementById('totalUsers').textContent = '-';
    document.getElementById('totalOrgs').textContent = '-';
    document.getElementById('totalDevices').textContent = '-';

    // Load recent activities
    await loadRecentActivities();
  } catch (error) {
    console.error('Failed to load dashboard:', error);
    // Set defaults on error
    document.getElementById('totalAdmins').textContent = '-';
    document.getElementById('totalUsers').textContent = '-';
    document.getElementById('totalOrgs').textContent = '-';
    document.getElementById('totalDevices').textContent = '-';
  }
}

async function loadRecentActivities() {
  try {
    const activityList = document.getElementById('recentActivityList');
    const activities = await API.listActivities(1, 5);
    
    if (activities && activities.length > 0) {
      activityList.innerHTML = activities.map(a => `
        <div class="activity-item" style="padding: 10px; border-bottom: 1px solid #eee;">
          <div style="font-weight: 600; color: #333;">${a.action || 'Action'}</div>
          <div style="font-size: 12px; color: #666;">${formatDate(a.timestamp || a.createdAt)}</div>
        </div>
      `).join('');
    } else {
      activityList.innerHTML = '<div class="loading" style="padding: 20px;">No activities yet</div>';
    }
  } catch (error) {
    console.error('Failed to load activities:', error);
    document.getElementById('recentActivityList').innerHTML = '<div class="loading">Unable to load activities</div>';
  }
}

// Load Admins
async function loadAdminsData() {
  try {
    const adminsList = document.getElementById('adminsList');
    
    console.log('✅ Admin Page Ready - Use "Add Admin" button to create');
    adminsList.innerHTML = `
      <tr>
        <td colspan="6" style="padding: 30px; text-align: center;">
          <div style="background: #f0f7ff; padding: 25px; border-radius: 8px; border-left: 4px solid #0066cc;">
            <p style="margin: 0 0 15px 0; font-weight: 600; font-size: 16px; color: #333;">Admin Management Interface</p>
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">📋 Available Operations:</p>
            <div style="text-align: left; display: inline-block; background: white; padding: 15px; border-radius: 6px;">
              <p style="margin: 5px 0;">✅ <strong>Create Admin</strong> - Click "Add Admin" button above</p>
              <p style="margin: 5px 0;">✅ <strong>Block Admin</strong> - Use action buttons when admins are listed</p>
              <p style="margin: 5px 0;">✅ <strong>Unblock Admin</strong> - Use action buttons when admins are listed</p>
            </div>
          </div>
        </td>
      </tr>`;
  } catch (error) {
    console.error('Failed to load admins:', error);
    showNotification('Error loading admin page', 'error');
  }
}

function displayAdmins(admins) {
  const adminsList = document.getElementById('adminsList');
  adminsList.innerHTML = admins
    .map(
      (admin) => `
    <tr>
      <td>${admin.email}</td>
      <td>${admin.fullName}</td>
      <td>${admin.role}</td>
      <td>${getStatusBadge(admin.isBlocked ? 'blocked' : 'active')}</td>
      <td>${formatDate(admin.createdAt)}</td>
      <td>
        ${
          admin.isBlocked
            ? `<button class="btn btn-sm btn-secondary" onclick="unblockAdmin('${admin._id}')">Unblock</button>`
            : `<button class="btn btn-sm btn-danger" onclick="blockAdmin('${admin._id}')">Block</button>`
        }
      </td>
    </tr>
  `
    )
    .join('');
}

async function blockAdmin(adminId) {
  const blockReason = prompt('Enter reason for blocking admin:');
  if (!blockReason) return;
  
  try {
    await API.blockAdmin(adminId, blockReason);
    showNotification('Admin blocked successfully', 'success');
    loadAdminsData();
  } catch (error) {
    console.error('Error blocking admin:', error);
    showNotification('Failed to block admin: ' + error.message, 'error');
  }
}

async function unblockAdmin(adminId) {
  const unblockReason = prompt('Enter reason for unblocking admin:');
  if (!unblockReason) return;
  
  try {
    await API.unblockAdmin(adminId, unblockReason);
    showNotification('Admin unblocked successfully', 'success');
    loadAdminsData();
  } catch (error) {
    console.error('Error unblocking admin:', error);
    showNotification('Failed to unblock admin: ' + error.message, 'error');
  }
}

async function deleteAdmin(adminId) {
  if (!confirmAction('Are you sure you want to DELETE this admin? This action cannot be undone!')) return;
  try {
    await API.deleteAdmin(adminId);
    showNotification('Admin deleted successfully', 'success');
    loadAdminsData();
  } catch (error) {
    console.error('Error deleting admin:', error);
    showNotification('Failed to delete admin: ' + error.message, 'error');
  }
}

// Load Users
async function loadUsersData() {
  try {
    const usersList = document.getElementById('usersList');
    
    console.log('✅ User Management - Block/Unblock Interface');
    usersList.innerHTML = `
      <tr>
        <td colspan="7" style="padding: 30px; text-align: center;">
          <div style="background: #f0f7ff; padding: 25px; border-radius: 8px; border-left: 4px solid #0066cc;">
            <p style="margin: 0 0 15px 0; font-weight: 600; font-size: 16px; color: #333;">User Management</p>
            <p style="margin: 0 0 15px 0; color: #666;">Enter User ID to manage user access</p>
            <div style="background: white; padding: 20px; border-radius: 6px; display: inline-block;">
              <div style="margin-bottom: 10px;">
                <input type="text" id="userIdInput" placeholder="Enter User ID (e.g., USR0000001)" 
                  style="width: 300px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
              </div>
              <div>
                <button onclick="blockUserAction()" class="btn btn-danger" style="padding: 10px 20px; margin-right: 10px;">🚫 Block User</button>
                <button onclick="unblockUserAction()" class="btn btn-success" style="padding: 10px 20px; background: #48bb78; color: white; border: none; border-radius: 4px; cursor: pointer;">✅ Unblock User</button>
              </div>
            </div>
          </div>
        </td>
      </tr>`;
  } catch (error) {
    console.error('Failed to load users:', error);
    showNotification('Error loading user page', 'error');
  }
}

async function blockUserAction() {
  const userId = document.getElementById('userIdInput')?.value.trim();
  if (!userId) {
    showNotification('Please enter User ID', 'error');
    return;
  }
  
  const blockReason = prompt('Select block reason:\nOptions: policy_violation, spam_activity, harassment, fraudulent_behavior, suspicious_login, other\n\nEnter reason:');
  if (!blockReason) return;
  
  const reasonDescription = prompt('Enter additional description (optional):');
  
  if (!confirm('Are you sure you want to block this user?')) return;
  
  try {
    await API.blockUser(userId, blockReason, reasonDescription || '');
    showNotification('✓ User blocked successfully', 'success');
    document.getElementById('userIdInput').value = '';
  } catch (error) {
    showNotification('❌ Error: ' + error.message, 'error');
  }
}

async function unblockUserAction() {
  const userId = document.getElementById('userIdInput')?.value.trim();
  if (!userId) {
    showNotification('Please enter User ID', 'error');
    return;
  }
  
  const unblockReason = prompt('Select unblock reason:\nOptions: manual_review_passed, user_appeal_granted, system_error, mistake, other\n\nEnter reason:');
  if (!unblockReason) return;
  
  const reasonDescription = prompt('Enter additional description (optional):');
  
  if (!confirm('Are you sure you want to unblock this user?')) return;
  
  try {
    await API.unblockUser(userId, unblockReason, reasonDescription || '');
    showNotification('✓ User unblocked successfully', 'success');
    document.getElementById('userIdInput').value = '';
  } catch (error) {
    showNotification('❌ Error: ' + error.message, 'error');
  }
}

function displayUsers(users) {
  const usersList = document.getElementById('usersList');
  usersList.innerHTML = users
    .map(
      (user) => `
    <tr>
      <td>${user.email}</td>
      <td>${user.fullName}</td>
      <td>${user.phone || '-'}</td>
      <td>${getStatusBadge(user.isBlocked ? 'blocked' : 'active')}</td>
      <td>${user.emailVerified ? '✅' : '❌'}</td>
      <td>${formatDate(user.createdAt)}</td>
      <td>
        ${
          user.isBlocked
            ? `<button class="btn btn-sm btn-secondary" onclick="unblockUser('${user._id}')">Unblock</button>`
            : `<button class="btn btn-sm btn-danger" onclick="blockUser('${user._id}')">Block</button>`
        }
      </td>
    </tr>
  `
    )
    .join('');
}

async function blockUser(userId) {
  if (!confirmAction('Are you sure you want to block this user?')) return;
  try {
    await API.blockUser(userId);
    showNotification('User blocked successfully', 'success');
    loadUsersData();
  } catch (error) {
    console.error('Error blocking user:', error);
    showNotification('Failed to block user: ' + error.message, 'error');
  }
}

async function unblockUser(userId) {
  if (!confirmAction('Are you sure you want to unblock this user?')) return;
  try {
    await API.unblockUser(userId);
    showNotification('User unblocked successfully', 'success');
    loadUsersData();
  } catch (error) {
    console.error('Error unblocking user:', error);
    showNotification('Failed to unblock user: ' + error.message, 'error');
  }
}

// Load Organizations
async function loadOrganizationsData() {
  try {
    const orgsList = document.getElementById('organizationsList');
    console.log('📡 Fetching organizations from backend...');
    const organizations = await API.getOrganizations(1, 10);

    if (!organizations || organizations.length === 0) {
      orgsList.innerHTML = `<tr><td colspan="7" style="padding: 20px; text-align: center; color: #666;">No organizations found</td></tr>`;
      return;
    }

    displayOrganizations(organizations);
  } catch (error) {
    console.error('Failed to load organizations:', error);
    const orgsList = document.getElementById('organizationsList');
    orgsList.innerHTML = `<tr><td colspan="7" style="padding: 20px; text-align: center; color: #e74c3c;">Failed to load organizations: ${error.message}</td></tr>`;
  }
}

// Load Devices
async function loadDevicesData() {
  try {
    const devicesList = document.getElementById('devicesList');
    
    console.log('✅ Device Management - Block/Unblock Interface');
    devicesList.innerHTML = `
      <tr>
        <td colspan="7" style="padding: 30px; text-align: center;">
          <div style="background: #f0f7ff; padding: 25px; border-radius: 8px; border-left: 4px solid #0066cc;">
            <p style="margin: 0 0 15px 0; font-weight: 600; font-size: 16px; color: #333;">Device Management</p>
            <p style="margin: 0 0 15px 0; color: #666;">Enter Device UUID to manage device access</p>
            <div style="background: white; padding: 20px; border-radius: 6px; display: inline-block;">
              <div style="margin-bottom: 10px;">
                <input type="text" id="deviceUuidInput" placeholder="Enter Device UUID (e.g., 550e8400-e29b-41d4-a716-446655440000)" 
                  style="width: 400px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
              </div>
              <div>
                <button onclick="blockDeviceAction()" class="btn btn-danger" style="padding: 10px 20px; margin-right: 10px;">🚫 Block Device</button>
                <button onclick="unblockDeviceAction()" class="btn btn-success" style="padding: 10px 20px; background: #48bb78; color: white; border: none; border-radius: 4px; cursor: pointer;">✅ Unblock Device</button>
              </div>
            </div>
          </div>
        </td>
      </tr>`;
  } catch (error) {
    console.error('Failed to load devices:', error);
    showNotification('Error loading device page', 'error');
  }
}

async function blockDeviceAction() {
  const deviceUUID = document.getElementById('deviceUuidInput')?.value.trim();
  if (!deviceUUID) {
    showNotification('Please enter Device UUID', 'error');
    return;
  }
  
  if (!confirm('Are you sure you want to block this device?')) return;
  
  try {
    await API.blockDevice(deviceUUID, 'Admin blocked', 'Blocked via admin panel');
    showNotification('✓ Device blocked successfully', 'success');
    document.getElementById('deviceUuidInput').value = '';
  } catch (error) {
    showNotification('❌ Error: ' + error.message, 'error');
  }
}

async function unblockDeviceAction() {
  const deviceUUID = document.getElementById('deviceUuidInput')?.value.trim();
  if (!deviceUUID) {
    showNotification('Please enter Device UUID', 'error');
    return;
  }
  
  if (!confirm('Are you sure you want to unblock this device?')) return;
  
  try {
    await API.unblockDevice(deviceUUID, 'Admin unblocked', 'Unblocked via admin panel');
    showNotification('✓ Device unblocked successfully', 'success');
    document.getElementById('deviceUuidInput').value = '';
  } catch (error) {
    showNotification('❌ Error: ' + error.message, 'error');
  }
}

// Load Activities
async function loadActivitiesData() {
  try {
    const activitiesList = document.getElementById('activitiesList');
    console.log('📡 Fetching activities from backend...');
    const activities = await API.listActivities(1, 20);

    if (!activities || activities.length === 0) {
      activitiesList.innerHTML = `<tr><td colspan="6" style="padding: 20px; text-align: center; color: #666;">No activities found</td></tr>`;
      return;
    }

    displayActivities(activities);
  } catch (error) {
    console.error('Failed to load activities:', error);
    const activitiesList = document.getElementById('activitiesList');
    activitiesList.innerHTML = `<tr><td colspan="6" style="padding: 20px; text-align: center; color: #e74c3c;">Failed to load activities: ${error.message}</td></tr>`;
  }
}

function displayActivities(activities) {
  const activitiesList = document.getElementById('activitiesList');
  activitiesList.innerHTML = activities
    .map(
      (activity) => `
    <tr>
      <td>${activity.adminId}</td>
      <td>${activity.action}</td>
      <td>${activity.entityType}</td>
      <td>${activity.entityId}</td>
      <td>${formatDate(activity.timestamp)}</td>
      <td><button class="btn btn-sm btn-primary" onclick="showActivityDetails('${activity._id}')">View</button></td>
    </tr>
  `
    )
    .join('');
}

function showActivityDetails(activityId) {
  const activity = dashboardData.activities.find((a) => a._id === activityId);
  if (activity) {
    alert(`
Activity Details:
Admin: ${activity.adminId}
Action: ${activity.action}
Entity: ${activity.entityType}
Timestamp: ${formatDate(activity.timestamp)}
Changes: ${JSON.stringify(activity.changes, null, 2)}
    `);
  }
}

// Filters
function setupFilters() {
  const filterInputs = document.querySelectorAll('.filters input, .filters select');
  filterInputs.forEach((input) => {
    input.addEventListener('input', debounce(applyFilters, 300));
  });
}

function applyFilters() {
  const pageActive = document.querySelector('.page.active');
  if (!pageActive) return;

  const pageId = pageActive.id;

  switch (pageId) {
    case 'admins':
      filterAdmins();
      break;
    case 'users':
      filterUsers();
      break;
    case 'organizations':
      filterOrganizations();
      break;
    case 'devices':
      filterDevices();
      break;
    case 'activities':
      filterActivities();
      break;
  }
}

function filterAdmins() {
  const searchTerm = document.getElementById('adminSearch')?.value.toLowerCase() || '';
  const roleFilter = document.getElementById('adminRoleFilter')?.value || '';

  const filtered = dashboardData.admins.filter((admin) => {
    const matchesSearch =
      admin.email.toLowerCase().includes(searchTerm) ||
      admin.fullName.toLowerCase().includes(searchTerm);
    const matchesRole = !roleFilter || admin.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  displayAdmins(filtered);
}

function filterUsers() {
  const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
  const statusFilter = document.getElementById('userStatusFilter')?.value || '';

  const filtered = dashboardData.users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm) ||
      user.fullName.toLowerCase().includes(searchTerm);
    const matchesStatus =
      !statusFilter || (statusFilter === 'blocked' && user.isBlocked) || (statusFilter === 'active' && !user.isBlocked);
    return matchesSearch && matchesStatus;
  });

  displayUsers(filtered);
}

function filterOrganizations() {
  const searchTerm = document.getElementById('orgSearch')?.value.toLowerCase() || '';

  const filtered = dashboardData.organizations.filter(
    (org) =>
      org.organizationName.toLowerCase().includes(searchTerm) ||
      org.email.toLowerCase().includes(searchTerm)
  );

  displayOrganizations(filtered);
}

function filterDevices() {
  const searchTerm = document.getElementById('deviceSearch')?.value.toLowerCase() || '';
  const statusFilter = document.getElementById('deviceStatusFilter')?.value || '';

  const filtered = dashboardData.devices.filter((device) => {
    const matchesSearch = device.deviceId.toLowerCase().includes(searchTerm);
    const matchesStatus =
      !statusFilter || (statusFilter === 'blocked' && device.isBlocked) || (statusFilter === 'active' && !device.isBlocked);
    return matchesSearch && matchesStatus;
  });

  displayDevices(filtered);
}

function filterActivities() {
  const searchTerm = document.getElementById('activitySearch')?.value.toLowerCase() || '';
  const typeFilter = document.getElementById('activityTypeFilter')?.value || '';

  const filtered = dashboardData.activities.filter((activity) => {
    const matchesSearch =
      activity.action.toLowerCase().includes(searchTerm) || activity.entityId.toLowerCase().includes(searchTerm);
    const matchesType = !typeFilter || activity.action === typeFilter;
    return matchesSearch && matchesType;
  });

  displayActivities(filtered);
}

// Helper functions
function confirmAction(message = 'Are you sure?') {
  return confirm(message);
}

function getStatusBadge(status) {
  const statusMap = {
    'active': { class: 'status-active', label: 'Active' },
    'blocked': { class: 'status-blocked', label: 'Blocked' },
    'pending': { class: 'status-pending', label: 'Pending' },
    'disabled': { class: 'status-blocked', label: 'Disabled' },
  };

  const normalized = status ? status.toLowerCase() : 'active';
  const config = statusMap[normalized] || { class: 'status-active', label: normalized };

  return `<span class="status-badge ${config.class}">${config.label}</span>`;
}

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return date.toLocaleDateString('en-US', options);
  } catch (e) {
    return dateString;
  }
}

// Display Activities
function displayActivities(activities) {
  const activitiesList = document.getElementById('activitiesList');
  activitiesList.innerHTML = activities
    .map(
      (activity) => `
    <tr>
      <td>${activity.adminId}</td>
      <td>${activity.action}</td>
      <td>${activity.entityType}</td>
      <td>${activity.entityId}</td>
      <td>${formatDate(activity.timestamp)}</td>
      <td><button class="btn btn-sm btn-primary" onclick="showActivityDetails('${activity._id}')">View</button></td>
    </tr>
  `
    )
    .join('');
}

function showActivityDetails(activityId) {
  const activity = dashboardData.activities.find((a) => a._id === activityId);
  if (activity) {
    alert(`
Activity Details:
Admin: ${activity.adminId}
Action: ${activity.action}
Entity: ${activity.entityType}
Timestamp: ${formatDate(activity.timestamp)}
Changes: ${JSON.stringify(activity.changes, null, 2)}
    `);
  }
}

// Display Organizations
function displayOrganizations(orgs) {
  const orgsList = document.getElementById('organizationsList');
  orgsList.innerHTML = orgs
    .map(
      (org) => `
    <tr>
      <td>${org.organizationName}</td>
      <td>${org.email}</td>
      <td>${org.contactPerson || org.contact || '-'}</td>
      <td>${getStatusBadge(org.isDisabled ? 'disabled' : 'active')}</td>
      <td>${org.users?.length || 0}</td>
      <td>${formatDate(org.createdAt)}</td>
      <td>
        ${
          org.isDisabled
            ? `<button class="btn btn-sm btn-secondary" onclick="enableOrganization('${org._id}')">Enable</button>`
            : `<button class="btn btn-sm btn-danger" onclick="disableOrganization('${org._id}')">Disable</button>`
        }
      </td>
    </tr>
  `
    )
    .join('');
}

async function disableOrganization(orgId) {
  if (!confirmAction('Are you sure you want to disable this organization?')) return;
  try {
    await API.disableOrganization(orgId);
    showNotification('Organization disabled successfully', 'success');
    loadOrganizationsData();
  } catch (error) {
    console.error('Error disabling organization:', error);
    showNotification('Failed to disable organization: ' + error.message, 'error');
  }
}

async function enableOrganization(orgId) {
  if (!confirmAction('Are you sure you want to enable this organization?')) return;
  try {
    await API.enableOrganization(orgId);
    showNotification('Organization enabled successfully', 'success');
    loadOrganizationsData();
  } catch (error) {
    console.error('Error enabling organization:', error);
    showNotification('Failed to enable organization: ' + error.message, 'error');
  }
}

async function deleteOrganization(orgId) {
  if (!confirmAction('Are you sure you want to DELETE this organization? This action cannot be undone!')) return;
  try {
    await API.deleteOrganization(orgId);
    showNotification('Organization deleted successfully', 'success');
    loadOrganizationsData();
  } catch (error) {
    console.error('Error deleting organization:', error);
    showNotification('Failed to delete organization: ' + error.message, 'error');
  }
}

// Display Devices
function displayDevices(devices) {
  const devicesList = document.getElementById('devicesList');
  if (!devicesList) return;
  
  devicesList.innerHTML = devices
    .map(
      (device) => `
    <tr>
      <td>${device.deviceId}</td>
      <td>${device.deviceType || '-'}</td>
      <td>${device.owner || '-'}</td>
      <td>${formatDate(device.lastLogin || device.createdAt)}</td>
      <td>${device.isBlocked ? "<span class='badge badge-danger'>Blocked</span>" : "<span class='badge badge-success'>Active</span>"}</td>
      <td>
        ${device.isBlocked ? `<button class="btn btn-sm btn-secondary" onclick="unblockDevice('${device._id}')">Unblock</button>` : `<button class="btn btn-sm btn-danger" onclick="blockDevice('${device._id}')">Block</button>`}
      </td>
    </tr>
  `
    )
    .join('');
}

async function blockDevice(deviceUUID) {
  const blockReason = prompt('Select block reason:\nOptions: suspicious_activity, compromised_device, unauthorized_access, security_threat, user_requested, malware_detected, other\n\nEnter reason:');
  if (!blockReason) return;
  
  const reasonDescription = prompt('Enter additional description (optional):');
  
  try {
    await API.blockDevice(deviceUUID, blockReason, reasonDescription || '');
    showNotification('Device blocked successfully', 'success');
    loadDevicesData();
  } catch (error) {
    console.error('Error blocking device:', error);
    showNotification('Failed to block device: ' + error.message, 'error');
  }
}

async function unblockDevice(deviceUUID) {
  const unblockReason = prompt('Select unblock reason:\nOptions: verified_safe, user_verified, false_positive, device_secured, user_requested, security_check_passed, other\n\nEnter reason:');
  if (!unblockReason) return;
  
  const reasonDescription = prompt('Enter additional description (optional):');
  
  try {
    await API.unblockDevice(deviceUUID, unblockReason, reasonDescription || '');
    showNotification('Device unblocked successfully', 'success');
    loadDevicesData();
  } catch (error) {
    console.error('Error unblocking device:', error);
    showNotification('Failed to unblock device: ' + error.message, 'error');
  }
}

// Button Listeners
function setupButtonListeners() {
  const addAdminBtn = document.getElementById('addAdminBtn');
  const addOrgBtn = document.getElementById('addOrgBtn');

  if (addAdminBtn) {
    addAdminBtn.addEventListener('click', openAdminModal);
  }

  if (addOrgBtn) {
    addOrgBtn.addEventListener('click', openOrgModal);
  }

  // Admin Form Submission
  const adminForm = document.getElementById('adminForm');
  if (adminForm) {
    adminForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const firstName = document.getElementById('adminFirstName').value.trim();
      const email = document.getElementById('adminEmail').value.trim();
      const password = document.getElementById('adminPassword').value;

      // Validate firstName (2-50 chars)
      if (firstName.length < 2 || firstName.length > 50) {
        showNotification('First name must be 2-50 characters long', 'error');
        return;
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
      }

      // Validate password length
      if (password.length < 8 || password.length > 64) {
        showNotification('Password must be 8-64 characters long', 'error');
        return;
      }

      // Check password strength (uppercase, lowercase, number, special char)
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/;
      if (!passwordRegex.test(password)) {
        showNotification('Password must contain uppercase, lowercase, numbers, and special characters', 'error');
        return;
      }

      
      const adminData = {
        firstName: firstName,
        email: email,
        password: password,
        adminType: document.getElementById('adminType').value,
        role: document.getElementById('adminRole').value,
        creationReason: document.getElementById('creationReason').value,
      };

      if (!adminData.firstName || !adminData.email || !adminData.password || !adminData.adminType || !adminData.role || !adminData.creationReason) {
        showNotification('Please fill in all required fields', 'error');
        return;
      }

      await createNewAdmin(adminData);
      closeAdminModal();
    });
  }

  // Organization Form Submission
  const orgForm = document.getElementById('orgForm');
  if (orgForm) {
    orgForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const orgName = document.getElementById('orgName').value.trim();
      const orgType = document.getElementById('orgType').value;
      const description = document.getElementById('orgDescription').value.trim();
      const websiteUrl = document.getElementById('orgWebsiteUrl').value.trim();
      const contactEmail = document.getElementById('orgContactEmail').value.trim();
      const contactCountryCode = document.getElementById('orgContactCountryCode').value.trim();
      const contactLocalNumber = document.getElementById('orgContactLocalNumber').value.trim();
      const logUrl = document.getElementById('orgLogUrl').value.trim();
      const creationReason = document.getElementById('orgCreationReason').value;
      const reasonDescription = document.getElementById('orgReasonDescription').value.trim();

      // Validation - only required fields
      if (!orgName || !orgType || !creationReason) {
        showNotification('Please fill in all required fields', 'error');
        return;
      }

      const orgData = {
        organizationName: orgName,
        orgType: orgType,
        creationReason: creationReason,
      };

      // Add optional fields if provided
      if (description) orgData.description = description;
      if (websiteUrl) orgData.websiteUrl = websiteUrl;
      if (contactEmail) orgData.contactEmail = contactEmail;
      if (contactCountryCode) orgData.contactCountryCode = contactCountryCode;
      if (contactLocalNumber) orgData.contactLocalNumber = contactLocalNumber;
      if (logUrl) orgData.logUrl = logUrl;
      if (reasonDescription) orgData.reasonDescription = reasonDescription;

      await createNewOrganization(orgData);
      closeOrgModal();
    });
  }
}

// Modal Functions
function openAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal) {
    modal.classList.add('show');
    document.getElementById('adminForm').reset();
  }
}

function closeAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal) {
    modal.classList.remove('show');
    document.getElementById('adminForm').reset();
  }
}

function openOrgModal() {
  const modal = document.getElementById('orgModal');
  if (modal) {
    modal.classList.add('show');
    document.getElementById('orgForm').reset();
  }
}

function closeOrgModal() {
  const modal = document.getElementById('orgModal');
  if (modal) {
    modal.classList.remove('show');
    document.getElementById('orgForm').reset();
  }
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
  const adminModal = document.getElementById('adminModal');
  const orgModal = document.getElementById('orgModal');
  
  if (e.target === adminModal) closeAdminModal();
  if (e.target === orgModal) closeOrgModal();
});

async function createNewAdmin(adminData) {
  try {
    console.log('📤 Sending admin creation request:', adminData);
    await API.createAdmin(adminData);
    showNotification('✅ Admin created successfully!', 'success');
    loadAdminsData();
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    showNotification('Failed to create admin: ' + error.message, 'error');
  }
}

async function createNewOrganization(orgData) {
  try {
    await API.createOrganization(orgData);
    showNotification('Organization created successfully', 'success');
    loadOrganizationsData();
  } catch (error) {
    console.error('Error creating organization:', error);
    showNotification('Failed to create organization: ' + error.message, 'error');
  }
}

// Organization User Management Functions
async function addUserToOrganization(orgId) {
  const userId = prompt('Enter user ID:');
  if (!userId) return;
  
  if (!confirmAction('Are you sure you want to add this user to the organization?')) return;
  
  try {
    await API.addUserToOrganization(orgId, userId);
    showNotification('User added to organization successfully', 'success');
    loadOrganizationsData();
  } catch (error) {
    console.error('Error adding user:', error);
    showNotification('Failed to add user: ' + error.message, 'error');
  }
}

async function removeUserFromOrganization(orgId, userId) {
  if (!confirmAction('Are you sure you want to remove this user from the organization?')) return;
  
  try {
    await API.removeUserFromOrganization(orgId, userId);
    showNotification('User removed from organization successfully', 'success');
    loadOrganizationsData();
  } catch (error) {
    console.error('Error removing user:', error);
    showNotification('Failed to remove user: ' + error.message, 'error');
  }
}

async function listOrgUsers(orgId) {
  try {
    const users = await API.listOrgUsers(orgId);
    const usersList = users.data || users || [];
    
    let display = `<h4>Users in Organization</h4><table class="table"><thead><tr><th>Email</th><th>Name</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>`;
    
    usersList.forEach(user => {
      display += `<tr>
        <td>${user.email}</td>
        <td>${user.fullName || '-'}</td>
        <td>${user.role || '-'}</td>
        <td>${getStatusBadge(user.isDisabled ? 'disabled' : 'active')}</td>
        <td>
          ${user.isDisabled ? 
            `<button class="btn btn-sm btn-secondary" onclick="enableOrgUser('${user._id}')">Enable</button>` :
            `<button class="btn btn-sm btn-warning" onclick="disableOrgUser('${user._id}')">Disable</button>`
          }
          <button class="btn btn-sm btn-danger" onclick="removeUserFromOrganization('${orgId}', '${user._id}')">Remove</button>
        </td>
      </tr>`;
    });
    
    display += `</tbody></table>`;
    
    alert(display);
  } catch (error) {
    console.error('Error listing org users:', error);
    showNotification('Failed to list users: ' + error.message, 'error');
  }
}

async function disableOrgUser(orgUserId) {
  if (!confirmAction('Are you sure you want to disable this organization user?')) return;
  
  try {
    await API.disableOrgUser(orgUserId);
    showNotification('Organization user disabled successfully', 'success');
  } catch (error) {
    console.error('Error disabling org user:', error);
    showNotification('Failed to disable user: ' + error.message, 'error');
  }
}

async function enableOrgUser(orgUserId) {
  if (!confirmAction('Are you sure you want to enable this organization user?')) return;
  
  try {
    await API.enableOrgUser(orgUserId);
    showNotification('Organization user enabled successfully', 'success');
  } catch (error) {
    console.error('Error enabling org user:', error);
    showNotification('Failed to enable user: ' + error.message, 'error');
  }
}

// DEMO DATA LOADING FUNCTIONS REMOVED - Using real API calls instead

console.log('✅ Dashboard script loaded - Ready for real backend integration');
