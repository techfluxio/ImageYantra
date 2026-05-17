/* ════════════════════════════════════════════════════════
   IMAGEYANTRA BACKEND — Main Server
   Stack: Node.js + Express + Nodemailer
   Deploy: Render / Railway (free tier)
════════════════════════════════════════════════════════ */
require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const config       = require('./config');
const contactRoute = require('./routes/contact');
const { contactLimiter } = require('./middleware/rateLimiter');
const { errorHandler }   = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1);

/* ── CORS ──────────────────────────────────────────────── */
app.use(cors({
  origin: config.cors.origin,
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

/* ── Body parsing ──────────────────────────────────────── */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/* ── Health check ──────────────────────────────────────── */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'imageyantra-backend', timestamp: new Date().toISOString() });
});

/* ── API routes ────────────────────────────────────────── */
app.use('/api/contact', contactLimiter, contactRoute);

/* ── 404 handler ───────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({ success: false, errors: ['Route not found.'] });
});

/* ── Error handler ─────────────────────────────────────── */
app.use(errorHandler);

/* ── Start ─────────────────────────────────────────────── */
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`✅ ImageYantra backend running on port ${PORT}`);
  console.log(`   CORS origin: ${JSON.stringify(config.cors.origin)}`);
  console.log(`   Contact email: ${config.email.contact}`);
});
