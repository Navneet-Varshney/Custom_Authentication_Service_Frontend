const API_BASE = window.RUNTIME_ENV.API_BASE_URL;

function getDeviceUUID() {
  let uuid = localStorage.getItem("deviceUUID");
  if (!uuid) { uuid = crypto.randomUUID(); localStorage.setItem("deviceUUID", uuid); }
  return uuid;
}

function authHeaders() {
  const token = localStorage.getItem("accessToken");
  const headers = { "x-device-uuid": getDeviceUUID() };
  if (token) headers["x-access-token"] = token;
  return headers;
}

function saveNewToken(res) {
  const t = res.headers.get("x-access-token");
  if (t) localStorage.setItem("accessToken", t);
}

// ===== Load Account Details =====
async function loadAccount() {
  const accountInfo = document.getElementById("accountInfo");
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: authHeaders(),
      credentials: "include",
    });
    saveNewToken(res);

    if (res.status === 401) { window.location.href = "../auth/login.html"; return; }

    const data = await res.json();
    if (!res.ok || !data.success) {
      accountInfo.innerHTML = `<span class="error">${data.message || "Failed to load account."}</span>`;
      return;
    }

    const u = data.data;
    accountInfo.innerHTML = `
      <p><strong>Name:</strong> ${u.firstName || "—"}</p>
      <p><strong>Email:</strong> ${u.email || "—"}</p>
      <p><strong>Phone:</strong> ${u.phone || "—"}</p>
      <p><strong>Role:</strong> ${u.role || "—"}</p>
      <p><strong>2FA:</strong> ${u.isTwoFactorEnabled ? "✅ Enabled" : "❌ Disabled"}</p>
      <p><strong>Status:</strong> ${u.isActive ? "🟢 Active" : "🔴 Inactive"}</p>
    `;
  } catch (err) {
    accountInfo.innerHTML = `<span class="error">Network error. Could not load account.</span>`;
  }
}

// ===== Sign Out =====
document.getElementById("signoutBtn").addEventListener("click", async () => {
  const btn = document.getElementById("signoutBtn");
  const dashError = document.getElementById("dashError");
  btn.disabled = true;
  btn.textContent = "Signing out...";
  try {
    const res = await fetch(`${API_BASE}/auth/signout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      dashError.textContent = data.message || "Sign out failed.";
      btn.disabled = false;
      btn.textContent = "Sign Out";
      return;
    }
    localStorage.removeItem("accessToken");
    window.location.href = "../auth/login.html";
  } catch (err) {
    dashError.textContent = "Network error.";
    btn.disabled = false;
    btn.textContent = "Sign Out";
  }
});

loadAccount();
