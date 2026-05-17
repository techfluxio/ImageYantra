/* ════════════════════════════════════════════════════════
   IMAGEYANTRA BACKEND — Error Handler Middleware
════════════════════════════════════════════════════════ */

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[error]', err.message);
  res.status(err.status || 500).json({
    success: false,
    errors: [err.message || 'An unexpected error occurred.'],
  });
}

module.exports = { errorHandler };
