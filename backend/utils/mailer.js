/* ════════════════════════════════════════════════════════
   IMAGEYANTRA BACKEND — Nodemailer transporter
════════════════════════════════════════════════════════ */
const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 587,
  secure: false,
  auth: {
    user: config.gmail.user,
    pass: config.gmail.password,
  },
});

/**
 * Send contact form email.
 * Business inquiries → business@imageyantra.in
 * Everything else   → contact@imageyantra.in
 */
async function sendContactEmail({ name, email, messageType, message }) {
  const isBusiness = /business/i.test(messageType);
  const recipient = isBusiness ? config.email.business : config.email.contact;
  const subject = `[ImageYantra] ${messageType || 'New message'} from ${name}`;

  const html = `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
    <div style="margin-bottom:24px">
      <h2 style="font-size:20px;color:#0d0b1a;margin:0 0 4px">New Contact Form Submission</h2>
      <p style="font-size:13px;color:#9ca3af;margin:0">Submitted via imageyantra.in/contact/</p>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr>
        <td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;width:130px"><strong>Name</strong></td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#0d0b1a">${escHtml(name)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #f3f4f6"><strong>Email</strong></td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6">
          <a href="mailto:${escHtml(email)}" style="color:#8133e0">${escHtml(email)}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #f3f4f6"><strong>Type</strong></td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#0d0b1a">${escHtml(messageType || 'General')}</td>
      </tr>
    </table>
    <div style="margin-top:20px;padding:16px;background:#f9f9ff;border-radius:8px;border-left:4px solid #8133e0">
      <p style="font-size:13px;color:#6b7280;margin:0 0 8px"><strong>Message:</strong></p>
      <p style="font-size:14px;color:#0d0b1a;line-height:1.6;margin:0;white-space:pre-wrap">${escHtml(message)}</p>
    </div>
    <p style="margin-top:20px;font-size:12px;color:#9ca3af">
      Reply directly to this email to respond to ${escHtml(name)}.
    </p>
  </div>`;

  const info = await transporter.sendMail({
    from: `"ImageYantra" <${config.gmail.user}>`,
    to: recipient,
    replyTo: email,
    subject,
    html,
  });

  return { messageId: info.messageId, recipient };
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { sendContactEmail };
