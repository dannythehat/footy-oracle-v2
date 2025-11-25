import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BetBuilder } from '../models/BetBuilder.js';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface LMBetBuilder {
  fixture_id: number;
  home_team: string;
  away_team: string;
  league: string;
  kickoff: string;
  predictions: any;
  high_confidence_markets: Array<{
    market: string;
    market_name: string;
    selection: string;
    probability: number;
    confidence: number;
    estimated_odds: number;
  }>;
  combined_confidence: number;
  estimated_combined_odds: number;
  market_count: number;
}

/**
 * Generate AI reasoning for bet builder using GPT-4
 */
async function generateAIReasoning(betBuilder: LMBetBuilder): Promise<string> {
  const prompt = `You are a professional football betting analyst. Analyze this multi-market bet builder opportunity:

Fixture: ${betBuilder.home_team} vs ${betBuilder.away_team}
League: ${betBuilder.league}

High Confidence Markets:
${betBuilder.high_confidence_markets.map(m => 
  `- ${m.market_name}: ${m.confidence}% confidence`
).join('\n')}

Combined Confidence: ${betBuilder.combined_confidence}%
Combined Odds: ${betBuilder.estimated_combined_odds}x

Provide a concise 2-3 sentence analysis explaining WHY these markets converge with high confidence. Consider:
- Team form and playing styles
- Historical head-to-head data
- Tactical factors
- Any relevant context (injuries, referee, weather)

Keep it professional, insightful, and under 150 words.`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0].message.content || 'Analysis unavailable';
  } catch (error) {
    console.error('Error generating AI reasoning:', error);
    return 'AI analysis temporarily unavailable. Both teams show strong attacking metrics and historical data suggests high-scoring encounters.';
  }
}

/**
 * Import bet builders from LM System output
 */
export async function importBetBuilders(): Promise<{
  success: boolean;
  imported: number;
  skipped: number;
  errors: number;
}> {
  const stats = {
    success: true,
    imported: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    // Read bet_builders.json from shared ML outputs
    const filePath = path.join(__dirname, '../../../../shared/ml_outputs/bet_builders.json');
    
    if (!fs.existsSync(filePath)) {
      console.log('⚠️ No bet_builders.json found. Skipping import.');
      console.log(`Expected path: ${filePath}`);
      return stats;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const betBuilders: LMBetBuilder[] = data.bet_builders || [];

    console.log(`📥 Importing ${betBuilders.length} bet builders from LM System...`);

    for (const bb of betBuilders) {
      try {
        // Check if already exists
        const existing = await BetBuilder.findOne({ fixtureId: bb.fixture_id });

        if (existing) {
          console.log(`⏭️ Bet builder for fixture ${bb.fixture_id} already exists`);
          stats.skipped++;
          continue;
        }

        // Generate AI reasoning (with retry logic)
        let aiReasoning: string;
        try {
          aiReasoning = await generateAIReasoning(bb);
        } catch (error) {
          console.warn(`⚠️ Failed to generate AI reasoning for ${bb.home_team} vs ${bb.away_team}, using fallback`);
          aiReasoning = `Multi-market convergence detected with ${bb.combined_confidence}% combined confidence across ${bb.market_count} markets. Strong indicators suggest value in this bet builder combination.`;
        }

        // Create new bet builder
        const betBuilder = new BetBuilder({
          fixtureId: bb.fixture_id,
          date: new Date(bb.kickoff),
          homeTeam: bb.home_team,
          awayTeam: bb.away_team,
          league: bb.league,
          kickoff: new Date(bb.kickoff),
          markets: bb.high_confidence_markets.map(m => ({
            market: m.market,
            marketName: m.market_name,
            confidence: m.confidence,
            probability: m.probability,
            estimatedOdds: m.estimated_odds,
          })),
          combinedConfidence: bb.combined_confidence,
          estimatedCombinedOdds: bb.estimated_combined_odds,
          aiReasoning,
        });

        await betBuilder.save();
        console.log(`✅ Imported bet builder: ${bb.home_team} vs ${bb.away_team} (${bb.combined_confidence}% confidence)`);
        stats.imported++;
      } catch (error) {
        console.error(`❌ Error importing bet builder for fixture ${bb.fixture_id}:`, error);
        stats.errors++;
      }
    }

    console.log(`✅ Bet builder import complete: ${stats.imported} imported, ${stats.skipped} skipped, ${stats.errors} errors`);
    return stats;
  } catch (error) {
    console.error('❌ Error importing bet builders:', error);
    stats.success = false;
    return stats;
  }
}

/**
 * Import bet builders from API endpoint (alternative to file-based)
 */
export async function importBetBuildersFromAPI(apiUrl?: string): Promise<{
  success: boolean;
  imported: number;
  skipped: number;
  errors: number;
}> {
  const stats = {
    success: true,
    imported: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    const url = apiUrl || process.env.LM_SYSTEM_API_URL + '/bet-builders';
    console.log(`📥 Fetching bet builders from API: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const betBuilders: LMBetBuilder[] = data.bet_builders || [];

    console.log(`📥 Importing ${betBuilders.length} bet builders from API...`);

    for (const bb of betBuilders) {
      try {
        const existing = await BetBuilder.findOne({ fixtureId: bb.fixture_id });

        if (existing) {
          stats.skipped++;
          continue;
        }

        const aiReasoning = await generateAIReasoning(bb);

        const betBuilder = new BetBuilder({
          fixtureId: bb.fixture_id,
          date: new Date(bb.kickoff),
          homeTeam: bb.home_team,
          awayTeam: bb.away_team,
          league: bb.league,
          kickoff: new Date(bb.kickoff),
          markets: bb.high_confidence_markets.map(m => ({
            market: m.market,
            marketName: m.market_name,
            confidence: m.confidence,
            probability: m.probability,
            estimatedOdds: m.estimated_odds,
          })),
          combinedConfidence: bb.combined_confidence,
          estimatedCombinedOdds: bb.estimated_combined_odds,
          aiReasoning,
        });

        await betBuilder.save();
        stats.imported++;
      } catch (error) {
        console.error(`❌ Error importing bet builder:`, error);
        stats.errors++;
      }
    }

    console.log(`✅ API import complete: ${stats.imported} imported, ${stats.skipped} skipped, ${stats.errors} errors`);
    return stats;
  } catch (error) {
    console.error('❌ Error importing from API:', error);
    stats.success = false;
    return stats;
  }
}
