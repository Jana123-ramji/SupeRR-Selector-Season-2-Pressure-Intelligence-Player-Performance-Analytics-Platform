import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  Flame,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  BrainCircuit,
  Users,
  Target,
  Sparkles,
  BarChart3,
  Calendar,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import PlayerCard from '../components/PlayerCard';

export default function HomePage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [topBatters, setTopBatters] = useState([]);
  const [topBowlers, setTopBowlers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [sumRes, batRes, bowlRes] = await Promise.all([
          api.getSummary(),
          api.getTopBatters(10),
          api.getTopBowlers(10)
        ]);
        setSummary(sumRes);
        setTopBatters(batRes);
        setTopBowlers(bowlRes);
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/explorer?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16 overflow-x-hidden">
      
      {/* ── 1. Hero Section: Rajasthan Royals Inspired ── */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[250px] sm:h-[400px] bg-rr-pink/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-4 sm:right-10 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-blue-600/10 blur-[110px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-4 w-[250px] h-[250px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative text-center max-w-4xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Hackathon Badge Pill */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-rr-pink/40 shadow-lg shadow-rr-pink/10 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-rr-pink animate-ping" />
            <Flame className="w-4 h-4 text-rr-pink" />
            <span className="text-slate-200 text-xs font-bold tracking-wide">
              Rajasthan Royals Hackathon • <span className="text-rr-pink">SupeRR Selector Season 2</span>
            </span>
          </div>

          {/* Main Title */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tight text-white leading-none">
              SupeRR <span className="gradient-text-rr">Selector</span>
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl font-display font-extrabold text-slate-200 tracking-tight">
              Pressure Intelligence & Player Performance Analytics
            </p>
          </div>

          {/* Objective Description */}
          <p className="text-sm sm:text-base md:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Distinguishing cricketers who consistently rise to the occasion from those who falter when the match is on the line. Data-backed, explainable Machine Learning trained on 200,999 historical IPL and T20I deliveries.
          </p>

          {/* Search Box Input */}
          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto pt-1">
            <div className="relative flex items-center group">
              <input
                type="text"
                placeholder="Search any player (e.g., Virat Kohli, Rashid Khan, Sunil Narine)..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full bg-slate-900/95 text-xs sm:text-sm md:text-base text-white placeholder-slate-400 pl-11 pr-24 sm:pr-28 py-3.5 sm:py-4 rounded-2xl border border-slate-700/80 focus:outline-none focus:border-rr-pink focus:ring-2 focus:ring-rr-pink/30 shadow-2xl transition duration-300"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 group-focus-within:text-rr-pink transition-colors" />
              <button
                type="submit"
                className="absolute right-2 px-3.5 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-rr-pink to-rr-pink-dark hover:from-rr-pink-light hover:to-rr-pink text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-rr-pink/30 transition duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Explore
              </button>
            </div>
          </form>

          {/* Prominent Action CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <Link
              to="/rankings"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-rr-pink via-rose-600 to-rr-pink-dark hover:from-rr-pink-light hover:to-rr-pink text-white font-bold text-xs sm:text-sm shadow-xl shadow-rr-pink/30 flex items-center space-x-2 transition duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Trophy className="w-4 h-4" />
              <span>Explore Pressure Rankings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/model-accuracy"
              className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/90 text-white font-bold text-xs sm:text-sm shadow-lg flex items-center space-x-2 transition duration-200 hover:border-rr-pink/50 hover:scale-[1.02]"
            >
              <BrainCircuit className="w-4 h-4 text-rr-pink" />
              <span>Model Accuracy</span>
            </Link>

            <Link
              to="/explorer"
              className="px-6 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs sm:text-sm transition duration-200 flex items-center space-x-2"
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span>Player Explorer (958)</span>
            </Link>
          </div>

        </div>

        {/* ── 2. Verified Dataset Counters ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mt-14 sm:mt-20 max-w-5xl mx-auto">
          
          <div className="glass-card p-5 sm:p-6 rounded-2xl text-center border-slate-800/80 hover:border-rr-pink/40 transition duration-300 hover:-translate-y-1 group">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-slate-200 group-hover:text-white group-hover:border-white/20 transition">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight">
              {summary ? summary.total_matches.toLocaleString() : '883'}
            </div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Matches Analysed (2022-26)</div>
            <div className="text-[10px] text-slate-500 mt-0.5">IPL + T20 Internationals</div>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-2xl text-center border-slate-800/80 hover:border-rr-pink/40 transition duration-300 hover:-translate-y-1 group">
            <div className="w-10 h-10 rounded-xl bg-rr-pink/10 border border-rr-pink/20 flex items-center justify-center mx-auto mb-3 text-rr-pink group-hover:bg-rr-pink/20 transition">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-4xl font-display font-black text-rr-pink tracking-tight">
              {summary ? summary.total_deliveries.toLocaleString() : '200,999'}
            </div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Ball-by-Ball Records</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Every legal delivery enriched</div>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-2xl text-center border-slate-800/80 hover:border-amber-500/40 transition duration-300 hover:-translate-y-1 group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3 text-amber-400 group-hover:bg-amber-500/20 transition">
              <Flame className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-4xl font-display font-black text-amber-400 tracking-tight">
              {summary ? summary.total_pressure_deliveries.toLocaleString() : '43,877'}
            </div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Pressure Deliveries (21.8%)</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Pressure Index ≥ 70 / 100</div>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-2xl text-center border-slate-800/80 hover:border-blue-500/40 transition duration-300 hover:-translate-y-1 group">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3 text-blue-400 group-hover:bg-blue-500/20 transition">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-4xl font-display font-black text-blue-400 tracking-tight">
              {summary ? summary.total_players.toLocaleString() : '958'}
            </div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Unique Cricketer Pool</div>
            <div className="text-[10px] text-slate-500 mt-0.5">All teams & tournaments</div>
          </div>

        </div>
      </section>


      {/* ── 3. Top 10 Batters & Bowlers Section (Redesigned Cards) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800 pb-5 gap-3">
          <div>
            <div className="flex items-center space-x-2 text-rr-pink text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4" />
              <span>Official RR Intelligence Rankings</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-display font-black text-white mt-1">
              Top Performers Under High Pressure
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Dynamically calculated from real 2022–2026 match outcomes using Bayesian reliability shrinkage and ML expected values.
            </p>
          </div>
          <Link
            to="/rankings"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs sm:text-sm font-bold text-rr-pink hover:text-white hover:border-rr-pink transition shrink-0"
          >
            <span>View Full Leaderboards (300+ Players)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Dual Rankings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          
          {/* ── TOP 10 BATTERS COLUMN ── */}
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-full bg-rr-pink shadow-md shadow-rr-pink/50" />
                <h3 className="font-display font-bold text-lg sm:text-xl text-white">
                  Top 10 Batters Under Pressure
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400 font-mono">
                PRS Scoring (0-100)
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                <div className="w-8 h-8 border-2 border-rr-pink border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading Top 10 Batters...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                {topBatters.map((b) => (
                  <PlayerCard key={b.player_id} player={b} type="batting" />
                ))}
              </div>
            )}
          </div>

          {/* ── TOP 10 BOWLERS COLUMN ── */}
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-full bg-blue-500 shadow-md shadow-blue-500/50" />
                <h3 className="font-display font-bold text-lg sm:text-xl text-white">
                  Top 10 Bowlers Under Pressure
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400 font-mono">
                PRS Scoring (0-100)
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading Top 10 Bowlers...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                {topBowlers.map((w) => (
                  <PlayerCard key={w.player_id} player={w} type="bowling" />
                ))}
              </div>
            )}
          </div>

        </div>
      </section>


      {/* ── 4. Explainable Architecture Breakdown Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="glass-card p-6 sm:p-10 rounded-3xl border-slate-800/80 space-y-8 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center space-x-2 text-rr-pink text-xs font-bold uppercase tracking-wider">
              <BrainCircuit className="w-4 h-4" />
              <span>Scientific Methodology</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-white">
              Explainable Pressure Intelligence Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Built on mathematical match physics, chronological ML validation (2022-2024 train, 2025-2026 test), and Bayesian shrinkage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            
            <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80 hover:border-rr-pink/40 transition duration-300 space-y-3 group">
              <div className="w-12 h-12 rounded-xl bg-rr-pink/15 border border-rr-pink/30 flex items-center justify-center text-rr-pink group-hover:scale-105 transition">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base">1. Contextual Pressure Index</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates ball-level match states: Required Run Rate, balls remaining, wickets in hand, and innings stage. Normal (&lt;45), Moderate (45-70), and High Pressure (≥70).
              </p>
            </div>

            <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80 hover:border-blue-500/40 transition duration-300 space-y-3 group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base">2. Expected Value ML Models</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates 4 distinct models: Random Forest, Gradient Boosting, Logistic Regression, and XGBoost with zero data leakage across 2022-2026.
              </p>
            </div>

            <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80 hover:border-amber-500/40 transition duration-300 space-y-3 group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base">3. Bayesian Reliability Score</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Harmonizes Expected Value Added, Baseline Elevation, match consistency, and Bayesian sigmoid shrinkage to prevent small-sample distortions.
              </p>
            </div>

          </div>

          <div className="text-center pt-2">
            <Link
              to="/methodology"
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-300 hover:text-rr-pink transition"
            >
              <span>Read Full Mathematical Formulation & Proofs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
