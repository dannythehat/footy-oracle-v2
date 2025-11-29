import { Fixture } from '../models/Fixture.js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

/**
 * Export fixtures in ML-compatible format
 * ML scripts read this to generate predictions for the 4 markets
 */
export async function exportFixturesForML(date: Date = new Date()): Promise<void> {
  try {
    // Get fixtures for the specified date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const fixtures = await Fixture.find({
      kickoff: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).lean();
    
    console.log(`📤 Exporting ${fixtures.length} fixtures for ML processing...`);
    
    // Transform to ML format
    const mlFormat = fixtures.map(fixture => ({
      fixture_id: fixture.fixtureId,
      home_team: fixture.homeTeam,
      away_team: fixture.awayTeam,
      league: fixture.league,
      kickoff: fixture.kickoff,
      venue: fixture.venue || '',
      
      // Team form (last 5 matches)
      home_form: fixture.homeForm || [],
      away_form: fixture.awayForm || [],
      
      // Head to head
      h2h: fixture.headToHead || [],
      
      // Team statistics (if available)
      home_stats: {
        goals_scored_avg: fixture.homeStats?.goalsScored || 0,
        goals_conceded_avg: fixture.homeStats?.goalsConceded || 0,
        corners_avg: fixture.homeStats?.corners || 0,
        cards_avg: fixture.homeStats?.cards || 0,
      },
      away_stats: {
        goals_scored_avg: fixture.awayStats?.goalsScored || 0,
        goals_conceded_avg: fixture.awayStats?.goalsConceded || 0,
        corners_avg: fixture.awayStats?.corners || 0,
        cards_avg: fixture.awayStats?.cards || 0,
      },
    }));
    
    // Ensure output directory exists
    const outputDir = join(process.cwd(), '../../shared/ml_inputs');
    await mkdir(outputDir, { recursive: true });
    
    // Write to shared location
    const outputPath = join(outputDir, 'fixtures_today.json');
    await writeFile(outputPath, JSON.stringify(mlFormat, null, 2));
    
    console.log(`✅ Exported ${fixtures.length} fixtures to ${outputPath}`);
    console.log(`📊 ML can now generate predictions for 4 markets: BTTS, Over 2.5 Goals, Over 9.5 Corners, Over 3.5 Cards`);
    
  } catch (error) {
    console.error('❌ Error exporting fixtures for ML:', error);
    throw error;
  }
}

/**
 * Export fixtures for a specific date range
 */
export async function exportFixturesForDateRange(startDate: Date, endDate: Date): Promise<void> {
  try {
    const fixtures = await Fixture.find({
      kickoff: {
        $gte: startDate,
        $lte: endDate,
      },
    }).lean();
    
    console.log(`📤 Exporting ${fixtures.length} fixtures for date range...`);
    
    const mlFormat = fixtures.map(fixture => ({
      fixture_id: fixture.fixtureId,
      home_team: fixture.homeTeam,
      away_team: fixture.awayTeam,
      league: fixture.league,
      kickoff: fixture.kickoff,
      venue: fixture.venue || '',
      home_form: fixture.homeForm || [],
      away_form: fixture.awayForm || [],
      h2h: fixture.headToHead || [],
    }));
    
    const outputDir = join(process.cwd(), '../../shared/ml_inputs');
    await mkdir(outputDir, { recursive: true });
    
    const outputPath = join(outputDir, 'fixtures_range.json');
    await writeFile(outputPath, JSON.stringify(mlFormat, null, 2));
    
    console.log(`✅ Exported ${fixtures.length} fixtures to ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error exporting fixtures for date range:', error);
    throw error;
  }
}

/**
 * Get export status and statistics
 */
export async function getExportStatus(): Promise<{
  lastExport: Date | null;
  fixtureCount: number;
  status: 'ready' | 'pending' | 'error';
}> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const fixtureCount = await Fixture.countDocuments({
      kickoff: {
        $gte: today,
        $lt: tomorrow,
      },
    });
    
    return {
      lastExport: new Date(), // TODO: Track actual last export time
      fixtureCount,
      status: fixtureCount > 0 ? 'ready' : 'pending',
    };
  } catch (error) {
    console.error('❌ Error getting export status:', error);
    return {
      lastExport: null,
      fixtureCount: 0,
      status: 'error',
    };
  }
}
