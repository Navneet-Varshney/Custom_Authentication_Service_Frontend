const http = require('http');
const https = require('https');
const url = require('url');

// Configuration
const BACKEND_URL = 'http://localhost:8081';
const PROXY_PORT = 3000;
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10 MB

// Logging utility
function logRequest(method, path, statusCode = null, duration = null) {
  const timestamp = new Date().toISOString();
  const status = statusCode ? `${statusCode}` : 'pending';
  const time = duration ? `${duration}ms` : '';
  console.log(`[${timestamp}] ${method.padEnd(6)} ${path.padEnd(50)} -> ${status} ${time}`);
}

// Error logger
function logError(method, path, error) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ❌ ERROR ${method} ${path}: ${error.message}`);
}

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse URL
  const targetUrl = BACKEND_URL + req.url;
  const parsedUrl = url.parse(targetUrl);

  // Prepare request options
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.path,
    method: req.method,
    headers: {
      ...req.headers,
      host: parsedUrl.host,
    },
  };

  // Remove hop-by-hop headers
  delete options.headers['connection'];
  delete options.headers['content-length'];

  const startTime = Date.now();
  logRequest(req.method, req.url);

  // Make request to backend with timeout
  const proxyReq = http.request(options, (proxyRes) => {
    const duration = Date.now() - startTime;
    logRequest(req.method, req.url, proxyRes.statusCode, duration);

    // Forward response headers
    Object.keys(proxyRes.headers).forEach((key) => {
      res.setHeader(key, proxyRes.headers[key]);
    });

    res.writeHead(proxyRes.statusCode);
    proxyRes.pipe(res);
  });

  // Handle errors
  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Backend unreachable', message: err.message }));
  });

  // Forward request body
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

server.listen(PROXY_PORT, () => {
  console.log(`✅ CORS Proxy running on http://localhost:${PROXY_PORT}`);
  console.log(`➡️  Forwarding to ${BACKEND_URL}`);
  console.log('⏸️  Press Ctrl+C to stop');
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
