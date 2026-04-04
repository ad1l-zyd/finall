/**
 * Request Logger Middleware
 * Logs all incoming requests
 */

const config = require('../config/config');

module.exports = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`;
    
    if (config.LOG_LEVEL === 'debug') {
      console.log(logMessage);
      if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', JSON.stringify(req.body, null, 2).substring(0, 200));
      }
    }
  });

  next();
};
