/**
 * Quick test script to verify Pinata endpoint is working
 */

const http = require('http');

const data = JSON.stringify({
  pinataJWT: 'test-jwt-value'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/utility/pinata-test',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('\n=== PINATA TEST ENDPOINT RESPONSE ===');
    console.log(`Status: ${res.statusCode}`);
    try {
      const json = JSON.parse(body);
      console.log('Response:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Raw Response:', body);
    }
  });
});

req.on('error', (error) => {
  console.error('\n=== ERROR ===');
  console.error('Failed to connect to backend:', error.message);
  console.error('Make sure the backend is running: cd backend && node server.js');
});

console.log('Testing Pinata endpoint at http://localhost:3001/api/utility/pinata-test...');
req.write(data);
req.end();
