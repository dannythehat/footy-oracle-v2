import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePageWithBetBuilder from "./pages/HomePageWithBetBuilder";
import FixturesPage from "./pages/fixtures";
import HistoricalResults from "./pages/HistoricalResults";
import BetBuilderHistory from "./pages/BetBuilderHistory";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePageWithBetBuilder />} />
      <Route path="/fixtures" element={<FixturesPage />} />
      <Route path="/history" element={<HistoricalResults />} />
      <Route path="/betbuilder-history" element={<BetBuilderHistory />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
