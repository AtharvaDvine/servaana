// Simple script to ping backend every 10 minutes to keep it awake
const https = require('https');

const BACKEND_URL = 'https://servaana-kcbs.onrender.com/api/auth/login';

function pingBackend() {
  const postData = JSON.stringify({
    email: 'keepalive@test.com',
    password: 'test'
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(BACKEND_URL, options, (res) => {
    console.log(`${new Date().toISOString()}: Backend pinged - Status: ${res.statusCode}`);
  });

  req.on('error', (e) => {
    console.log(`${new Date().toISOString()}: Ping failed - ${e.message}`);
  });

  req.write(postData);
  req.end();
}

// Ping every 10 minutes (600000 ms)
setInterval(pingBackend, 600000);
console.log('Keep-alive service started. Pinging backend every 10 minutes...');

// Initial ping
pingBackend();