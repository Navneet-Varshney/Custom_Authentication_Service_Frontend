// Dashboard State
let dashboardData = {
  admins: [],
  users: [],
  organizations: [],
  devices: [],
  activities: [],
};

// Check authentication - supports both token formats
function checkAdminAuth() {
  const token = localStorage.getItem('adminAuthToken') || localStorage.getItem('accessToken');
  
  // Only token is required - adminData is optional (may not exist when coming from Project)
  if (!token) {
    return null;
  }
  
  // Try to get admin data, fallback to basic admin object if not available
  let adminData = localStorage.getItem('adminData');
  if (!adminData) {
    // When coming from Project, adminData won't exist initially
    // Create a minimal admin object from token
    console.log('ℹ️ Admin data not in localStorage - will be loaded from API');
    return { 
      email: 'Admin',
      fullName: 'Admin User'
    };
  }
  
  try {
    return JSON.parse(adminData);
  } catch (e) {
    console.error('Invalid admin data');
    // Return fallback even if JSON parse fails
    return { 
      email: 'Admin',
      fullName: 'Admin User'
    };
  }
}

// Logout admin - clear all token formats
function logoutAdmin() {
  localStorage.removeItem('adminAuthToken');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('adminRefreshToken');
  localStorage.removeItem('adminData');
  window.location.href = '../auth/login.html';
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
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to logout?')) {
        try {
          await API.adminLogout();
        } catch (error) {
          console.error('Logout error:', error);
        }
        logoutAdmin();
      }
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
    
    console.log('ℹ️ Activity listing endpoint not available in backend');
    activityList.innerHTML = `
      <div class="loading" style="padding: 20px;">
        <div style="text-align: center;">
          <p style="margin: 0 0 10px 0; color: #666;">Activity Listing Coming Soon</p>
          <p style="margin: 0; font-size: 12px; color: #999;">Backend endpoint for listing activities is not yet available</p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #0066cc;">Activity tracking will be available once the endpoint is deployed</p>
        </div>
      </div>`;
    return;
  } catch (error) {
    console.error('Failed to load activities:', error);
    document.getElementById('recentActivityList').innerHTML = '<div class="loading">Unable to load activities</div>';
  }
}

// Load Admins
async function loadAdminsData() {
  try {
    const adminsList = document.getElementById('adminsList');
    
    console.log('ℹ️ Admin listing endpoint not available in backend');
    adminsList.innerHTML = `
      <tr>
        <td colspan="6" class="loading" style="padding: 20px;">
          <div style="text-align: center;">
            <p style="margin: 0 0 10px 0; color: #666;">Admin Listing Coming Soon</p>
            <p style="margin: 0; font-size: 12px; color: #999;">Backend endpoint for listing admins is not yet available</p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #0066cc;">You can create, block, and unblock admins using the action buttons</p>
          </div>
        </td>
      </tr>`;
    return;
  } catch (error) {
    console.error('Failed to load admins:', error);
    showNotification('Admin listing not available yet', 'info');
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
  if (!confirmAction('Are you sure you want to block this admin?')) return;
  try {
    await API.blockAdmin(adminId);
    showNotification('Admin blocked successfully', 'success');
    loadAdminsData();
  } catch (error) {
    console.error('Error blocking admin:', error);
    showNotification('Failed to block admin: ' + error.message, 'error');
  }
}

async function unblockAdmin(adminId) {
  if (!confirmAction('Are you sure you want to unblock this admin?')) return;
  try {
    await API.unblockAdmin(adminId);
    showNotification('Admin unblocked successfully', 'success');
    loadAdminsData();
  } catch (error) {
    console.error('Error unblocking admin:', error);
    showNotification('Failed to unblock admin: ' + error.message, 'error');
  }
}

// Load Users
async function loadUsersData() {
  try {
    const usersList = document.getElementById('usersList');
    
    console.log('ℹ️ User listing endpoint not available in backend');
    usersList.innerHTML = `
      <tr>
        <td colspan="7" class="loading" style="padding: 20px;">
          <div style="text-align: center;">
            <p style="margin: 0 0 10px 0; color: #666;">User Listing Coming Soon</p>
            <p style="margin: 0; font-size: 12px; color: #999;">Backend endpoint for listing users is not yet available</p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #0066cc;">You can block and unblock users using the action endpoints</p>
          </div>
        </td>
      </tr>`;
    return;
  } catch (error) {
    console.error('Failed to load users:', error);
    showNotification('User listing not available yet', 'info');
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
    
    console.log('ℹ️ Organization listing endpoint not available in backend');
    orgsList.innerHTML = `
      <tr>
        <td colspan="7" class="loading" style="padding: 20px;">
          <div style="text-align: center;">
            <p style="margin: 0 0 10px 0; color: #666;">Organization Listing Coming Soon</p>
            <p style="margin: 0; font-size: 12px; color: #999;">Backend endpoint for listing organizations is not yet available</p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #0066cc;">You can create and manage organizations using the action endpoints</p>
          </div>
        </td>
      </tr>`;
    return;
  } catch (error) {
    console.error('Failed to load organizations:', error);
    showNotification('Organization listing not available yet', 'info');
  }
}

// Load Devices
async function loadDevicesData() {
  try {
    const devicesList = document.getElementById('devicesList');
    
    console.log('ℹ️ Device listing endpoint not available in backend');
    devicesList.innerHTML = `
      <tr>
        <td colspan="7" class="loading" style="padding: 20px;">
          <div style="text-align: center;">
            <p style="margin: 0 0 10px 0; color: #666;">Device Listing Coming Soon</p>
            <p style="margin: 0; font-size: 12px; color: #999;">Backend endpoint for listing devices is not yet available</p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #0066cc;">You can block and unblock devices using the action endpoints</p>
          </div>
        </td>
      </tr>`;
    return;
  } catch (error) {
    console.error('Failed to load devices:', error);
    showNotification('Device listing not available yet', 'info');
  }
}

// Load Activities
async function loadActivitiesData() {
  try {
    const activitiesList = document.getElementById('activitiesList');
    
    console.log('ℹ️ Activity listing endpoint not available in backend');
    activitiesList.innerHTML = `
      <tr>
        <td colspan="6" class="loading" style="padding: 20px;">
          <div style="text-align: center;">
            <p style="margin: 0 0 10px 0; color: #666;">Activity Listing Coming Soon</p>
            <p style="margin: 0; font-size: 12px; color: #999;">Backend endpoint for listing activities is not yet available</p>
          </div>
        </td>
      </tr>`;
    return;
  } catch (error) {
    console.error('Failed to load activities:', error);
    showNotification('Activity listing not available yet', 'info');
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

async function blockDevice(deviceId) {
  if (!confirmAction('Are you sure you want to block this device?')) return;
  try {
    await API.blockDevice(deviceId);
    showNotification('Device blocked successfully', 'success');
    loadDevicesData();
  } catch (error) {
    console.error('Error blocking device:', error);
    showNotification('Failed to block device: ' + error.message, 'error');
  }
}

async function unblockDevice(deviceId) {
  if (!confirmAction('Are you sure you want to unblock this device?')) return;
  try {
    await API.unblockDevice(deviceId);
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
    addAdminBtn.addEventListener('click', () => {
      const newRole = prompt('Enter role (SUPER_ADMIN, ORG_ADMIN, OPERATIONS_ADMIN, SUPPORT_ADMIN, AUDIT_ADMIN):');
      if (!newRole) return;
      const email = prompt('Enter email:');
      if (!email) return;
      const fullName = prompt('Enter full name:');
      if (!fullName) return;

      createNewAdmin({ email, fullName, role: newRole });
    });
  }

  if (addOrgBtn) {
    addOrgBtn.addEventListener('click', () => {
      const orgName = prompt('Enter organization name:');
      if (!orgName) return;
      const email = prompt('Enter email:');
      if (!email) return;
      const contact = prompt('Enter contact person:');
      if (!contact) return;
      const phone = prompt('Enter phone:');
      if (!phone) return;

      createNewOrganization({ organizationName: orgName, email, contactPerson: contact, phone });
    });
  }
}

async function createNewAdmin(adminData) {
  try {
    await API.createAdmin(adminData);
    showNotification('Admin created successfully', 'success');
    loadAdminsData();
  } catch (error) {
    console.error('Error creating admin:', error);
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

// DEMO DATA LOADING FUNCTIONS REMOVED - Using real API calls instead

console.log('✅ Dashboard script loaded - Ready for real backend integration');
