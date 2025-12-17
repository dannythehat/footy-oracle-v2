import oracleRoutes from "../routes/oracle.js";

export function mountOracleRoutes(app: any) {
  app.use("/api", oracleRoutes);
}
