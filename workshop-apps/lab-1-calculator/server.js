/**
 * server.js
 * Production Express server — serves the Vite dist/ build of the calculator.
 * Usage: node server.js [port]
 */

const express = require('express')
const path = require('path')

const app = express()
const PORT = process.env.PORT || Number(process.argv[2]) || 3000

// Serve built static assets
app.use(express.static(path.join(__dirname, 'dist')))

// SPA fallback — always return index.html for unknown routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Lab 1 Calculator running at http://localhost:${PORT}`)
})
