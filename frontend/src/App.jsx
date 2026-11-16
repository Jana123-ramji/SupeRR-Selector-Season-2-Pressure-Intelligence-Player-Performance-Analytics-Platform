import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import RankingsPage from './pages/RankingsPage';
import PlayerExplorerPage from './pages/PlayerExplorerPage';
import PlayerAnalysisPage from './pages/PlayerAnalysisPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import MethodologyPage from './pages/MethodologyPage';
import ModelAccuracyPage from './pages/ModelAccuracyPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-rr-navy-dark text-slate-100 font-sans selection:bg-rr-pink selection:text-white">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/rankings" element={<RankingsPage />} />
            <Route path="/explorer" element={<PlayerExplorerPage />} />
            <Route path="/player/:id" element={<PlayerAnalysisPage />} />
            <Route path="/analytics" element={<AnalyticsDashboardPage />} />
            <Route path="/model-accuracy" element={<ModelAccuracyPage />} />
            <Route path="/methodology" element={<MethodologyPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
