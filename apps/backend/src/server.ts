import dotenv from 'dotenv';
dotenv.config();

console.log('?? DEBUG SERVER MONGODB_URI =', process.env.MONGODB_URI);

import { connectDB } from './config/database';
import express from 'express';
import cors from 'cors';

const app = express();

// ✅ FIXED CORS — Allows Vercel + Localhost
app.use(
  cors({
    origin: [
      'https://footy-oracle-v2.vercel.app',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use(express.json());

// DB
connectDB();

// Health
app.get('/health', (_, res) =>
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    features: {
      fixtures: 'operational',
      goldenBets: 'operational',
      betBuilder: 'operational',
      cronJobs: 'active',
    },
  })
);

// ✅ ROUTES (clean, no duplicates)
import fixturesAdmin from './routes/fixturesAdmin';
app.use('/api/admin', fixturesAdmin);

import fixtures from './routes/fixtures';
app.use('/api/fixtures', fixtures);

import goldenBets from './routes/goldenBets';
app.use('/api/golden-bets', goldenBets);

import betBuilders from './routes/betBuilders';
app.use('/api/bet-builders', betBuilders);

// Start Server
app.listen(10000, () => {
  console.log('Footy Oracle API running on port 10000');
});

