import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

const LEAGUE_TABLES_PATH = path.resolve(process.cwd(), "../../shared/ml_outputs/league_tables.json");

router.get("/", async (req, res) => {
  try {
    if (!fs.existsSync(LEAGUE_TABLES_PATH)) {
      return res.status(404).json({ 
        success: false, 
        error: "League tables not found" 
      });
    }

    const raw = fs.readFileSync(LEAGUE_TABLES_PATH, "utf8");
    const data = JSON.parse(raw);

    return res.json({
      success: true,
      lastUpdated: data.lastUpdated,
      regions: data.regions
    });
  } catch (err) {
    console.error("League tables error:", err);
    return res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Get tables for specific region
router.get("/:region", async (req, res) => {
  try {
    const { region } = req.params;
    
    if (!fs.existsSync(LEAGUE_TABLES_PATH)) {
      return res.status(404).json({ 
        success: false, 
        error: "League tables not found" 
      });
    }

    const raw = fs.readFileSync(LEAGUE_TABLES_PATH, "utf8");
    const data = JSON.parse(raw);

    if (!data.regions[region]) {
      return res.status(404).json({ 
        success: false, 
        error: `Region ${region} not found` 
      });
    }

    return res.json({
      success: true,
      lastUpdated: data.lastUpdated,
      region: region,
      tables: data.regions[region]
    });
  } catch (err) {
    console.error("League tables error:", err);
    return res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

export default router;
