import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HistoricalResults from './pages/HistoricalResults';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black">
        {/* Navigation */}
        <nav className="border-b border-purple-900/50 bg-gradient-to-r from-black via-purple-950/20 to-black">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-purple-400 bg-clip-text text-transparent">
                ⚡ THE FOOTY ORACLE
              </Link>
              <div className="flex gap-4">
                <Link 
                  to="/" 
                  className="text-sm text-purple-300 hover:text-purple-200 font-semibold transition-colors"
                >
                  Home
                </Link>
                <Link 
                  to="/history" 
                  className="text-sm text-purple-300 hover:text-purple-200 font-semibold transition-colors"
                >
                  History
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/history" element={<HistoricalResults />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
