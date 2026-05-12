/* ════════════════════════════════════════════════════════
   IMAGEYANTRA BACKEND — Rate Limiter Middleware
════════════════════════════════════════════════════════ */
const rateLimit = require('express-rate-limit');

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 5,                      // max 5 submissions per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    errors: ['Too many submissions. Please wait 15 minutes and try again.'],
  },
});

module.exports = { contactLimiter };
