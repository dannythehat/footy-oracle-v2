import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/index";
import FixturesView from "./components/FixturesView";
import MatchPage from "./pages/MatchPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/fixtures" element={<FixturesView />} />
        <Route path="/match/:fixtureId" element={<MatchPage />} />
      </Routes>
    </BrowserRouter>
  );
}
