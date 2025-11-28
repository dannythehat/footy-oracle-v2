import express from 'express';
import Fixture from '../models/Fixture.js';

const router = express.Router();

// GET /api/fixtures?date=YYYY-MM-DD
router.get('/', async (req, res) => {
  try {
    const date = req.query.date;

    if (!date) {
      return res.status(400).json({ error: 'Missing date' });
    }

    const fixtures = await Fixture.find({ date: date }).sort({ timestamp: 1 });

    res.json(fixtures);
  } catch (err) {
    res.status(500).json({ error: 'fixtures route error' });
  }
});

// GET /api/fixtures/:fixtureId
router.get('/:fixtureId', async (req, res) => {
  try {
    const fixtureId = Number(req.params.fixtureId);

    const fixture = await Fixture.findOne({ fixture_id: fixtureId });

    res.json(fixture);
  } catch (err) {
    res.status(500).json({ error: 'fixture not found' });
  }
});

export default router;
