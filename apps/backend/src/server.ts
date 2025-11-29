import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 DEBUG SERVER MONGODB_URI =', process.env.MONGODB_URI);

import { connectDB } from './config/database';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { wsService } from './services/websocket';

const app = express();
const httpServer = createServer(app);

// ------------------------------------
// 🔥 DEBUG LOGGER — SHOWS WHO SETS CORS
// ------------------------------------
app.use((req, res, next) => {
  const originalSetHeader = res.setHeader.bind(res);
  res.setHeader = (key, value) => {
    console.log("🔥 HEADER SET:", key, value);
    originalSetHeader(key, value);
  };
  next();
});

// ------------------------------
// 🔥 FINAL CORS CONFIG (CORRECT)
// ------------------------------
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
// WEBSOCKET
// --------------------
wsService.initialize(httpServer);

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
      websocket: 'operational',
    },
  });
});

// --------------------
// ROUTES
// --------------------
import fixturesAdmin from './routes/fixturesAdmin.js';
app.use('/api/admin', fixturesAdmin);

import fixtures from './routes/fixtures.js';
app.use('/api/fixtures', fixtures);

import goldenBets from './routes/goldenBets.js';
app.use('/api/golden-bets', goldenBets);

import betBuilders from './routes/betBuilder.js';
app.use('/api/bet-builders', betBuilders);


// --------------------
// START SERVER
// --------------------
httpServer.listen(10000, () => {
  console.log('⚽ Footy Oracle API running on port 10000');
  console.log('🔌 WebSocket server ready at ws://localhost:10000/ws');
});
