'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// ---------------------------------------------------------------------------
// In-memory sliding-window rate limiter
// ---------------------------------------------------------------------------
const RATE_LIMIT = 5;          // max requests per window
const WINDOW_MS  = 10_000;     // 10 seconds

const clients = new Map(); // ip -> [timestamp, ...]

function rateLimiter(req, res, next) {
  const ip  = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();

  if (!clients.has(ip)) {
    clients.set(ip, []);
  }

  // Keep only timestamps within the current window
  const timestamps = clients.get(ip).filter(t => now - t < WINDOW_MS);
  timestamps.push(now);
  clients.set(ip, timestamps);

  if (timestamps.length > RATE_LIMIT) {
    return res.status(429).json({ error: 'Too many requests. Please wait.' });
  }

  next();
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET /health
app.get('/health', (_req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// GET /api/data  (rate-limited)
app.get('/api/data', rateLimiter, (_req, res) => {
  const dataPath = path.join(__dirname, 'data', 'sample.json');

  fs.readFile(dataPath, 'utf8', (err, raw) => {
    if (err) {
      return res.status(500).json({ error: 'Data file not found.' });
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(500).json({ error: 'Data file is malformed JSON.' });
    }

    res.json(data);
  });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
if (require.main === module) {
  app.listen(3000, () => {
    console.log('Service listening on http://localhost:3000');
  });
}

module.exports = app;
