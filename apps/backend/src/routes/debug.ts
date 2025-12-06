import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

router.get('/env', async (req, res) => {
  try {
    const cwd = process.cwd();
    const publicPath = path.join(cwd, 'public');
    const mlPath = path.join(publicPath, 'ml_outputs');

    let mlFiles: string[] = [];
    try {
      mlFiles = fs.readdirSync(mlPath);
    } catch (_) {
      mlFiles = [];
    }

    res.json({
      success: true,
      runtime: {
        cwd,
        publicPath,
        mlPath,
      },
      files: mlFiles
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
