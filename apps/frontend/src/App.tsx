import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from './pages';
import FixturesPage from './pages/FixturesPage';
import LeagueTablesPage from './pages/LeagueTablesPage';
import PnLHubPage from './pages/PnLHubPage';
import './index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/fixtures" element={<FixturesPage />} />
          <Route path="/golden-bets" element={<HomePage />} />
          <Route path="/bet-builders" element={<HomePage />} />
          <Route path="/league-tables" element={<LeagueTablesPage />} />
          <Route path="/pnl-hub" element={<PnLHubPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
