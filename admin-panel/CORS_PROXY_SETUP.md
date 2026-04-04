# Admin Panel - CORS Proxy Setup

## Problem
Backend doesn't have CORS enabled, so frontend can't make direct requests.

## Solution
Created a simple CORS Proxy server that forwards requests with proper CORS headers.

```
Frontend (5500)  →  CORS Proxy (3000)  →  Backend (8081)
```

---

## 🚀 Quick Start

### Step 1: Install Python Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Start the CORS Proxy
**Windows:**
```bash
start-proxy.bat
```

**Mac/Linux:**
```bash
bash start-proxy.sh
```

**Or manually:**
```bash
python proxy.py
```

### Step 3: Test Login
- Frontend: http://localhost:5500
- Login with admin credentials
- You should see no CORS errors now!

---

## 🔍 What's Happening

1. **proxy.py** - Simple Flask server that:
   - Listens on port 3000
   - Accepts requests from frontend (5500)
   - Forwards to backend (8081)
   - Adds CORS headers to responses

2. **api.js** - Updated to use:
   - Old: `http://localhost:8081/admin-panel-service/api/v1`
   - New: `http://localhost:3000/admin-panel-service/api/v1`

3. **Backend** - Remains completely unchanged ✅

---

## 📝 Architecture

```
┌─────────────────────────┐
│  Frontend (5500)        │
│  - Login page           │
│  - Dashboard            │
└────────────┬────────────┘
             │ HTTP Request
             ↓
┌─────────────────────────┐
│  CORS Proxy (3000)      │
│  - Add CORS Headers     │
│  - Forward Requests     │
└────────────┬────────────┘
             │ HTTP Request
             ↓
┌─────────────────────────┐
│  Backend (8081)         │
│  - Admin Panel Service  │
│  - Database             │
└─────────────────────────┘
```

---

## ✅ Ports Used

| Port | Service |
|------|---------|
| 5500 | Frontend (Live Server) |
| 3000 | CORS Proxy |
| 8081 | Backend (Admin Service) |

---

## 🛠️ Configuration

To change proxy port, edit `proxy.py` line at bottom:
```python
if __name__ == '__main__':
    app.run(port=3000, debug=False)  # Change 3000 to desired port
```

Then update `api.js`:
```javascript
const ADMIN_API_BASE_URL = 'http://localhost:YOUR_PORT/admin-panel-service/api/v1';
```

---

## ❌ Troubleshooting

**"Port 3000 already in use"**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**"Module not found"**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**"Still getting CORS error"**
1. Make sure proxy is running: `http://localhost:3000` (check browser)
2. Restart frontend page
3. Check console for actual error

---

## ✨ Features

✅ No backend changes required
✅ CORS fully bypassed
✅ All requests forwarded correctly
✅ Token/Auth headers preserved
✅ Error messages preserved
✅ Lightweight & fast

---

Happy coding! 🎉
