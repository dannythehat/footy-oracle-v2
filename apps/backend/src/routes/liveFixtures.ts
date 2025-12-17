import { Router } from "express";

const router = Router();

/**
 * TEMPORARY STUB
 * Live fixtures will be reintroduced after launch.
 * This prevents TypeScript build failures from legacy code.
 */

router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Live fixtures temporarily disabled"
  });
});

export default router;
