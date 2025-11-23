import { Router } from 'express';
import { Fixture } from '../models/Fixture.js';

const router = Router();

// Get fixtures by date
router.get('/', async (req, res) => {
  try {
    const { date, league, status } = req.query;
    
    const query: any = {};
    
    if (date) {
      const targetDate = new Date(date as string);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      query.date = { $gte: targetDate, $lt: nextDate };
    }
    
    if (league) {
      query.league = league;
    }
    
    if (status) {
      query.status = status;
    }
    
    const fixtures = await Fixture.find(query).sort({ date: 1 });
    
    res.json({
      success: true,
      data: fixtures,
      count: fixtures.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get fixture by ID
router.get('/:id', async (req, res) => {
  try {
    const fixture = await Fixture.findOne({ fixtureId: Number(req.params.id) });
    
    if (!fixture) {
      return res.status(404).json({
        success: false,
        error: 'Fixture not found',
      });
    }
    
    res.json({
      success: true,
      data: fixture,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get available leagues
router.get('/meta/leagues', async (req, res) => {
  try {
    const leagues = await Fixture.distinct('league');
    
    res.json({
      success: true,
      data: leagues,
      count: leagues.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
