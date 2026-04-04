const http = require('http');
const https = require('https');
const url = require('url');

const BACKEND_URL = 'http://localhost:8081';
const PROXY_PORT = 3000;

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

  console.log(`${req.method} ${req.url} -> ${targetUrl}`);

  // Make request to backend
  const proxyReq = http.request(options, (proxyRes) => {
    console.log(`Response: ${proxyRes.statusCode}`);

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
