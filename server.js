const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// --- Security ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://pagead2.googlesyndication.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://pagead2.googlesyndication.com"],
      fontSrc: ["'self'"],
      mediaSrc: ["'self'", "blob:"],
    }
  }
}));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '1kb' }));

// Rate limit score submissions
const scoreLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many requests' }
});

// --- Static files with caching ---
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: isProd ? '1d' : 0,
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Service worker must never be cached by browser
    if (filePath.endsWith('sw.js')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// --- Leaderboard API ---
let highScores = [];

app.post('/api/score', scoreLimiter, (req, res) => {
  const { name, score } = req.body;
  if (!name || typeof score !== 'number' || score < 0 || score > 999999) {
    return res.status(400).json({ error: 'Invalid score' });
  }
  const sanitizedName = String(name).slice(0, 20).replace(/[<>"'&]/g, '');
  highScores.push({ name: sanitizedName, score, date: new Date().toISOString() });
  highScores.sort((a, b) => b.score - a.score);
  highScores = highScores.slice(0, 100);
  const rank = highScores.findIndex(s => s.name === sanitizedName && s.score === score) + 1;
  res.json({ rank, total: highScores.length });
});

app.get('/api/scores', (req, res) => {
  res.json(highScores.slice(0, 20));
});

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// --- Privacy Policy (required for App Store) ---
app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacy.html'));
});

// --- Catch-all ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Error handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`🎮 Block Smash Puzzle running at http://localhost:${PORT} [${isProd ? 'PRODUCTION' : 'DEV'}]`);
});
