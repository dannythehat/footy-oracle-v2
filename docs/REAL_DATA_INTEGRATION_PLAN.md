# AI Betting Insights - Real Data Integration Plan

## 🎯 Objective
Replace mock data with real API-Football data and integrate ChatGPT for enhanced AI reasoning.

## 📋 Phase 1: API-Football Integration

### 1.1 Environment Setup
**File:** `apps/backend/.env`
```env
API_FOOTBALL_KEY=your_api_key_here
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io
```

**File:** `apps/backend/src/config/apiFootball.ts` (NEW)
```typescript
export const apiFootballConfig = {
  apiKey: process.env.API_FOOTBALL_KEY,
  baseUrl: process.env.API_FOOTBALL_BASE_URL,
  endpoints: {
    fixtures: '/fixtures',
    statistics: '/fixtures/statistics',
    h2h: '/fixtures/headtohead',
    standings: '/standings',
    injuries: '/injuries',
    predictions: '/predictions'
  }
};
```

### 1.2 API-Football Service
**File:** `apps/backend/src/services/apiFootballService.ts` (NEW)

**Methods to implement:**
```typescript
class ApiFootballService {
  // Core data fetching
  async getFixtureStatistics(fixtureId: number): Promise<FixtureStats>
  async getHeadToHead(team1Id: number, team2Id: number): Promise<H2HData>
  async getTeamForm(teamId: number, last: number = 5): Promise<FormData>
  async getTeamStatistics(teamId: number, season: number, league: number): Promise<TeamStats>
  async getInjuries(teamId: number): Promise<InjuryData[]>
  async getStandings(league: number, season: number): Promise<StandingsData>
  
  // Aggregated data for betting insights
  async gatherComprehensiveFixtureData(fixtureId: number): Promise<ComprehensiveData>
}
```

**Data Structures:**
```typescript
interface FixtureStats {
  homeTeam: {
    shotsOnGoal: number;
    shotsOffGoal: number;
    totalShots: number;
    possession: number;
    corners: number;
    yellowCards: number;
    redCards: number;
  };
  awayTeam: { /* same */ };
}

interface H2HData {
  matches: Array<{
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    totalGoals: number;
    corners: number;
    cards: number;
  }>;
  stats: {
    totalMatches: number;
    over25Rate: number;
    btsRate: number;
    avgGoals: number;
    avgCorners: number;
    avgCards: number;
  };
}

interface FormData {
  matches: Array<{
    result: 'W' | 'D' | 'L';
    goalsScored: number;
    goalsConceded: number;
    corners: number;
    cards: number;
  }>;
  summary: {
    formString: string; // "WWDWL"
    avgGoalsScored: number;
    avgGoalsConceded: number;
    avgCorners: number;
    avgCards: number;
    cleanSheets: number;
  };
}

interface TeamStats {
  league: string;
  season: number;
  form: string;
  fixtures: {
    played: { home: number; away: number; total: number };
    wins: { home: number; away: number; total: number };
    draws: { home: number; away: number; total: number };
    loses: { home: number; away: number; total: number };
  };
  goals: {
    for: { total: { home: number; away: number; total: number }; average: { home: string; away: string; total: string } };
    against: { total: { home: number; away: number; total: number }; average: { home: string; away: string; total: string } };
  };
  cards: {
    yellow: { total: number; average: string };
    red: { total: number; average: string };
  };
}

interface ComprehensiveData {
  fixture: {
    id: number;
    homeTeam: { id: number; name: string };
    awayTeam: { id: number; name: string };
    league: string;
    date: Date;
  };
  homeTeam: {
    form: FormData;
    seasonStats: TeamStats;
    injuries: InjuryData[];
    standing: { rank: number; points: number };
  };
  awayTeam: {
    form: FormData;
    seasonStats: TeamStats;
    injuries: InjuryData[];
    standing: { rank: number; points: number };
  };
  h2h: H2HData;
}
```

### 1.3 Update Betting Insights Service
**File:** `apps/backend/src/services/bettingInsightsService.ts`

**Changes needed:**
```typescript
// BEFORE (line 54-77)
private async gatherFixtureContext(fixture: IFixture) {
  // Mock data
  return { /* hardcoded values */ };
}

// AFTER
private async gatherFixtureContext(fixture: IFixture) {
  const comprehensiveData = await apiFootballService.gatherComprehensiveFixtureData(fixture.fixtureId);
  
  return {
    homeTeam: comprehensiveData.fixture.homeTeam.name,
    awayTeam: comprehensiveData.fixture.awayTeam.name,
    league: comprehensiveData.fixture.league,
    date: comprehensiveData.fixture.date,
    
    // Real form data
    homeForm: comprehensiveData.homeTeam.form.summary.formString,
    awayForm: comprehensiveData.awayTeam.form.summary.formString,
    
    // Real H2H data
    h2hGoals: {
      avg: comprehensiveData.h2h.stats.avgGoals,
      over25: comprehensiveData.h2h.stats.over25Rate
    },
    
    // Real team statistics
    homeGoalsAvg: {
      scored: parseFloat(comprehensiveData.homeTeam.seasonStats.goals.for.average.home),
      conceded: parseFloat(comprehensiveData.homeTeam.seasonStats.goals.against.average.home)
    },
    awayGoalsAvg: {
      scored: parseFloat(comprehensiveData.awayTeam.seasonStats.goals.for.average.away),
      conceded: parseFloat(comprehensiveData.awayTeam.seasonStats.goals.against.average.away)
    },
    
    // Real cards/corners data
    homeCardsAvg: parseFloat(comprehensiveData.homeTeam.seasonStats.cards.yellow.average),
    awayCardsAvg: parseFloat(comprehensiveData.awayTeam.seasonStats.cards.yellow.average),
    homeCornersAvg: comprehensiveData.homeTeam.form.summary.avgCorners,
    awayCornersAvg: comprehensiveData.awayTeam.form.summary.avgCorners,
    
    // Additional context
    homeInjuries: comprehensiveData.homeTeam.injuries,
    awayInjuries: comprehensiveData.awayTeam.injuries,
    homeStanding: comprehensiveData.homeTeam.standing,
    awayStanding: comprehensiveData.awayTeam.standing
  };
}
```

### 1.4 Enhanced Calculation Methods
Update each calculation method to use real data:

```typescript
// Example: Enhanced BTS calculation
private async calculateBTS(context: any): Promise<{ percentage: number; confidence: 'high' | 'medium' | 'low' }> {
  // Factor 1: Team scoring ability (40% weight)
  const homeScoring = context.homeGoalsAvg.scored >= 1.2;
  const awayScoring = context.awayGoalsAvg.scored >= 1.0;
  
  // Factor 2: Defensive vulnerability (30% weight)
  const homeLeaky = context.homeGoalsAvg.conceded >= 1.0;
  const awayLeaky = context.awayGoalsAvg.conceded >= 1.0;
  
  // Factor 3: H2H history (20% weight)
  const h2hBtsRate = context.h2h.stats.btsRate;
  
  // Factor 4: Recent form (10% weight)
  const homeFormScoring = context.homeTeam.form.summary.avgGoalsScored >= 1.0;
  const awayFormScoring = context.awayTeam.form.summary.avgGoalsScored >= 1.0;
  
  // Calculate weighted percentage
  let percentage = 50; // Base
  
  if (homeScoring && awayScoring) percentage += 20;
  if (homeLeaky && awayLeaky) percentage += 15;
  percentage += h2hBtsRate * 20;
  if (homeFormScoring && awayFormScoring) percentage += 10;
  
  // Adjust for injuries (key attackers out)
  const keyInjuries = this.countKeyAttackerInjuries(context.homeInjuries, context.awayInjuries);
  percentage -= keyInjuries * 5;
  
  // Cap at 95%
  percentage = Math.min(95, Math.max(20, percentage));
  
  const confidence = percentage >= 70 ? 'high' : percentage >= 55 ? 'medium' : 'low';
  
  return { percentage: Math.round(percentage), confidence };
}
```

---

## 📋 Phase 2: ChatGPT Integration for AI Reasoning

### 2.1 Environment Setup
**File:** `apps/backend/.env`
```env
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-4o  # or gpt-4-turbo
```

### 2.2 OpenAI Service
**File:** `apps/backend/src/services/openaiService.ts` (NEW)

```typescript
import OpenAI from 'openai';

class OpenAIService {
  private client: OpenAI;
  
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  
  async generateBettingReasoning(
    betType: string,
    percentage: number,
    context: ComprehensiveData
  ): Promise<string> {
    const prompt = this.buildReasoningPrompt(betType, percentage, context);
    
    const completion = await this.client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: this.getSystemPrompt()
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });
    
    return completion.choices[0].message.content || 'Analysis unavailable';
  }
  
  private getSystemPrompt(): string {
    return `You are a professional football betting analyst with deep knowledge of statistics and match dynamics.

Your role:
- Analyze betting opportunities using statistical data
- Provide clear, concise reasoning (2-3 sentences max)
- Focus on key factors that support the prediction
- Use professional but accessible language
- Be confident but not overconfident
- Mention specific statistics when relevant

Style guidelines:
- Start with the main reason
- Support with 1-2 key statistics
- End with a confidence statement if appropriate
- Avoid hedge words like "might", "could", "possibly"
- Use active voice
- Keep it under 50 words`;
  }
  
  private buildReasoningPrompt(betType: string, percentage: number, context: any): string {
    const betDescriptions = {
      bts: 'Both Teams to Score',
      over25: 'Over 2.5 Goals',
      over35cards: 'Over 3.5 Cards',
      over95corners: 'Over 9.5 Corners'
    };
    
    return `Generate betting reasoning for: ${betDescriptions[betType as keyof typeof betDescriptions]}

Match: ${context.homeTeam.name} vs ${context.awayTeam.name}
League: ${context.league}
Prediction: ${percentage}% probability

Home Team Stats:
- Form: ${context.homeForm} (last 5 matches)
- Goals Scored (avg): ${context.homeGoalsAvg.scored} per game
- Goals Conceded (avg): ${context.homeGoalsAvg.conceded} per game
- Cards (avg): ${context.homeCardsAvg} per game
- Corners (avg): ${context.homeCornersAvg} per game
- League Position: ${context.homeStanding.rank}
- Key Injuries: ${context.homeInjuries.length} players

Away Team Stats:
- Form: ${context.awayForm} (last 5 matches)
- Goals Scored (avg): ${context.awayGoalsAvg.scored} per game
- Goals Conceded (avg): ${context.awayGoalsAvg.conceded} per game
- Cards (avg): ${context.awayCardsAvg} per game
- Corners (avg): ${context.awayCornersAvg} per game
- League Position: ${context.awayStanding.rank}
- Key Injuries: ${context.awayInjuries.length} players

Head-to-Head:
- Last ${context.h2h.stats.totalMatches} meetings
- Average goals: ${context.h2h.stats.avgGoals}
- Over 2.5 rate: ${(context.h2h.stats.over25Rate * 100).toFixed(0)}%
- BTS rate: ${(context.h2h.stats.btsRate * 100).toFixed(0)}%
- Average corners: ${context.h2h.stats.avgCorners}
- Average cards: ${context.h2h.stats.avgCards}

Provide a concise, professional explanation (2-3 sentences) for why this bet has a ${percentage}% probability.`;
  }
}

export const openaiService = new OpenAIService();
```

### 2.3 Update Betting Insights Service
**File:** `apps/backend/src/services/bettingInsightsService.ts`

```typescript
// BEFORE (line 189-201)
private generateGoldenBetReasoning(betType: string, context: any): string {
  // Template-based reasoning
  const reasoningTemplates = { /* ... */ };
  return reasoningTemplates[betType] || 'Strong statistical indicators support this selection.';
}

// AFTER
private async generateGoldenBetReasoning(betType: string, percentage: number, context: any): Promise<string> {
  try {
    return await openaiService.generateBettingReasoning(betType, percentage, context);
  } catch (error) {
    console.error('Error generating AI reasoning:', error);
    // Fallback to template-based reasoning
    return this.getFallbackReasoning(betType, context);
  }
}

private getFallbackReasoning(betType: string, context: any): string {
  // Keep existing template logic as fallback
  const reasoningTemplates = {
    bts: `Both teams have strong attacking records. ${context.homeTeam} averaging ${context.homeGoalsAvg.scored} goals at home, while ${context.awayTeam} scoring ${context.awayGoalsAvg.scored} away.`,
    over25: `High-scoring fixture expected. Combined goals average of ${(context.homeGoalsAvg.scored + context.awayGoalsAvg.scored).toFixed(1)} per game.`,
    over35cards: `Physical encounter anticipated. Both teams averaging ${((context.homeCardsAvg + context.awayCardsAvg) / 2).toFixed(1)} cards per game.`,
    over95corners: `Attacking styles guarantee corners. Combined average of ${(context.homeCornersAvg + context.awayCornersAvg).toFixed(1)} corners per match.`
  };
  return reasoningTemplates[betType as keyof typeof reasoningTemplates] || 'Strong statistical indicators support this selection.';
}
```

**Update determineGoldenBet method:**
```typescript
// Change from synchronous to async
private async determineGoldenBet(
  insights: { /* ... */ },
  context: any
): Promise<{ type: string; percentage: number; reasoning: string }> {
  const betTypes = [ /* ... */ ];
  const golden = betTypes.reduce((max, bet) => 
    bet.percentage > max.percentage ? bet : max
  );

  // Generate AI reasoning using ChatGPT
  const reasoning = await this.generateGoldenBetReasoning(golden.type, golden.percentage, context);

  return {
    type: golden.type,
    percentage: golden.percentage,
    reasoning
  };
}
```

---

## 📋 Phase 3: ChatGPT Response Format Discussion

### 3.1 Current Golden Bet Reasoning Format
**Current output example:**
```
"Both teams have strong attacking records. Arsenal averaging 2.1 goals at home, 
while Liverpool scoring 1.8 away. Historical H2H shows both teams scoring in 
majority of meetings."
```

### 3.2 Proposed Enhanced Format Options

**Option A: Concise Statistical (Recommended)**
```
"Arsenal's 2.3 goals/game at home and Liverpool's 1.9 away combine with their 
78% BTS rate in last 10 H2H meetings. Both defenses conceding 1.2+ goals/game 
this season."
```
- ✅ Data-driven
- ✅ Specific numbers
- ✅ Professional tone
- ✅ 2-3 sentences

**Option B: Narrative Style**
```
"This fixture screams goals from both ends. Arsenal's attacking prowess at the 
Emirates (2.3 goals/game) meets Liverpool's clinical away form (1.9 goals/game). 
Their recent meetings have been goal-fests, with both teams scoring in 8 of the 
last 10 encounters."
```
- ✅ Engaging
- ✅ Storytelling
- ⚠️ Less formal
- ✅ 3-4 sentences

**Option C: Bullet Point Analysis**
```
Key factors supporting BTS:
• Arsenal: 2.3 goals/game at home, 1.2 conceded
• Liverpool: 1.9 goals/game away, defensive issues (1.4 conceded)
• H2H: 78% BTS rate in last 10 meetings
• High confidence: Both teams in scoring form
```
- ✅ Scannable
- ✅ Clear structure
- ⚠️ Longer format
- ✅ Easy to digest

**Option D: Confidence-First**
```
"HIGH CONFIDENCE: Arsenal's home attacking record (2.3 goals/game) and Liverpool's 
away scoring form (1.9 goals/game) make this a strong BTS pick. Their H2H history 
shows 78% BTS rate, and both defenses are vulnerable this season."
```
- ✅ Clear confidence level
- ✅ Structured
- ✅ Professional
- ✅ 2-3 sentences

### 3.3 Questions for Discussion

**1. Tone & Style:**
- Professional analyst vs. Engaging storyteller?
- Data-heavy vs. Narrative-driven?
- Formal vs. Conversational?

**2. Length:**
- Short (30-40 words)?
- Medium (50-70 words)?
- Detailed (80-100 words)?

**3. Structure:**
- Paragraph format?
- Bullet points?
- Hybrid (intro + bullets)?

**4. Confidence Expression:**
- Explicit ("HIGH CONFIDENCE")?
- Implicit (tone conveys confidence)?
- Percentage-based ("78% historical rate")?

**5. Key Information Priority:**
- Start with conclusion or data?
- Lead with strongest factor?
- Balanced coverage of all factors?

**6. Personalization:**
- Generic analysis?
- Tailored to user's betting history?
- Risk-level adjusted (conservative vs. aggressive)?

### 3.4 Recommended Approach (Pending Your Input)

**My suggestion: Option A (Concise Statistical) with modifications:**

```typescript
const systemPrompt = `You are a professional football betting analyst.

Output format:
1. Lead with the strongest statistical factor (1 sentence)
2. Support with 1-2 additional key metrics (1 sentence)
3. Optional: Brief context or confidence statement (1 sentence)

Style:
- Professional but accessible
- Data-driven (include specific numbers)
- Confident tone (avoid hedging)
- 40-60 words total
- No bullet points
- Active voice

Example:
"Arsenal's 2.3 goals/game at home and Liverpool's 1.9 away combine with their 
78% BTS rate in last 10 H2H meetings. Both defenses conceding 1.2+ goals/game 
this season makes this a strong pick."
`;
```

**Why this approach:**
- ✅ Professional credibility
- ✅ Specific, verifiable data
- ✅ Concise (mobile-friendly)
- ✅ Easy to scan
- ✅ Builds trust with numbers

---

## 📋 Phase 4: Implementation Checklist

### 4.1 API-Football Integration
- [ ] Add API-Football credentials to `.env`
- [ ] Create `apiFootballConfig.ts`
- [ ] Implement `ApiFootballService` class
- [ ] Add data structure interfaces
- [ ] Update `gatherFixtureContext()` method
- [ ] Enhance calculation methods with real data
- [ ] Add error handling for API failures
- [ ] Implement rate limiting (API-Football has limits)
- [ ] Add caching layer (Redis?) for frequently accessed data
- [ ] Test with real fixtures

### 4.2 ChatGPT Integration
- [ ] Add OpenAI credentials to `.env`
- [ ] Install OpenAI SDK: `npm install openai`
- [ ] Create `OpenAIService` class
- [ ] **DISCUSS & FINALIZE:** Response format with user
- [ ] Implement system prompt based on agreed format
- [ ] Update `generateGoldenBetReasoning()` to use ChatGPT
- [ ] Add fallback mechanism for API failures
- [ ] Implement response caching (avoid regenerating)
- [ ] Add token usage monitoring
- [ ] Test reasoning quality with sample fixtures

### 4.3 Testing & Validation
- [ ] Unit tests for API-Football service
- [ ] Unit tests for OpenAI service
- [ ] Integration tests for betting insights generation
- [ ] Validate calculation accuracy with historical data
- [ ] Test error handling (API failures, rate limits)
- [ ] Performance testing (generation time)
- [ ] Cost analysis (API calls per fixture)
- [ ] User acceptance testing

### 4.4 Monitoring & Optimization
- [ ] Add logging for API calls
- [ ] Track prediction accuracy over time
- [ ] Monitor API costs (API-Football + OpenAI)
- [ ] Implement caching strategy
- [ ] Set up alerts for API failures
- [ ] Create admin dashboard for insights performance

---

## 💰 Cost Estimation

### API-Football
- **Free tier:** 100 requests/day
- **Basic:** $15/month - 3,000 requests/day
- **Pro:** $35/month - 10,000 requests/day

**Estimated usage per fixture:**
- Statistics: 1 call
- H2H: 1 call
- Team stats: 2 calls (home + away)
- Injuries: 2 calls
- Standings: 1 call
**Total: ~7 calls per fixture**

**Daily estimate (100 fixtures):** 700 calls → **Pro plan needed**

### OpenAI
- **GPT-4o:** $2.50 per 1M input tokens, $10 per 1M output tokens
- **GPT-4-turbo:** $10 per 1M input tokens, $30 per 1M output tokens

**Estimated usage per fixture:**
- Input: ~800 tokens (context)
- Output: ~100 tokens (reasoning)

**Daily estimate (100 fixtures):**
- Input: 80,000 tokens = $0.20 (GPT-4o)
- Output: 10,000 tokens = $0.10 (GPT-4o)
**Total: ~$0.30/day = $9/month**

**Combined monthly cost: ~$44/month**

---

## 🚀 Deployment Strategy

### Step 1: Development Branch
```bash
git checkout -b feature/real-data-integration
```

### Step 2: Implement in Order
1. API-Football service (can test immediately)
2. Update betting insights calculations
3. OpenAI service (after format discussion)
4. Update golden bet reasoning
5. Testing & validation

### Step 3: Gradual Rollout
- Test with small subset of fixtures first
- Monitor accuracy and costs
- Adjust calculations based on results
- Full rollout after validation

---

## ❓ Next Steps - Discussion Needed

**Before we start coding, please decide:**

1. **ChatGPT Response Format:** Which option (A/B/C/D) or custom format?
2. **Tone:** Professional analyst or engaging storyteller?
3. **Length:** 40-60 words or different?
4. **Structure:** Paragraph or bullets?
5. **Confidence:** Explicit or implicit?

**Once you provide guidance, I'll:**
1. Create the implementation branch
2. Build API-Football service
3. Implement OpenAI service with your preferred format
4. Update betting insights service
5. Test and validate

Ready to discuss the ChatGPT response format? 🎯
