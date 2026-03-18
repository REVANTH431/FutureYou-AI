import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { scoreAll } from './scoring.js';
import { Session } from './models/Session.js';

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/futureyou';

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
  }),
);
app.use(express.json());

mongoose
  .connect(MONGO_URI, {
    autoIndex: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error', err);
  });

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Compute prediction (scores) and optionally persist a session
app.post('/api/predict', async (req, res) => {
  try {
    const input = req.body?.input || {};
    const label = req.body?.label || null;

    const scores = scoreAll(input);

    let sessionId = null;
    try {
      const session = await Session.create({ label, input, scores });
      sessionId = session._id;
    } catch (e) {
      // If DB is down, still return scores.
      console.error('Failed to persist session', e.message);
    }

    res.json({ scores, sessionId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compute prediction' });
  }
});

// Retrieve stored session
app.get('/api/session/:id', async (req, res) => {
  try {
    const doc = await Session.findById(req.params.id).lean();
    if (!doc) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load session' });
  }
});

app.listen(PORT, () => {
  console.log(`FutureYou API listening on http://localhost:${PORT}`);
});

