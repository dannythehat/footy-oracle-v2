import axios from 'axios';

interface InjuryData {
  player: string;
  position: string;
  reason: string;
  type: 'injury' | 'suspension';
  expectedReturn?: string;
  severity?: 'minor' | 'moderate' | 'major';
}

interface TeamAbsences {
  injuries: InjuryData[];
  suspensions: InjuryData[];
  totalOut: number;
  keyPlayersOut: string[];
  impactLevel: 'low' | 'medium' | 'high';
}

class InjuryService {
  private apiKey: string;
  private baseUrl = 'https://v3.football.api-sports.io';
  private cache: Map<string, { data: TeamAbsences; timestamp: number }> = new Map();
  private cacheDuration = 6 * 60 * 60 * 1000; // 6 hours

  // Key positions that have high impact
  private keyPositions = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];

  constructor() {
    this.apiKey = process.env.API_FOOTBALL_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ API_FOOTBALL_KEY not set - injury data will be unavailable');
    }
  }

  /**
   * Get all injuries and suspensions for a team
   */
  async getTeamAbsences(teamId: number, season: number = new Date().getFullYear()): Promise<TeamAbsences> {
    const cacheKey = `${teamId}-${season}`;
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    if (!this.apiKey) {
      return this.getEmptyAbsences();
    }

    try {
      const response = await axios.get(`${this.baseUrl}/injuries`, {
        params: {
          team: teamId,
          season: season
        },
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      });

      const absences = this.parseAbsences(response.data.response);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: absences,
        timestamp: Date.now()
      });

      return absences;
    } catch (error) {
      console.error(`Error fetching injuries for team ${teamId}:`, error);
      return this.getEmptyAbsences();
    }
  }

  /**
   * Parse API response into structured absence data
   */
  private parseAbsences(data: any[]): TeamAbsences {
    const injuries: InjuryData[] = [];
    const suspensions: InjuryData[] = [];
    const keyPlayersOut: string[] = [];

    for (const item of data) {
      const player = item.player;
      const fixture = item.fixture;

      // Skip if player is back
      if (player.reason?.toLowerCase().includes('back') || 
          player.reason?.toLowerCase().includes('available')) {
        continue;
      }

      const injuryData: InjuryData = {
        player: player.name,
        position: player.type || 'Unknown',
        reason: player.reason || 'Unknown',
        type: this.determineAbsenceType(player.reason),
        severity: this.determineSeverity(player.reason)
      };

      if (injuryData.type === 'suspension') {
        suspensions.push(injuryData);
      } else {
        injuries.push(injuryData);
      }

      // Track key players
      if (this.isKeyPlayer(injuryData)) {
        keyPlayersOut.push(player.name);
      }
    }

    return {
      injuries,
      suspensions,
      totalOut: injuries.length + suspensions.length,
      keyPlayersOut,
      impactLevel: this.calculateImpactLevel(injuries, suspensions, keyPlayersOut)
    };
  }

  /**
   * Determine if absence is injury or suspension
   */
  private determineAbsenceType(reason: string): 'injury' | 'suspension' {
    const reasonLower = reason.toLowerCase();
    
    if (reasonLower.includes('suspension') || 
        reasonLower.includes('suspended') ||
        reasonLower.includes('red card') ||
        reasonLower.includes('yellow cards') ||
        reasonLower.includes('ban')) {
      return 'suspension';
    }
    
    return 'injury';
  }

  /**
   * Determine injury severity
   */
  private determineSeverity(reason: string): 'minor' | 'moderate' | 'major' {
    const reasonLower = reason.toLowerCase();
    
    // Major injuries
    if (reasonLower.includes('acl') ||
        reasonLower.includes('cruciate') ||
        reasonLower.includes('fracture') ||
        reasonLower.includes('broken') ||
        reasonLower.includes('surgery') ||
        reasonLower.includes('torn') ||
        reasonLower.includes('rupture')) {
      return 'major';
    }
    
    // Moderate injuries
    if (reasonLower.includes('strain') ||
        reasonLower.includes('sprain') ||
        reasonLower.includes('hamstring') ||
        reasonLower.includes('groin') ||
        reasonLower.includes('calf') ||
        reasonLower.includes('thigh')) {
      return 'moderate';
    }
    
    // Minor injuries
    return 'minor';
  }

  /**
   * Check if player is considered key
   */
  private isKeyPlayer(injury: InjuryData): boolean {
    // Goalkeepers are always key
    if (injury.position === 'Goalkeeper') return true;
    
    // Major injuries to any position are significant
    if (injury.severity === 'major') return true;
    
    // Moderate injuries to attackers and midfielders
    if (injury.severity === 'moderate' && 
        (injury.position === 'Attacker' || injury.position === 'Midfielder')) {
      return true;
    }
    
    return false;
  }

  /**
   * Calculate overall impact level
   */
  private calculateImpactLevel(
    injuries: InjuryData[], 
    suspensions: InjuryData[], 
    keyPlayersOut: string[]
  ): 'low' | 'medium' | 'high' {
    const totalOut = injuries.length + suspensions.length;
    const keyOut = keyPlayersOut.length;
    
    // High impact: 3+ key players or 5+ total players
    if (keyOut >= 3 || totalOut >= 5) return 'high';
    
    // Medium impact: 1-2 key players or 3-4 total players
    if (keyOut >= 1 || totalOut >= 3) return 'medium';
    
    // Low impact: minimal absences
    return 'low';
  }

  /**
   * Get empty absences object
   */
  private getEmptyAbsences(): TeamAbsences {
    return {
      injuries: [],
      suspensions: [],
      totalOut: 0,
      keyPlayersOut: [],
      impactLevel: 'low'
    };
  }

  /**
   * Get human-readable summary of absences
   */
  getAbsencesSummary(absences: TeamAbsences): string {
    if (absences.totalOut === 0) {
      return 'Full squad available';
    }

    const parts: string[] = [];

    if (absences.keyPlayersOut.length > 0) {
      parts.push(`Missing key players: ${absences.keyPlayersOut.slice(0, 3).join(', ')}`);
    }

    if (absences.injuries.length > 0) {
      parts.push(`${absences.injuries.length} injured`);
    }

    if (absences.suspensions.length > 0) {
      parts.push(`${absences.suspensions.length} suspended`);
    }

    return parts.join(' | ');
  }

  /**
   * Get detailed injury list for AI context
   */
  getDetailedInjuryList(absences: TeamAbsences, maxPlayers: number = 5): string {
    const allAbsences = [...absences.injuries, ...absences.suspensions];
    
    if (allAbsences.length === 0) {
      return 'No significant absences';
    }

    // Prioritize key players
    const sortedAbsences = allAbsences.sort((a, b) => {
      if (a.position === 'Goalkeeper' && b.position !== 'Goalkeeper') return -1;
      if (b.position === 'Goalkeeper' && a.position !== 'Goalkeeper') return 1;
      if (a.severity === 'major' && b.severity !== 'major') return -1;
      if (b.severity === 'major' && a.severity !== 'major') return 1;
      return 0;
    });

    const topAbsences = sortedAbsences.slice(0, maxPlayers);
    
    return topAbsences.map(absence => 
      `${absence.player} (${absence.position}) - ${absence.reason}`
    ).join('; ');
  }

  /**
   * Compare absences between two teams
   */
  compareTeamAbsences(homeAbsences: TeamAbsences, awayAbsences: TeamAbsences): string {
    if (homeAbsences.impactLevel === awayAbsences.impactLevel) {
      return 'Both teams similarly affected by absences';
    }

    if (homeAbsences.impactLevel === 'high' && awayAbsences.impactLevel === 'low') {
      return `Home team heavily depleted (${homeAbsences.totalOut} out) vs full-strength away side`;
    }

    if (awayAbsences.impactLevel === 'high' && homeAbsences.impactLevel === 'low') {
      return `Away team heavily depleted (${awayAbsences.totalOut} out) vs full-strength home side`;
    }

    if (homeAbsences.impactLevel === 'high') {
      return `Home team more affected (${homeAbsences.totalOut} vs ${awayAbsences.totalOut} out)`;
    }

    return `Away team more affected (${awayAbsences.totalOut} vs ${homeAbsences.totalOut} out)`;
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const injuryService = new InjuryService();
export type { InjuryData, TeamAbsences };
