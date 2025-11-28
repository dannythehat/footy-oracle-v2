import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePageWithBetBuilder';
import HistoricalResults from './pages/HistoricalResults';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black">
        {/* Navigation */}
        <nav className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 border-b border-purple-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex space-x-8">
                <Link 
                  to="/" 
                  className="inline-flex items-center px-1 pt-1 text-white hover:text-purple-300 transition-colors"
                >
                  🔮 The Footy Oracle
                </Link>
                <Link 
                  to="/history" 
                  className="inline-flex items-center px-1 pt-1 text-purple-200 hover:text-white transition-colors"
                >
                  📊 Historical Results
                </Link>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-purple-300">
                  ✅ Fixtures Live
                </span>
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
