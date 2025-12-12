import axios from 'axios';

interface FormationData {
  formation: string;
  frequency: number; // How often they use this formation
}

interface TacticalProfile {
  primaryFormation: string;
  alternativeFormations: FormationData[];
  playingStyle: {
    possession: 'high' | 'medium' | 'low';
    tempo: 'fast' | 'medium' | 'slow';
    pressing: 'high' | 'medium' | 'low';
    buildUp: 'short' | 'mixed' | 'long';
  };
  strengths: string[];
  weaknesses: string[];
  recentFormationChanges?: string;
}

interface MatchupAnalysis {
  tacticalAdvantage: 'home' | 'away' | 'neutral';
  keyBattles: string[];
  expectedApproach: string;
  prediction: string;
}

class TacticalService {
  private apiKey: string;
  private baseUrl = 'https://v3.football.api-sports.io';
  private cache: Map<string, { data: TacticalProfile; timestamp: number }> = new Map();
  private cacheDuration = 24 * 60 * 60 * 1000; // 24 hours

  // Formation characteristics
  private formationStyles: { [key: string]: { style: string; strengths: string[]; weaknesses: string[] } } = {
    '4-3-3': {
      style: 'Attacking, width-focused',
      strengths: ['Wide play', 'High press', 'Quick transitions'],
      weaknesses: ['Vulnerable to counter-attacks', 'Midfield can be overrun']
    },
    '4-2-3-1': {
      style: 'Balanced, creative',
      strengths: ['Defensive stability', 'Creative freedom', 'Flexible'],
      weaknesses: ['Isolated striker', 'Can lack width']
    },
    '4-4-2': {
      style: 'Traditional, solid',
      strengths: ['Compact shape', 'Strong in duels', 'Simple structure'],
      weaknesses: ['Outnumbered in midfield', 'Less creative']
    },
    '3-5-2': {
      style: 'Wing-back system',
      strengths: ['Numerical midfield advantage', 'Width from wing-backs'],
      weaknesses: ['Vulnerable to wide attacks', 'Requires fit wing-backs']
    },
    '3-4-3': {
      style: 'Aggressive, attacking',
      strengths: ['Overloads attack', 'High press', 'Width and depth'],
      weaknesses: ['Exposed defensively', 'Requires high fitness']
    },
    '5-3-2': {
      style: 'Defensive, counter-attacking',
      strengths: ['Solid defense', 'Good for counter-attacks'],
      weaknesses: ['Limited attacking threat', 'Passive approach']
    },
    '4-1-4-1': {
      style: 'Defensive midfielder anchor',
      strengths: ['Defensive cover', 'Midfield control'],
      weaknesses: ['Isolated striker', 'Can be predictable']
    },
    '4-3-1-2': {
      style: 'Diamond midfield',
      strengths: ['Central overload', 'Two strikers'],
      weaknesses: ['Lacks width', 'Vulnerable on flanks']
    }
  };

  constructor() {
    this.apiKey = process.env.API_FOOTBALL_KEY || '';
  }

  /**
   * Get tactical profile for a team based on recent matches
   */
  async getTeamTacticalProfile(teamId: number, season: number = new Date().getFullYear()): Promise<TacticalProfile> {
    const cacheKey = `${teamId}-${season}`;
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    if (!this.apiKey) {
      return this.getDefaultProfile();
    }

    try {
      // Get team's recent fixtures to analyze formations
      const response = await axios.get(`${this.baseUrl}/fixtures`, {
        params: {
          team: teamId,
          season: season,
          last: 10
        },
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      });

      const profile = this.analyzeFormations(response.data.response, teamId);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: profile,
        timestamp: Date.now()
      });

      return profile;
    } catch (error) {
      console.error(`Error fetching tactical data for team ${teamId}:`, error);
      return this.getDefaultProfile();
    }
  }

  /**
   * Analyze formations from recent matches
   */
  private analyzeFormations(fixtures: any[], teamId: number): TacticalProfile {
    const formationCounts: { [key: string]: number } = {};
    let totalMatches = 0;

    for (const fixture of fixtures) {
      const isHome = fixture.teams.home.id === teamId;
      const formation = isHome ? fixture.lineups?.[0]?.formation : fixture.lineups?.[1]?.formation;

      if (formation) {
        formationCounts[formation] = (formationCounts[formation] || 0) + 1;
        totalMatches++;
      }
    }

    // Sort formations by frequency
    const sortedFormations = Object.entries(formationCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([formation, count]) => ({
        formation,
        frequency: Math.round((count / totalMatches) * 100)
      }));

    const primaryFormation = sortedFormations[0]?.formation || '4-3-3';
    const formationInfo = this.formationStyles[primaryFormation] || this.formationStyles['4-3-3'];

    return {
      primaryFormation,
      alternativeFormations: sortedFormations.slice(1, 3),
      playingStyle: this.inferPlayingStyle(primaryFormation),
      strengths: formationInfo.strengths,
      weaknesses: formationInfo.weaknesses,
      recentFormationChanges: sortedFormations.length > 1 
        ? `Recently switched between ${sortedFormations[0].formation} and ${sortedFormations[1].formation}`
        : undefined
    };
  }

  /**
   * Infer playing style from formation
   */
  private inferPlayingStyle(formation: string): TacticalProfile['playingStyle'] {
    // Attacking formations
    if (['4-3-3', '3-4-3', '4-2-4'].includes(formation)) {
      return {
        possession: 'high',
        tempo: 'fast',
        pressing: 'high',
        buildUp: 'short'
      };
    }

    // Defensive formations
    if (['5-3-2', '5-4-1', '4-5-1'].includes(formation)) {
      return {
        possession: 'low',
        tempo: 'medium',
        pressing: 'low',
        buildUp: 'long'
      };
    }

    // Balanced formations
    return {
      possession: 'medium',
      tempo: 'medium',
      pressing: 'medium',
      buildUp: 'mixed'
    };
  }

  /**
   * Analyze tactical matchup between two teams
   */
  async analyzeMatchup(
    homeTeamId: number, 
    awayTeamId: number, 
    season: number = new Date().getFullYear()
  ): Promise<MatchupAnalysis> {
    const [homeProfile, awayProfile] = await Promise.all([
      this.getTeamTacticalProfile(homeTeamId, season),
      this.getTeamTacticalProfile(awayTeamId, season)
    ]);

    return this.compareProfiles(homeProfile, awayProfile);
  }

  /**
   * Compare two tactical profiles
   */
  private compareProfiles(home: TacticalProfile, away: TacticalProfile): MatchupAnalysis {
    const keyBattles: string[] = [];
    let tacticalAdvantage: 'home' | 'away' | 'neutral' = 'neutral';
    let advantageScore = 0;

    // Possession battle
    if (home.playingStyle.possession === 'high' && away.playingStyle.possession === 'low') {
      keyBattles.push('Home team will dominate possession');
      advantageScore += 1;
    } else if (away.playingStyle.possession === 'high' && home.playingStyle.possession === 'low') {
      keyBattles.push('Away team will control the ball');
      advantageScore -= 1;
    }

    // Pressing vs build-up
    if (home.playingStyle.pressing === 'high' && away.playingStyle.buildUp === 'short') {
      keyBattles.push('Home press vs away build-up play');
      advantageScore += 1;
    } else if (away.playingStyle.pressing === 'high' && home.playingStyle.buildUp === 'short') {
      keyBattles.push('Away press vs home build-up play');
      advantageScore -= 1;
    }

    // Formation matchup
    const formationMatchup = this.analyzeFormationMatchup(home.primaryFormation, away.primaryFormation);
    if (formationMatchup) {
      keyBattles.push(formationMatchup.battle);
      advantageScore += formationMatchup.advantage;
    }

    // Determine overall advantage
    if (advantageScore > 0) tacticalAdvantage = 'home';
    else if (advantageScore < 0) tacticalAdvantage = 'away';

    return {
      tacticalAdvantage,
      keyBattles,
      expectedApproach: this.predictApproach(home, away),
      prediction: this.generatePrediction(home, away, tacticalAdvantage)
    };
  }

  /**
   * Analyze specific formation matchup
   */
  private analyzeFormationMatchup(homeFormation: string, awayFormation: string): { battle: string; advantage: number } | null {
    // 3 at the back vs 2 strikers
    if (homeFormation.startsWith('3') && awayFormation.includes('-2')) {
      return {
        battle: 'Home 3-man defense vs away 2 strikers',
        advantage: 1
      };
    }

    // 4-3-3 vs 4-4-2 (width advantage)
    if (homeFormation === '4-3-3' && awayFormation === '4-4-2') {
      return {
        battle: 'Home wingers vs away fullbacks',
        advantage: 1
      };
    }

    // 3-5-2 vs 4-3-3 (midfield battle)
    if (homeFormation === '3-5-2' && awayFormation === '4-3-3') {
      return {
        battle: 'Midfield numbers advantage for home',
        advantage: 1
      };
    }

    return null;
  }

  /**
   * Predict match approach based on styles
   */
  private predictApproach(home: TacticalProfile, away: TacticalProfile): string {
    if (home.playingStyle.possession === 'high' && away.playingStyle.possession === 'high') {
      return 'Open, end-to-end game expected';
    }

    if (home.playingStyle.possession === 'low' && away.playingStyle.possession === 'low') {
      return 'Cagey affair, both teams sitting deep';
    }

    if (home.playingStyle.tempo === 'fast' || away.playingStyle.tempo === 'fast') {
      return 'High-tempo match with quick transitions';
    }

    return 'Tactical chess match, both teams organized';
  }

  /**
   * Generate tactical prediction
   */
  private generatePrediction(home: TacticalProfile, away: TacticalProfile, advantage: 'home' | 'away' | 'neutral'): string {
    const predictions: string[] = [];

    if (advantage === 'home') {
      predictions.push(`Home team's ${home.primaryFormation} should exploit away weaknesses`);
    } else if (advantage === 'away') {
      predictions.push(`Away team's ${away.primaryFormation} well-suited to counter home approach`);
    } else {
      predictions.push('Evenly matched tactically');
    }

    // Add style-based predictions
    if (home.playingStyle.pressing === 'high' && away.playingStyle.buildUp === 'short') {
      predictions.push('Expect turnovers in dangerous areas');
    }

    if (home.playingStyle.tempo === 'fast' && away.playingStyle.tempo === 'fast') {
      predictions.push('Goals likely from both ends');
    }

    return predictions.join('. ');
  }

  /**
   * Get tactical summary for AI context
   */
  getTacticalSummary(profile: TacticalProfile): string {
    const parts: string[] = [];

    parts.push(`${profile.primaryFormation} formation`);
    parts.push(`${profile.playingStyle.possession} possession`);
    parts.push(`${profile.playingStyle.pressing} press`);

    if (profile.recentFormationChanges) {
      parts.push(profile.recentFormationChanges);
    }

    return parts.join(' | ');
  }

  /**
   * Get default profile when data unavailable
   */
  private getDefaultProfile(): TacticalProfile {
    return {
      primaryFormation: '4-3-3',
      alternativeFormations: [],
      playingStyle: {
        possession: 'medium',
        tempo: 'medium',
        pressing: 'medium',
        buildUp: 'mixed'
      },
      strengths: ['Balanced approach'],
      weaknesses: ['Limited tactical data available']
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const tacticalService = new TacticalService();
export type { TacticalProfile, MatchupAnalysis, FormationData };
