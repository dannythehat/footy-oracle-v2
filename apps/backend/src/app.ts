import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    "https://footy-oracle-v2.vercel.app",
    "https://footy-oracle-v2-*.vercel.app",
    "https://footy-oracle-v2-dannys-projects-83c67aed.vercel.app"
  ],
  methods: ["GET","POST"],
  credentials: false
}));

app.use(express.json());

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ROUTES
import fixturesRoutes from "./routes/fixtures";
import adminRoutes from "./routes/admin";
import notificationsRoutes from "./routes/notifications";

app.use("/api/fixtures", fixturesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationsRoutes);

export default app;
