import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Fixture } from '../models/Fixture.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI!;
const API_KEY = process.env.API_FOOTBALL_KEY!;
const API_BASE_URL = process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io';

// Major leagues to fetch
const MAJOR_LEAGUES = [
  { id: 39, name: 'Premier League', country: 'England' },
  { id: 140, name: 'La Liga', country: 'Spain' },
  { id: 135, name: 'Serie A', country: 'Italy' },
  { id: 78, name: 'Bundesliga', country: 'Germany' },
  { id: 61, name: 'Ligue 1', country: 'France' },
  { id: 2, name: 'UEFA Champions League', country: 'World' },
  { id: 3, name: 'UEFA Europa League', country: 'World' }
];

interface ApiFixture {
  fixture: {
    id: number;
    timestamp: number;
    status: {
      short: string;
      long: string;
      elapsed: number | null;
    };
  };
  teams: {
    home: { id: number; name: string };
    away: { id: number; name: string };
  };
  league: {
    id: number;
    name: string;
    country: string;
    season: number;
  };
  score: {
    fulltime: { home: number | null; away: number | null };
  };
}

async function fetchFixturesForDate(date: string): Promise<ApiFixture[]> {
  const url = `${API_BASE_URL}/fixtures?date=${date}`;
  const headers = { 'x-apisports-key': API_KEY };

  try {
    const res = await axios.get(url, { headers });
    return res.data.response || [];
  } catch (error: any) {
    console.error(`❌ Error fetching fixtures for ${date}:`, error.message);
    return [];
  }
}

async function fetchOddsForFixture(fixtureId: number): Promise<any> {
  const url = `${API_BASE_URL}/odds?fixture=${fixtureId}`;
  const headers = { 'x-apisports-key': API_KEY };

  try {
    const res = await axios.get(url, { headers });
    const oddsData = res.data.response?.[0];
    
    if (!oddsData || !oddsData.bookmakers?.[0]?.bets) {
      return {};
    }

    const bets = oddsData.bookmakers[0].bets;
    const odds: any = {};

    // Match Winner odds
    const matchWinner = bets.find((b: any) => b.name === 'Match Winner');
    if (matchWinner?.values) {
      odds.homeWin = parseFloat(matchWinner.values.find((v: any) => v.value === 'Home')?.odd || '0');
      odds.draw = parseFloat(matchWinner.values.find((v: any) => v.value === 'Draw')?.odd || '0');
      odds.awayWin = parseFloat(matchWinner.values.find((v: any) => v.value === 'Away')?.odd || '0');
    }

    // Both Teams to Score
    const btts = bets.find((b: any) => b.name === 'Both Teams Score');
    if (btts?.values) {
      odds.btts = parseFloat(btts.values.find((v: any) => v.value === 'Yes')?.odd || '0');
    }

    // Over/Under 2.5 Goals
    const over25 = bets.find((b: any) => b.name === 'Goals Over/Under' && b.values.some((v: any) => v.value === 'Over 2.5'));
    if (over25?.values) {
      odds.over25 = parseFloat(over25.values.find((v: any) => v.value === 'Over 2.5')?.odd || '0');
      odds.under25 = parseFloat(over25.values.find((v: any) => v.value === 'Under 2.5')?.odd || '0');
    }

    return odds;
  } catch (error: any) {
    console.error(`⚠️  Could not fetch odds for fixture ${fixtureId}:`, error.message);
    return {};
  }
}

function mapStatus(statusShort: string): 'scheduled' | 'live' | 'finished' | 'postponed' {
  if (statusShort === 'FT' || statusShort === 'AET' || statusShort === 'PEN') return 'finished';
  if (statusShort === 'NS' || statusShort === 'TBD') return 'scheduled';
  if (statusShort === 'PST' || statusShort === 'CANC' || statusShort === 'ABD') return 'postponed';
  return 'live'; // 1H, HT, 2H, ET, BT, P, SUSP, INT, LIVE
}

async function seedFixtures() {
  console.log('🚀 Starting fixtures seeding...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Generate dates for next 7 days
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    console.log(`📅 Fetching fixtures for dates: ${dates.join(', ')}\n`);

    let totalProcessed = 0;
    let totalSaved = 0;

    for (const date of dates) {
      console.log(`\n📆 Processing ${date}...`);
      
      const fixtures = await fetchFixturesForDate(date);
      console.log(`   Found ${fixtures.length} fixtures`);

      for (const f of fixtures) {
        totalProcessed++;

        // Filter for major leagues only (optional - remove this to get all fixtures)
        const isMajorLeague = MAJOR_LEAGUES.some(l => l.id === f.league.id);
        
        // Fetch odds (with rate limiting - wait 1 second between requests)
        let odds = {};
        if (isMajorLeague) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          odds = await fetchOddsForFixture(f.fixture.id);
        }

        const fixtureData = {
          fixtureId: f.fixture.id,
          date: new Date(f.fixture.timestamp * 1000),
          homeTeam: f.teams.home.name,
          awayTeam: f.teams.away.name,
          homeTeamId: f.teams.home.id,
          awayTeamId: f.teams.away.id,
          league: f.league.name,
          leagueId: f.league.id,
          country: f.league.country,
          season: f.league.season,
          status: mapStatus(f.fixture.status.short),
          statusShort: f.fixture.status.short,
          elapsed: f.fixture.status.elapsed || undefined,
          score: f.score.fulltime.home !== null ? {
            home: f.score.fulltime.home,
            away: f.score.fulltime.away
          } : undefined,
          odds: odds
        };

        await Fixture.findOneAndUpdate(
          { fixtureId: f.fixture.id },
          fixtureData,
          { upsert: true, new: true }
        );

        totalSaved++;

        if (totalSaved % 10 === 0) {
          console.log(`   ✓ Saved ${totalSaved} fixtures...`);
        }
      }
    }

    console.log('\n✅ Seeding complete!');
    console.log(`📊 Total fixtures processed: ${totalProcessed}`);
    console.log(`💾 Total fixtures saved: ${totalSaved}`);

    // Show breakdown by league
    const leagueCounts = await Fixture.aggregate([
      {
        $match: {
          date: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: '$league',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    console.log('\n📈 Top leagues:');
    leagueCounts.forEach(l => {
      console.log(`   ${l._id}: ${l.count} fixtures`);
    });

  } catch (error: any) {
    console.error('\n❌ Seeding failed:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the seeding
seedFixtures()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n💥 Fatal error:', err);
    process.exit(1);
  });
