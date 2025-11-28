import dotenv from 'dotenv';
dotenv.config();

console.log('?? DEBUG SERVER MONGODB_URI =', process.env.MONGODB_URI);

import { connectDB } from './config/database';
import express from 'express';
import cors from 'cors';

const app = express();

// --------------------
// 🔥 FINAL CORS CONFIG
// --------------------
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://footy-oracle-v2.vercel.app'
    ],
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  })
);

app.use(express.json());

// --------------------
// DATABASE
// --------------------
connectDB();

// --------------------
// HEALTH CHECK
// --------------------
app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    features: {
      fixtures: 'operational',
      goldenBets: 'operational',
      betBuilder: 'operational',
      cronJobs: 'active',
    },
  });
});

// --------------------
// ROUTES
// --------------------
import fixturesAdmin from './routes/fixturesAdmin';
app.use('/api/admin', fixturesAdmin);

import fixtures from './routes/fixtures';
app.use('/api/fixtures', fixtures);

import goldenBets from './routes/goldenBets';
app.use('/api/golden-bets', goldenBets);

import betBuilders from './routes/betBuilders';
app.use('/api/bet-builders', betBuilders);

// --------------------
// START SERVER
// --------------------
app.listen(10000, () => {
  console.log('Footy Oracle API running on port 10000');
});
