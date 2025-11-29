import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// React Query Setup
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import HomePage from "./pages/index";
import FixturesPage from "./pages/fixtures";
import HistoricalResults from "./pages/HistoricalResults";
import BetBuilderHistory from "./pages/BetBuilderHistory";

// create a single QueryClient instance
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/fixtures" element={<FixturesPage />} />
          <Route path="/history" element={<HistoricalResults />} />
          <Route path="/betbuilder-history" element={<BetBuilderHistory />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
