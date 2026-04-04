/**
 * Global Error Handler Middleware
 * Catches and formats all errors
 */

const config = require('../config/config');

module.exports = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Server Error' : 'Client Error',
    message: message,
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
};
