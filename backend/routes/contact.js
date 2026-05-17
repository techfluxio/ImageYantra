/* ════════════════════════════════════════════════════════
   IMAGEYANTRA BACKEND — Contact Route
════════════════════════════════════════════════════════ */
const express = require('express');
const router  = express.Router();
const { submitContact } = require('../controllers/contactController');

router.post('/', submitContact);

module.exports = router;
