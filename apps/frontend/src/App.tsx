import { BrowserRouter, Routes, Route } from "react-router-dom";
import FixturesView from "./components/FixturesView";
import MatchPage from "./pages/MatchPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FixturesView />} />
        <Route path="/fixtures" element={<FixturesView />} />
        <Route path="/match/:fixtureId" element={<MatchPage />} />
      </Routes>
    </BrowserRouter>
  );
}
