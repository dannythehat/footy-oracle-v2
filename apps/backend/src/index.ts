import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
import goldenBetsRouter from './routes/goldenBets.js';
import fixturesRouter from './routes/fixtures.js';
import predictionsRouter from './routes/predictions.js';
import statsRouter from './routes/stats.js';
import bettingInsightsRouter from './routes/bettingInsights.js';
import pnlRouter from './routes/pnl.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database on cold start
let dbConnected = false;
const ensureDbConnection = async () => {
  if (!dbConnected) {
    await connectDatabase();
    dbConnected = true;
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API Routes with DB connection
app.use('/api/golden-bets', async (req, res, next) => {
  await ensureDbConnection();
  next();
}, goldenBetsRouter);

app.use('/api/fixtures', async (req, res, next) => {
  await ensureDbConnection();
  next();
}, fixturesRouter);

app.use('/api/predictions', async (req, res, next) => {
  await ensureDbConnection();
  next();
}, predictionsRouter);

app.use('/api/stats', async (req, res, next) => {
  await ensureDbConnection();
  next();
}, statsRouter);

app.use('/api/betting-insights', async (req, res, next) => {
  await ensureDbConnection();
  next();
}, bettingInsightsRouter);

app.use('/api/pnl', async (req, res, next) => {
  await ensureDbConnection();
  next();
}, pnlRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Export for Vercel serverless
export default app;
