// This is the code to add to fixtures.ts after line 355 (after /meta/leagues endpoint)

/* ============================================================
   📌 FIXTURE ODDS - Get odds and AI predictions for a fixture
   ============================================================ */
router.get('/:id/odds', async (req: Request, res: Response) => {
  try {
    const fixture = await Fixture.findOne({ fixtureId: Number(req.params.id) })
      .lean()
      .maxTimeMS(3000);

    if (!fixture) {
      return res.status(404).json({
        success: false,
        error: 'Fixture not found'
      });
    }

    // Return odds and AI predictions
    const oddsData = {
      odds: fixture.odds || null,
      aiBets: fixture.aiBets || null,
      golden_bet: fixture.golden_bet || null,
    };

    res.json({
      success: true,
      data: oddsData
    });
  } catch (error: any) {
    console.error('❌ Error fetching fixture odds:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
