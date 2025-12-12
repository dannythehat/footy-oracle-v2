import { weatherService, WeatherData } from './weatherService';
import { injuryService, TeamAbsences } from './injuryService';
import { tacticalService, TacticalProfile, MatchupAnalysis } from './tacticalService';

interface FixtureContext {
  fixtureId: number;
  homeTeam: {
    id: number;
    name: string;
    city?: string;
  };
  awayTeam: {
    id: number;
    name: string;
  };
  league: string;
  matchDate: Date;
  venue?: string;
}

interface EnhancedMatchContext {
  // Basic info
  fixture: FixtureContext;
  
  // Weather
  weather?: WeatherData;
  weatherImpact?: string;
  
  // Injuries & Suspensions
  homeAbsences: TeamAbsences;
  awayAbsences: TeamAbsences;
  absencesComparison: string;
  
  // Tactical
  homeTactical: TacticalProfile;
  awayTactical: TacticalProfile;
  tacticalMatchup: MatchupAnalysis;
  
  // Statistical context (from existing services)
  homeForm?: string;
  awayForm?: string;
  homeGoalsAvg?: { scored: number; conceded: number };
  awayGoalsAvg?: { scored: number; conceded: number };
  h2hStats?: any;
  
  // Summary for AI
  contextSummary: string;
}

class ContextAggregationService {
  /**
   * Gather all available context for a fixture
   */
  async gatherFullContext(fixture: FixtureContext, season?: number): Promise<EnhancedMatchContext> {
    const currentSeason = season || new Date().getFullYear();

    // Fetch all data in parallel for speed
    const [weather, homeAbsences, awayAbsences, homeTactical, awayTactical] = await Promise.all([
      this.getWeatherData(fixture),
      injuryService.getTeamAbsences(fixture.homeTeam.id, currentSeason),
      injuryService.getTeamAbsences(fixture.awayTeam.id, currentSeason),
      tacticalService.getTeamTacticalProfile(fixture.homeTeam.id, currentSeason),
      tacticalService.getTeamTacticalProfile(fixture.awayTeam.id, currentSeason)
    ]);

    // Analyze tactical matchup
    const tacticalMatchup = await tacticalService.analyzeMatchup(
      fixture.homeTeam.id,
      fixture.awayTeam.id,
      currentSeason
    );

    // Generate comparisons
    const absencesComparison = injuryService.compareTeamAbsences(homeAbsences, awayAbsences);
    const weatherImpact = weather ? weatherService.getWeatherImpact(weather) : undefined;

    // Build context summary
    const contextSummary = this.buildContextSummary({
      weather,
      weatherImpact,
      homeAbsences,
      awayAbsences,
      absencesComparison,
      tacticalMatchup
    });

    return {
      fixture,
      weather,
      weatherImpact,
      homeAbsences,
      awayAbsences,
      absencesComparison,
      homeTactical,
      awayTactical,
      tacticalMatchup,
      contextSummary
    };
  }

  /**
   * Get weather data for fixture
   */
  private async getWeatherData(fixture: FixtureContext): Promise<WeatherData | undefined> {
    // Try to get city from venue or team name
    const city = fixture.homeTeam.city || this.extractCityFromTeamName(fixture.homeTeam.name);
    
    if (!city) return undefined;

    try {
      return await weatherService.getMatchWeather(city, fixture.matchDate) || undefined;
    } catch (error) {
      console.error('Error fetching weather:', error);
      return undefined;
    }
  }

  /**
   * Extract city from team name
   */
  private extractCityFromTeamName(teamName: string): string | null {
    // Common patterns
    const cityPatterns = [
      'Manchester', 'Liverpool', 'Arsenal', 'Chelsea', 'Tottenham',
      'Newcastle', 'Brighton', 'Southampton', 'Leicester', 'Leeds',
      'Barcelona', 'Madrid', 'Seville', 'Valencia', 'Bilbao',
      'Milan', 'Rome', 'Turin', 'Naples', 'Florence',
      'Munich', 'Dortmund', 'Berlin', 'Hamburg', 'Frankfurt',
      'Paris', 'Marseille', 'Lyon', 'Lille', 'Nice'
    ];

    for (const city of cityPatterns) {
      if (teamName.includes(city)) {
        return city;
      }
    }

    // Special cases
    if (teamName.includes('Inter') || teamName.includes('AC Milan')) return 'Milan';
    if (teamName.includes('Atletico') || teamName.includes('Real Madrid')) return 'Madrid';
    if (teamName.includes('PSG')) return 'Paris';
    if (teamName.includes('Bayern')) return 'Munich';
    if (teamName.includes('Juventus')) return 'Turin';
    if (teamName.includes('Roma') || teamName.includes('Lazio')) return 'Rome';

    return null;
  }

  /**
   * Build comprehensive context summary for AI
   */
  private buildContextSummary(data: {
    weather?: WeatherData;
    weatherImpact?: string;
    homeAbsences: TeamAbsences;
    awayAbsences: TeamAbsences;
    absencesComparison: string;
    tacticalMatchup: MatchupAnalysis;
  }): string {
    const parts: string[] = [];

    // Weather
    if (data.weather && weatherService.isSignificantWeather(data.weather)) {
      parts.push(`⛅ Weather: ${data.weatherImpact} (${data.weather.temp}°C, ${data.weather.windSpeed}km/h wind)`);
    }

    // Injuries
    if (data.homeAbsences.impactLevel !== 'low' || data.awayAbsences.impactLevel !== 'low') {
      parts.push(`🏥 Absences: ${data.absencesComparison}`);
      
      if (data.homeAbsences.keyPlayersOut.length > 0) {
        parts.push(`   Home missing: ${data.homeAbsences.keyPlayersOut.slice(0, 3).join(', ')}`);
      }
      
      if (data.awayAbsences.keyPlayersOut.length > 0) {
        parts.push(`   Away missing: ${data.awayAbsences.keyPlayersOut.slice(0, 3).join(', ')}`);
      }
    }

    // Tactical
    if (data.tacticalMatchup.tacticalAdvantage !== 'neutral') {
      parts.push(`⚔️ Tactical: ${data.tacticalMatchup.tacticalAdvantage} team has advantage`);
      if (data.tacticalMatchup.keyBattles.length > 0) {
        parts.push(`   ${data.tacticalMatchup.keyBattles[0]}`);
      }
    }

    return parts.length > 0 ? parts.join('\n') : 'Standard match conditions';
  }

  /**
   * Format context for AI prompt
   */
  formatForAIPrompt(context: EnhancedMatchContext): string {
    const sections: string[] = [];

    // Weather section
    if (context.weather && weatherService.isSignificantWeather(context.weather)) {
      sections.push(`WEATHER CONDITIONS:
- ${context.weather.description} (${context.weather.temp}°C, feels like ${context.weather.feelsLike}°C)
- Wind: ${context.weather.windSpeed}km/h ${context.weather.windDirection}
- ${context.weather.rain ? `Rain expected (${context.weather.precipitation}mm)` : 'Dry conditions'}
- Impact: ${context.weatherImpact}`);
    }

    // Injuries & Suspensions
    if (context.homeAbsences.totalOut > 0 || context.awayAbsences.totalOut > 0) {
      sections.push(`TEAM NEWS:
HOME (${context.fixture.homeTeam.name}):
- ${injuryService.getAbsencesSummary(context.homeAbsences)}
${context.homeAbsences.totalOut > 0 ? `- Details: ${injuryService.getDetailedInjuryList(context.homeAbsences, 3)}` : ''}

AWAY (${context.fixture.awayTeam.name}):
- ${injuryService.getAbsencesSummary(context.awayAbsences)}
${context.awayAbsences.totalOut > 0 ? `- Details: ${injuryService.getDetailedInjuryList(context.awayAbsences, 3)}` : ''}`);
    }

    // Tactical Analysis
    sections.push(`TACTICAL SETUP:
HOME: ${tacticalService.getTacticalSummary(context.homeTactical)}
- Strengths: ${context.homeTactical.strengths.join(', ')}
- Weaknesses: ${context.homeTactical.weaknesses.join(', ')}

AWAY: ${tacticalService.getTacticalSummary(context.awayTactical)}
- Strengths: ${context.awayTactical.strengths.join(', ')}
- Weaknesses: ${context.awayTactical.weaknesses.join(', ')}

MATCHUP: ${context.tacticalMatchup.prediction}
${context.tacticalMatchup.keyBattles.length > 0 ? `Key Battles: ${context.tacticalMatchup.keyBattles.join('; ')}` : ''}`);

    return sections.join('\n\n');
  }

  /**
   * Get quick context highlights for display
   */
  getContextHighlights(context: EnhancedMatchContext): string[] {
    const highlights: string[] = [];

    // Weather
    if (context.weather && weatherService.isSignificantWeather(context.weather)) {
      highlights.push(`${context.weatherImpact}`);
    }

    // Key injuries
    if (context.homeAbsences.keyPlayersOut.length > 0) {
      highlights.push(`${context.fixture.homeTeam.name} missing ${context.homeAbsences.keyPlayersOut[0]}`);
    }
    if (context.awayAbsences.keyPlayersOut.length > 0) {
      highlights.push(`${context.fixture.awayTeam.name} missing ${context.awayAbsences.keyPlayersOut[0]}`);
    }

    // Tactical advantage
    if (context.tacticalMatchup.tacticalAdvantage !== 'neutral') {
      highlights.push(`Tactical edge: ${context.tacticalMatchup.tacticalAdvantage}`);
    }

    return highlights;
  }

  /**
   * Check if context is significantly different from normal
   */
  hasSignificantContext(context: EnhancedMatchContext): boolean {
    return (
      (context.weather && weatherService.isSignificantWeather(context.weather)) ||
      context.homeAbsences.impactLevel !== 'low' ||
      context.awayAbsences.impactLevel !== 'low' ||
      context.tacticalMatchup.tacticalAdvantage !== 'neutral'
    );
  }
}

export const contextAggregationService = new ContextAggregationService();
export type { FixtureContext, EnhancedMatchContext };
