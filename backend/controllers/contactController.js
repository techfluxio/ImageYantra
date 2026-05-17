/* ════════════════════════════════════════════════════════
   IMAGEYANTRA BACKEND — Contact Controller
════════════════════════════════════════════════════════ */
const { sendContactEmail } = require('../utils/mailer');

/**
 * POST /api/contact
 * Body: { name, email, messageType, message }
 */
async function submitContact(req, res) {
  const { name, email, messageType, message } = req.body;

  // ── Validation ──────────────────────────────────────
  const errors = [];
  if (!name    || name.trim().length < 2)      errors.push('Name must be at least 2 characters.');
  if (!email   || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('A valid email address is required.');
  if (!message || message.trim().length < 10)  errors.push('Message must be at least 10 characters.');

  if (errors.length) {
    return res.status(400).json({ success: false, errors });
  }

  // ── Sanitise ─────────────────────────────────────────
  const payload = {
    name:        name.trim().slice(0, 120),
    email:       email.trim().slice(0, 254),
    messageType: (messageType || 'General Question').slice(0, 80),
    message:     message.trim().slice(0, 4000),
  };

  // ── Send ─────────────────────────────────────────────
  try {
    const result = await sendContactEmail(payload);
    console.log(`[contact] Email sent → ${result.recipient} | id: ${result.messageId}`);
    return res.status(200).json({ success: true, message: 'Your message has been sent successfully.' });
  } catch (err) {
    console.error('[contact] Email send error:', err.message);
    return res.status(500).json({ success: false, errors: ['Failed to send email. Please try again later.'] });
  }
}

module.exports = { submitContact };
