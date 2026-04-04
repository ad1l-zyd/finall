#!/usr/bin/env node

/**
 * Credential Verification System - Backend Server
 * Main Express server for handling API requests
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import configuration
const config = require('./config/config');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const authMiddleware = require('./middleware/auth');

// Import routes
const adminRoutes = require('./routes/admin');
const institutionRoutes = require('./routes/institution');
const studentRoutes = require('./routes/student');
const employerRoutes = require('./routes/employer');
const blockchainRoutes = require('./routes/blockchain');
const utilityRoutes = require('./routes/utility');

// Initialize Express app
const app = express();

// Ensure required directories exist
const requiredDirs = [
  config.UPLOAD_DIR,
  config.DB_PATH,
  path.join(config.DB_PATH, 'institutions'),
  path.join(config.DB_PATH, 'students'),
  path.join(config.DB_PATH, 'certificates'),
  path.join(config.DB_PATH, 'zkp-proofs')
];

requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created directory: ${dir}`);
  }
});

// Middleware
app.use(cors({
  origin: config.CORS_ORIGIN.split(','),
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(requestLogger);

// Static files
app.use('/uploads', express.static(config.UPLOAD_DIR));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    network: config.NETWORK
  });
});

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/institution', institutionRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/utility', utilityRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    path: req.path
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = config.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   Credential Verification System - Backend Server          ║
╠════════════════════════════════════════════════════════════╣
║  Status: ✓ Running                                          ║
║  Port: ${PORT.toString().padEnd(45, ' ')}║
║  Environment: ${config.NODE_ENV.padEnd(39, ' ')}║
║  Network: ${config.NETWORK.padEnd(42, ' ')}║
║  RPC URL: ${config.RPC_URL.padEnd(38, ' ')}║
║                                                            ║
║  Institution Registry: ${config.INSTITUTION_REGISTRY_ADDRESS.substring(0, 15).padEnd(20, ' ')}║
║  Certificate Registry: ${config.CERTIFICATE_REGISTRY_ADDRESS.substring(0, 15).padEnd(17, ' ')}║
╚════════════════════════════════════════════════════════════╝

API Documentation:
  - Health Check: GET /health
  - Admin Routes: /api/admin/*
  - Institution Routes: /api/institution/*
  - Student Routes: /api/student/*
  - Employer Routes: /api/employer/*
  - Blockchain Routes: /api/blockchain/*
  - Utility Routes: /api/utility/*
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
