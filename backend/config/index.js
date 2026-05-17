/* ════════════════════════════════════════════════════════
   IMAGEYANTRA BACKEND — Configuration
════════════════════════════════════════════════════════ */
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,

  gmail: {
    user:     process.env.GMAIL_USER,
    password: process.env.GMAIL_APP_PASSWORD,
  },

  email: {
    contact:  process.env.CONTACT_EMAIL  || 'contact@imageyantra.in',
    business: process.env.BUSINESS_EMAIL || 'business@imageyantra.in',
  },

  cors: {
    origin: process.env.ALLOWED_ORIGIN
      ? process.env.ALLOWED_ORIGIN.split(',').map(s => s.trim())
      : ['https://imageyantra.in'],
  },
};
