import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/index';
import FixturesPage from './pages/FixturesPage';
import MatchPage from './pages/MatchPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/fixtures" element={<FixturesPage />} />
        <Route path="/match/:fixtureId" element={<MatchPage />} />
      </Routes>
    </Router>
  );
}

export default App;
