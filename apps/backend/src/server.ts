import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 DEBUG SERVER MONGODB_URI =', process.env.MONGODB_URI);

import { connectDB } from './config/database.js';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { wsService } from './services/websocket.js';
import { startFixturesCron } from './cron/fixturesCron.js';
import { startLiveScoresCron } from './cron/liveScoresCron.js';

const app = express();
const httpServer = createServer(app);

// ------------------------------
// 🔥 CORS CONFIG WITH VERCEL DOMAIN
// ------------------------------
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://footy-oracle-v2.vercel.app',
      'https://footy-oracle-v2-568z3e2jh-dannys-projects-83c67aed.vercel.app',
      'https://footy-oracle-v2-9156zvba2-dannys-projects-83c67aed.vercel.app'
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
// CRON JOBS - Initialize fixtures loading and live scores
// --------------------
startFixturesCron();
startLiveScoresCron(); // CRITICAL: Start live scores updates

// --------------------
// WEBSOCKET
// --------------------
wsService.initialize(httpServer);

// --------------------
// KEEP-ALIVE ENDPOINT (Prevents Render cold starts)
// --------------------
app.get('/ping', (_, res) => {
  res.json({ 
    status: 'alive', 
    timestamp: new Date().toISOString() 
  });
});

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
      liveScores: 'operational',
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

import liveFixtures from './routes/liveFixtures.js';
app.use('/api/live-fixtures', liveFixtures);

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
  console.log('🌐 CORS enabled for Vercel domain: footy-oracle-v2.vercel.app');
  console.log('⏰ Fixtures cron job initialized - loading fixtures...');
  console.log('🔴 Live scores cron job active - updating every minute');
});
