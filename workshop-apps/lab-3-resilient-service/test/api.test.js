'use strict';

const test   = require('node:test');
const assert = require('node:assert/strict');
const http   = require('node:http');
const app    = require('../index.js');

let server;
let port;

// ---------------------------------------------------------------------------
// Helper: make an HTTP GET against the test server
// ---------------------------------------------------------------------------
function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${port}${path}`, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------
test.before(() => new Promise((resolve, reject) => {
  server = app.listen(0, '127.0.0.1', err => {
    if (err) return reject(err);
    port = server.address().port;
    resolve();
  });
}));

test.after(() => new Promise((resolve, reject) => {
  server.close(err => (err ? reject(err) : resolve()));
}));

// ---------------------------------------------------------------------------
// Test 1: GET /health
// ---------------------------------------------------------------------------
test('GET /health returns 200 and status "UP"', async () => {
  const { status, body } = await get('/health');
  assert.equal(status, 200);
  const data = JSON.parse(body);
  assert.equal(data.status, 'UP');
  assert.ok(data.timestamp, 'timestamp should be present');
});

// ---------------------------------------------------------------------------
// Test 2: rate limiter (must run last — shares in-memory state with the app)
// ---------------------------------------------------------------------------
test('GET /api/data rate-limits after 5 requests', async () => {
  const results = [];
  for (let i = 0; i < 6; i++) {
    const { status } = await get('/api/data');
    results.push(status);
  }
  // First 5 must be 200, 6th must be 429
  assert.deepEqual(results.slice(0, 5), [200, 200, 200, 200, 200]);
  assert.equal(results[5], 429);
});
