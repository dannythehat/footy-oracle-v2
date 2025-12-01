import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

const API_BASE_URL =
  process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io';

const API_KEY = process.env.API_FOOTBALL_KEY || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-apisports-key': API_KEY,
  },
});

async function getFixtureById(fixtureId: number) {
  const res = await api.get('/fixtures', { params: { id: fixtureId } });
  if (!res.data || !Array.isArray(res.data.response) || res.data.response.length === 0) {
    return null;
  }
  return res.data.response[0];
}

router.get('/fixtures/:fixtureId/h2h', async (req: Request, res: Response): Promise<void> => {
  try {
    const fixtureId = Number(req.params.fixtureId);
    if (!fixtureId) { res.status(400).json({ error: 'Invalid fixtureId' }); return; }

    const fixture = await getFixtureById(fixtureId);
    if (!fixture) { res.status(404).json({ error: 'Fixture not found' }); return; }

    const homeId = fixture.teams?.home?.id;
    const awayId = fixture.teams?.away?.id;

    if (!homeId || !awayId) {
      res.status(400).json({ error: 'Cannot determine teams for H2H' });
      return;
    }

    const h2hRes = await api.get('/fixtures/headtohead', {
      params: { h2h: `${homeId}-${awayId}`, last: 10 },
    });

    res.json(h2hRes.data);
  } catch (err: any) {
    console.error('[fixtureDetails] H2H error:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch H2H data' });
  }
});

router.get('/fixtures/:fixtureId/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const fixtureId = Number(req.params.fixtureId);
    if (!fixtureId) { res.status(400).json({ error: 'Invalid fixtureId' }); return; }

    const statsRes = await api.get('/fixtures/statistics', { params: { fixture: fixtureId } });

    res.json(statsRes.data);
  } catch (err: any) {
    console.error('[fixtureDetails] Stats error:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch fixture statistics' });
  }
});

router.get('/fixtures/:fixtureId/odds', async (req: Request, res: Response): Promise<void> => {
  try {
    const fixtureId = Number(req.params.fixtureId);
    if (!fixtureId) { res.status(400).json({ error: 'Invalid fixtureId' }); return; }

    const oddsRes = await api.get('/odds', { params: { fixture: fixtureId } });

    res.json(oddsRes.data);
  } catch (err: any) {
    console.error('[fixtureDetails] Odds error:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch odds' });
  }
});

router.get('/fixtures/:fixtureId/live', async (req: Request, res: Response): Promise<void> => {
  try {
    const fixtureId = Number(req.params.fixtureId);
    if (!fixtureId) { res.status(400).json({ error: 'Invalid fixtureId' }); return; }

    const [fixtureRes, eventsRes] = await Promise.all([
      api.get('/fixtures', { params: { id: fixtureId } }),
      api.get('/fixtures/events', { params: { fixture: fixtureId } }),
    ]);

    res.json({ fixture: fixtureRes.data, events: eventsRes.data });
  } catch (err: any) {
    console.error('[fixtureDetails] Live error:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch live data' });
  }
});

router.get('/leagues/:leagueId/standings', async (req: Request, res: Response): Promise<void> => {
  try {
    const leagueId = Number(req.params.leagueId);
    const season = Number(req.query.season);

    if (!leagueId) { res.status(400).json({ error: 'Invalid leagueId' }); return; }
    if (!season) { res.status(400).json({ error: 'season query parameter is required' }); return; }

    const standingsRes = await api.get('/standings', { params: { league: leagueId, season } });

    res.json(standingsRes.data);
  } catch (err: any) {
    console.error('[fixtureDetails] Standings error:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch league standings' });
  }
});

export default router;
