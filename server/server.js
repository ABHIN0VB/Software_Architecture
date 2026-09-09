require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// ── MIDDLEWARE ──
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── SERVE STATIC FRONTEND FILES ──
app.use(express.static(path.join(__dirname, '..')));

// ── API ROUTES ──
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/ai', require('./routes/ai'));

// ── HEALTH CHECK ──
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FeastFleet API is running 🚀',
    timestamp: new Date().toISOString()
  });
});

// ── 404 HANDLER ──
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// ── GLOBAL ERROR HANDLER ──
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// ── START SERVER ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║    🔥 FeastFleet Server Running      ║
  ║    Port: ${PORT}                        ║
  ║    API:  http://localhost:${PORT}/api    ║
  ║    Web:  http://localhost:${PORT}        ║
  ╚══════════════════════════════════════╝
  `);
});
