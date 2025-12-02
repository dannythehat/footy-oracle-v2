import { BrowserRouter, Routes, Route } from "react-router-dom";
import FixturesPage from "./pages/fixtures";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FixturesPage />} />
        <Route path="/fixtures" element={<FixturesPage />} />
      </Routes>
    </BrowserRouter>
  );
}
