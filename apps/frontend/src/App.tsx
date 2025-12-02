import { BrowserRouter, Routes, Route } from "react-router-dom";
import FixturesView from "./components/FixturesView";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FixturesView />} />
        <Route path="/fixtures" element={<FixturesView />} />
      </Routes>
    </BrowserRouter>
  );
}
