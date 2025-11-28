import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import fixturesRouter from './routes/fixtures.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const MONGODB_URI = process.env.MONGODB_URI;

// MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB error:', err));

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Fixtures routes
app.use('/api/fixtures', fixturesRouter);

// Golden Bets
app.get('/api/golden-bets/today', (req, res) => {
  const filePath = path.join(__dirname, '../../shared/ml_outputs/golden_bets.json');
  res.sendFile(filePath);
});

// Value Bets
app.get('/api/value-bets/today', (req, res) => {
  const filePath = path.join(__dirname, '../../shared/ml_outputs/value_bets.json');
  res.sendFile(filePath);
});

// Bet Builders
app.get('/api/bet-builders/today', (req, res) => {
  const filePath = path.join(__dirname, '../../shared/ml_outputs/bet_builder.json');
  res.sendFile(filePath);
});

// Start
app.listen(PORT, () => {
  console.log('Footy Oracle API running on port ' + PORT);
});
