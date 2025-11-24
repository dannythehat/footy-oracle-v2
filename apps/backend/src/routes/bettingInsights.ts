import express from 'express';
import { Fixture } from '../models/Fixture.js';
import { bettingInsightsService } from '../services/bettingInsightsService.js';

const router = express.Router();

/**
 * GET /api/betting-insights/fixtures/upcoming
 * Get all fixtures with AI betting insights available
 * NOTE: This must be defined BEFORE /:fixtureId to avoid route conflicts
 */
router.get('/fixtures/upcoming', async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const fixtures = await Fixture.find({
      date: {
        $gte: now,
        $lte: sevenDaysFromNow
      },
      status: 'scheduled',
      'aiBets.generatedAt': { $exists: true }
    }).sort({ date: 1 });

    res.json({
      count: fixtures.length,
      fixtures: fixtures.map(f => ({
        fixtureId: f.fixtureId,
        homeTeam: f.homeTeam,
        awayTeam: f.awayTeam,
        league: f.league,
        date: f.date,
        aiBets: f.aiBets
      }))
    });
  } catch (error) {
    console.error('Error fetching upcoming fixtures with insights:', error);
    res.status(500).json({ error: 'Failed to fetch fixtures' });
  }
});

/**
 * GET /api/betting-insights/:fixtureId
 * Get AI betting insights for a specific fixture
 */
router.get('/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    
    const fixture = await Fixture.findOne({ fixtureId: parseInt(fixtureId) });
    
    if (!fixture) {
      return res.status(404).json({ error: 'Fixture not found' });
    }

    if (!fixture.aiBets) {
      return res.status(404).json({ 
        error: 'AI betting insights not yet generated for this fixture',
        message: 'Insights are generated 48 hours before kickoff'
      });
    }

    res.json({
      fixtureId: fixture.fixtureId,
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      league: fixture.league,
      date: fixture.date,
      aiBets: fixture.aiBets
    });
  } catch (error) {
    console.error('Error fetching betting insights:', error);
    res.status(500).json({ error: 'Failed to fetch betting insights' });
  }
});

/**
 * POST /api/betting-insights/:fixtureId/reveal/:betType
 * Reveal a specific bet type for a fixture
 */
router.post('/:fixtureId/reveal/:betType', async (req, res) => {
  try {
    const { fixtureId, betType } = req.params;
    
    const validBetTypes = ['bts', 'over25', 'over35cards', 'over95corners'];
    if (!validBetTypes.includes(betType)) {
      return res.status(400).json({ error: 'Invalid bet type' });
    }

    await bettingInsightsService.revealBetType(
      parseInt(fixtureId), 
      betType as 'bts' | 'over25' | 'over35cards' | 'over95corners'
    );

    const fixture = await Fixture.findOne({ fixtureId: parseInt(fixtureId) });
    
    res.json({
      success: true,
      betType,
      revealed: fixture?.aiBets?.[betType as keyof typeof fixture.aiBets]
    });
  } catch (error) {
    console.error('Error revealing bet type:', error);
    res.status(500).json({ error: 'Failed to reveal bet type' });
  }
});

/**
 * POST /api/betting-insights/:fixtureId/reveal-golden
 * Reveal the golden bet for a fixture
 */
router.post('/:fixtureId/reveal-golden', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    
    await bettingInsightsService.revealGoldenBet(parseInt(fixtureId));

    const fixture = await Fixture.findOne({ fixtureId: parseInt(fixtureId) });
    
    res.json({
      success: true,
      goldenBet: fixture?.aiBets?.goldenBet
    });
  } catch (error) {
    console.error('Error revealing golden bet:', error);
    res.status(500).json({ error: 'Failed to reveal golden bet' });
  }
});

export default router;
