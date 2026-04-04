// Dashboard State
let dashboardData = {
  admins: [],
  users: [],
  organizations: [],
  devices: [],
  activities: [],
};

// MOCK DATA FOR DEMO
const MOCK_DATA = {
  admins: [
    { _id: '1', email: 'super@admin.com', fullName: 'Super Admin', role: 'SUPER_ADMIN', isBlocked: false, createdAt: '2024-01-15' },
    { _id: '2', email: 'org@admin.com', fullName: 'Org Admin', role: 'ORG_ADMIN', isBlocked: false, createdAt: '2024-01-20' },
    { _id: '3', email: 'ops@admin.com', fullName: 'Operations Admin', role: 'OPERATIONS_ADMIN', isBlocked: false, createdAt: '2024-02-01' },
  ],
  users: [
    { _id: '1', email: 'john@example.com', fullName: 'John Doe', phone: '+1234567890', isBlocked: false, emailVerified: true, createdAt: '2024-01-10' },
    { _id: '2', email: 'jane@example.com', fullName: 'Jane Smith', phone: '+9876543210', isBlocked: false, emailVerified: true, createdAt: '2024-01-15' },
    { _id: '3', email: 'bob@example.com', fullName: 'Bob Johnson', phone: '+5555555555', isBlocked: true, emailVerified: false, createdAt: '2024-02-01' },
  ],
  organizations: [
    { _id: '1', organizationName: 'Tech Corp', email: 'contact@techcorp.com', contactPerson: 'Alice Brown', phone: '+1111111111', isDisabled: false, users: ['u1', 'u2'], createdAt: '2024-01-05' },
    { _id: '2', organizationName: 'Software Solutions', email: 'info@softsol.com', contactPerson: 'Charlie Davis', phone: '+2222222222', isDisabled: false, users: ['u3'], createdAt: '2024-01-20' },
    { _id: '3', organizationName: 'Digital Agency', email: 'hello@digagency.com', contactPerson: 'Diana Evans', phone: '+3333333333', isDisabled: true, users: [], createdAt: '2024-02-10' },
  ],
  devices: [
    { _id: '1', deviceId: 'DEV-001', userId: 'user1', deviceType: 'Mobile', osVersion: 'Android 13', isBlocked: false, lastActiveAt: '2024-02-28' },
    { _id: '2', deviceId: 'DEV-002', userId: 'user2', deviceType: 'Laptop', osVersion: 'Windows 11', isBlocked: false, lastActiveAt: '2024-02-27' },
    { _id: '3', deviceId: 'DEV-003', userId: 'user3', deviceType: 'Tablet', osVersion: 'iOS 17', isBlocked: true, lastActiveAt: '2024-02-20' },
  ],
  activities: [
    { _id: '1', adminId: 'admin1', action: 'CREATE', entityType: 'Admin', entityId: 'a1', timestamp: '2024-02-28T10:30:00', changes: {} },
    { _id: '2', adminId: 'admin2', action: 'BLOCK', entityType: 'User', entityId: 'u3', timestamp: '2024-02-27T14:45:00', changes: { isBlocked: 'true' } },
    { _id: '3', adminId: 'admin1', action: 'UPDATE', entityType: 'Organization', entityId: 'o1', timestamp: '2024-02-26T09:15:00', changes: { contactPerson: 'Name Changed' } },
  ]
};

// Initialize Dashboard
window.addEventListener('load', async () => {
  console.log('✅ Dashboard loaded in DEMO mode');

  // Set admin name
  document.getElementById('adminName').textContent = 'Demo Admin';

  // Setup event listeners
  setupNavigation();
  setupLogout();
  setupSidebarToggle();
  setupFilters();
  setupButtonListeners();

  // Load initial dashboard data (DEMO DATA)
  loadDashboardDataDemo();
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
      loadAdminsDataDemo();
      break;
    case 'users':
      loadUsersDataDemo();
      break;
    case 'organizations':
      loadOrganizationsDataDemo();
      break;
    case 'devices':
      loadDevicesDataDemo();
      break;
    case 'activities':
      loadActivitiesDataDemo();
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
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        showNotification('[DEMO] Logout successful', 'success');
        // In demo mode, just show message. In production, clear auth and redirect.
      }
    });
  }
}

// Dashboard Data - DEMO VERSION
function loadDashboardDataDemo() {
  try {
    // Update stats
    document.getElementById('totalAdmins').textContent = MOCK_DATA.admins.length;
    document.getElementById('totalUsers').textContent = MOCK_DATA.users.length;
    document.getElementById('totalOrgs').textContent = MOCK_DATA.organizations.length;
    document.getElementById('totalDevices').textContent = MOCK_DATA.devices.length;

    // Load recent activities
    loadRecentActivitiesDemo();
  } catch (error) {
    console.error('Failed to load dashboard:', error);
  }
}

function loadRecentActivitiesDemo() {
  try {
    const activities = MOCK_DATA.activities || [];
    const activityList = document.getElementById('recentActivityList');

    if (activities.length > 0) {
      activityList.innerHTML = activities.map((activity) => `
        <div class="activity-item">
          <div class="activity-icon">📝</div>
          <div>
            <div class="activity-action">${activity.action} - ${activity.entityType}</div>
            <div class="activity-timestamp">${formatDate(activity.timestamp)}</div>
          </div>
        </div>
      `).join('');
    } else {
      activityList.innerHTML = '<div class="loading">No activities yet</div>';
    }
  } catch (error) {
    console.error('Failed to load activities:', error);
  }
}

// Load Admins - DEMO
function loadAdminsDataDemo() {
  try {
    dashboardData.admins = MOCK_DATA.admins;

    if (dashboardData.admins.length === 0) {
      const adminsList = document.getElementById('adminsList');
      adminsList.innerHTML = '<tr><td colspan="6" class="loading">No admins found</td></tr>';
      return;
    }

    displayAdmins(dashboardData.admins);
  } catch (error) {
    console.error('Failed to load admins:', error);
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
  showNotification('[DEMO] Admin would be blocked', 'success');
}

async function unblockAdmin(adminId) {
  if (!confirmAction('Are you sure you want to unblock this admin?')) return;
  showNotification('[DEMO] Admin would be unblocked', 'success');
}

// Load Users
async function loadUsersData() {
  try {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '<tr class="loading-row"><td colspan="7">Loading...</td></tr>';

    const result = await API.getUsers();
    dashboardData.users = result.data || result.users || [];

    if (dashboardData.users.length === 0) {
      usersList.innerHTML = '<tr><td colspan="7" class="loading">No users found</td></tr>';
      return;
    }

    displayUsers(dashboardData.users);
  } catch (error) {
    console.error('Failed to load users:', error);
    showNotification('Failed to load users', 'error');
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
  showNotification('[DEMO] User would be blocked', 'success');
}

async function unblockUser(userId) {
  if (!confirmAction('Are you sure you want to unblock this user?')) return;
  showNotification('[DEMO] User would be unblocked', 'success');
}

// Load Organizations
async function loadOrganizationsData() {
  try {
    const orgsList = document.getElementById('organizationsList');
    orgsList.innerHTML = '<tr class="loading-row"><td colspan="7">Loading...</td></tr>';

    const result = await API.getOrganizations();
    dashboardData.organizations = result.data || result.organizations || [];

    if (dashboardData.organizations.length === 0) {
      orgsList.innerHTML = '<tr><td colspan="7" class="loading">No organizations found</td></tr>';
      return;
    }

    displayOrganizations(dashboardData.organizations);
  } catch (error) {
    console.error('Failed to load organizations:', error);
    showNotification('Failed to load organizations', 'error');
  }
}

function displayOrganizations(orgs) {
  const orgsList = document.getElementById('organizationsList');
  orgsList.innerHTML = orgs
    .map(
      (org) => `
    <tr>
      <td>${org.organizationName}</td>
      <td>${org.email}</td>
      <td>${org.contactPerson}</td>
      <td>${getStatusBadge(org.isDisabled ? 'blocked' : 'active')}</td>
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
  showNotification('[DEMO] Organization would be disabled', 'success');
}

async function enableOrganization(orgId) {
  if (!confirmAction('Are you sure you want to enable this organization?')) return;
  showNotification('[DEMO] Organization would be enabled', 'success');
}

// Load Devices
async function loadDevicesData() {
  try {
    const devicesList = document.getElementById('devicesList');
    devicesList.innerHTML = '<tr class="loading-row"><td colspan="7">Loading...</td></tr>';

    const result = await API.getDevices();
    dashboardData.devices = result.data || result.devices || [];

    if (dashboardData.devices.length === 0) {
      devicesList.innerHTML = '<tr><td colspan="7" class="loading">No devices found</td></tr>';
      return;
    }

    displayDevices(dashboardData.devices);
  } catch (error) {
    console.error('Failed to load devices:', error);
    showNotification('Failed to load devices', 'error');
  }
}

function displayDevices(devices) {
  const devicesList = document.getElementById('devicesList');
  devicesList.innerHTML = devices
    .map(
      (device) => `
    <tr>
      <td>${device.deviceId}</td>
      <td>${device.userId}</td>
      <td>${device.deviceType}</td>
      <td>${device.osVersion}</td>
      <td>${getStatusBadge(device.isBlocked ? 'blocked' : 'active')}</td>
      <td>${formatDate(device.lastActiveAt)}</td>
      <td>
        ${
          device.isBlocked
            ? `<button class="btn btn-sm btn-secondary" onclick="unblockDevice('${device._id}')">Unblock</button>`
            : `<button class="btn btn-sm btn-danger" onclick="blockDevice('${device._id}')">Block</button>`
        }
      </td>
    </tr>
  `
    )
    .join('');
}

async function blockDevice(deviceId) {
  if (!confirmAction('Are you sure you want to block this device?')) return;
  showNotification('[DEMO] Device would be blocked', 'success');
}

async function unblockDevice(deviceId) {
  if (!confirmAction('Are you sure you want to unblock this device?')) return;
  showNotification('[DEMO] Device would be unblocked', 'success');
}

// Load Activities
async function loadActivitiesData() {
  try {
    const activitiesList = document.getElementById('activitiesList');
    activitiesList.innerHTML = '<tr class="loading-row"><td colspan="6">Loading...</td></tr>';

    const result = await API.getActivityTracker();
    dashboardData.activities = result.data || result.activities || [];

    if (dashboardData.activities.length === 0) {
      activitiesList.innerHTML = '<tr><td colspan="6" class="loading">No activities found</td></tr>';
      return;
    }

    displayActivities(dashboardData.activities);
  } catch (error) {
    console.error('Failed to load activities:', error);
    showNotification('Failed to load activities', 'error');
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
  showNotification('[DEMO] Admin would be created: ' + JSON.stringify(adminData), 'success');
}

async function createNewOrganization(orgData) {
  showNotification('[DEMO] Organization would be created: ' + JSON.stringify(orgData), 'success');
}

// DEMO DATA LOADING FUNCTIONS
function loadUsersDataDemo() {
  dashboardData.users = MOCK_DATA.users;
  if (dashboardData.users.length === 0) {
    document.getElementById('usersList').innerHTML = '<tr><td colspan="7" class="loading">No users found</td></tr>';
    return;
  }
  displayUsers(dashboardData.users);
}

function loadOrganizationsDataDemo() {
  dashboardData.organizations = MOCK_DATA.organizations;
  if (dashboardData.organizations.length === 0) {
    document.getElementById('organizationsList').innerHTML = '<tr><td colspan="7" class="loading">No organizations found</td></tr>';
    return;
  }
  displayOrganizations(dashboardData.organizations);
}

function loadDevicesDataDemo() {
  dashboardData.devices = MOCK_DATA.devices;
  if (dashboardData.devices.length === 0) {
    document.getElementById('devicesList').innerHTML = '<tr><td colspan="7" class="loading">No devices found</td></tr>';
    return;
  }
  displayDevices(dashboardData.devices);
}

function loadActivitiesDataDemo() {
  dashboardData.activities = MOCK_DATA.activities;
  if (dashboardData.activities.length === 0) {
    document.getElementById('activitiesList').innerHTML = '<tr><td colspan="6" class="loading">No activities found</td></tr>';
    return;
  }
  displayActivities(dashboardData.activities);
}

console.log('✅ Dashboard script loaded (DEMO MODE)');
