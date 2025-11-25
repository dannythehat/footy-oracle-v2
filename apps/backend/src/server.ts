import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
import { startCronJobs } from './services/cronService.js';
import goldenBetsRouter from './routes/goldenBets.js';
import valueBetsRouter from './routes/valueBets.js';
import fixturesRouter from './routes/fixtures.js';
import predictionsRouter from './routes/predictions.js';
import statsRouter from './routes/stats.js';
import bettingInsightsRouter from './routes/bettingInsights.js';
import betBuilderRouter from './routes/betBuilder.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API Routes
app.use('/api/golden-bets', goldenBetsRouter);
app.use('/api/value-bets', valueBetsRouter);
app.use('/api/fixtures', fixturesRouter);
app.use('/api/predictions', predictionsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/betting-insights', bettingInsightsRouter);
app.use('/api/bet-builders', betBuilderRouter);

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

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    console.log('✅ Database connected');

    // Start cron jobs for daily predictions
    startCronJobs();
    console.log('✅ Cron jobs started');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Footy Oracle API running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`⭐ Golden Bets: http://localhost:${PORT}/api/golden-bets/today`);
      console.log(`💎 Value Bets: http://localhost:${PORT}/api/value-bets/today`);
      console.log(`🧠 Bet Builder Brain: http://localhost:${PORT}/api/bet-builders/today`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
