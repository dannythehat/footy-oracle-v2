import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// React Query Setup
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import HomePageWithBetBuilder from "./pages/HomePageWithBetBuilder";
import FixturesPage from "./pages/fixtures";
import HistoricalResults from "./pages/HistoricalResults";
import BetBuilderHistory from "./pages/BetBuilderHistory";

// create a single QueryClient instance
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<HomePageWithBetBuilder />} />
        <Route path="/fixtures" element={<FixturesPage />} />
        <Route path="/history" element={<HistoricalResults />} />
        <Route path="/betbuilder-history" element={<BetBuilderHistory />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
