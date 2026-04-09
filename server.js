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

// --- Weekly Tournament API ---
let tournamentScores = {}; // { weekKey: [{ name, score, date }] }

app.post('/api/tournament', scoreLimiter, (req, res) => {
  const { week, name, score } = req.body;
  if (!week || !name || typeof score !== 'number' || score < 0 || score > 999999) {
    return res.status(400).json({ error: 'Invalid tournament entry' });
  }
  const sanitizedName = String(name).slice(0, 20).replace(/[<>"'&]/g, '');
  if (!tournamentScores[week]) tournamentScores[week] = [];
  // Update existing entry or add new
  const existing = tournamentScores[week].find(s => s.name === sanitizedName);
  if (existing) {
    if (score > existing.score) existing.score = score;
  } else {
    tournamentScores[week].push({ name: sanitizedName, score, date: new Date().toISOString() });
  }
  tournamentScores[week].sort((a, b) => b.score - a.score);
  tournamentScores[week] = tournamentScores[week].slice(0, 100);
  const rank = tournamentScores[week].findIndex(s => s.name === sanitizedName) + 1;
  res.json({ rank, total: tournamentScores[week].length });
});

app.get('/api/tournament', (req, res) => {
  const week = req.query.week;
  if (!week || !tournamentScores[week]) return res.json([]);
  res.json(tournamentScores[week].slice(0, 20));
});

// --- Feedback API (from low-rating reviews) ---
let feedbackEntries = [];

app.post('/api/feedback', scoreLimiter, (req, res) => {
  const { rating, feedback, version } = req.body;
  if (!feedback || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Invalid feedback' });
  }
  const sanitizedFeedback = String(feedback).slice(0, 500).replace(/[<>"']/g, '');
  feedbackEntries.push({
    rating,
    feedback: sanitizedFeedback,
    version: version || 'unknown',
    date: new Date().toISOString()
  });
  feedbackEntries = feedbackEntries.slice(-200); // Keep last 200
  res.json({ success: true });
});

// --- Challenge Verification API ---
let challenges = {};

app.post('/api/challenge', scoreLimiter, (req, res) => {
  const { challengerId, score } = req.body;
  if (!challengerId || typeof score !== 'number' || score < 0 || score > 999999) {
    return res.status(400).json({ error: 'Invalid challenge' });
  }
  const challengeId = Math.random().toString(36).slice(2, 10);
  challenges[challengeId] = {
    challengerId: String(challengerId).slice(0, 30),
    score,
    date: new Date().toISOString(),
    responses: []
  };
  // Clean old challenges (older than 7 days)
  const weekAgo = Date.now() - 7 * 86400000;
  for (const [id, ch] of Object.entries(challenges)) {
    if (new Date(ch.date).getTime() < weekAgo) delete challenges[id];
  }
  res.json({ challengeId, url: '/play?challenge=' + challengeId });
});

app.get('/api/challenge/:id', (req, res) => {
  const challenge = challenges[req.params.id];
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
  res.json({
    score: challenge.score,
    date: challenge.date,
    responses: challenge.responses.length
  });
});

// --- Analytics Summary API (for admin) ---
app.get('/api/analytics/summary', (req, res) => {
  const totalScores = highScores.length;
  const avgScore = totalScores > 0 ? Math.round(highScores.reduce((a, b) => a + b.score, 0) / totalScores) : 0;
  const weekKey = new Date().getFullYear() + '-W' + Math.ceil(((new Date() - new Date(new Date().getFullYear(), 0, 1)) / 86400000 + new Date(new Date().getFullYear(), 0, 1).getDay() + 1) / 7);
  const weeklyParticipants = tournamentScores[weekKey] ? tournamentScores[weekKey].length : 0;
  res.json({
    totalPlayers: totalScores,
    averageScore: avgScore,
    topScore: highScores.length > 0 ? highScores[0].score : 0,
    weeklyTournamentParticipants: weeklyParticipants,
    feedbackCount: feedbackEntries.length,
    activeChallenges: Object.keys(challenges).length
  });
});

// --- Periodic cleanup (every hour) ---
setInterval(() => {
  // Clean old tournament weeks (keep only current and last 2 weeks)
  const currentWeekNum = Math.ceil(((new Date() - new Date(new Date().getFullYear(), 0, 1)) / 86400000 + new Date(new Date().getFullYear(), 0, 1).getDay() + 1) / 7);
  const year = new Date().getFullYear();
  for (const key of Object.keys(tournamentScores)) {
    const [y, w] = key.split('-W').map(Number);
    if (y < year || (y === year && w < currentWeekNum - 2)) {
      delete tournamentScores[key];
    }
  }
  // Clean old challenges (older than 7 days)
  const weekAgo = Date.now() - 7 * 86400000;
  for (const [id, ch] of Object.entries(challenges)) {
    if (new Date(ch.date).getTime() < weekAgo) delete challenges[id];
  }
  // Trim scores if too many
  if (highScores.length > 500) highScores = highScores.slice(0, 100);
}, 3600000);

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
    scores: highScores.length,
    feedbacks: feedbackEntries.length,
    challenges: Object.keys(challenges).length
  });
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

// --- Graceful shutdown ---
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});
