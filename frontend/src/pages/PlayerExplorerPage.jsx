import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Users, Filter, Trophy, ArrowRight, X, Sparkles, Target, Zap } from 'lucide-react';
import { api } from '../services/api';
import PlayerAvatar from '../components/PlayerAvatar';

export default function PlayerExplorerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [role, setRole] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function search() {
      try {
        setLoading(true);
        const res = await api.searchPlayers(query, role, 40);
        setResults(res);
      } catch (err) {
        console.error('Player search error:', err);
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(search, 200);
    return () => clearTimeout(timer);
  }, [query, role]);

  const roles = [
    { id: 'all', label: 'All Players', icon: Users },
    { id: 'batter', label: '🏏 Batters', icon: Zap },
    { id: 'bowler', label: '🎯 Bowlers', icon: Target },
    { id: 'all-rounder', label: '⚡ All-Rounders', icon: Sparkles }
  ];

  const quickSearches = [
    'Virat Kohli', 'Rohit Sharma', 'Jasprit Bumrah', 'Sanju Samson',
    'Sunil Narine', 'Rashid Khan', 'Heinrich Klaasen', 'Suryakumar Yadav'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10 overflow-x-hidden">
      
      {/* ── Page Header ── */}
      <div className="border-b border-slate-800 pb-6 space-y-2">
        <div className="inline-flex items-center space-x-2 text-rr-pink text-xs font-bold uppercase tracking-wider">
          <Users className="w-4 h-4" />
          <span>Player Pool Explorer</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
          Cricketer Intelligence & Profile Search
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Search across all 958 cricketers who participated in IPL and T20I matches from 2022 onwards. View genuine headshots, calculated global ranks, pressure reliability scores, and match-level evidence.
        </p>
      </div>

      {/* ── Search Bar & Filter Controls ── */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-4 border border-slate-800 shadow-xl bg-slate-900/80">
        
        {/* Input Field with Clear Button */}
        <div className="relative group">
          <input
            type="text"
            placeholder="Type player name (e.g., Sanju Samson, Jasprit Bumrah, Heinrich Klaasen, Rinku Singh)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchParams(e.target.value ? { q: e.target.value } : {});
            }}
            className="w-full bg-slate-950/90 text-sm sm:text-base text-white placeholder-slate-400 pl-11 pr-10 py-3.5 sm:py-4 rounded-2xl border border-slate-700/80 focus:outline-none focus:border-rr-pink focus:ring-2 focus:ring-rr-pink/30 shadow-inner transition duration-200"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 sm:top-4 group-focus-within:text-rr-pink transition-colors" />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSearchParams({});
              }}
              className="absolute right-3.5 top-3.5 sm:top-4 text-slate-400 hover:text-white transition"
              title="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Role Pills Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center">
              <Filter className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Role:
            </span>
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition duration-200 ${
                  role === r.id
                    ? 'bg-rr-pink text-white shadow-md shadow-rr-pink/25 border border-rr-pink'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Result Count */}
          <div className="text-xs text-slate-400 font-medium flex items-center space-x-2">
            <span>Showing <strong className="text-white">{results.length}</strong> cricketers</span>
            {loading && <span className="text-rr-pink text-[11px] font-bold animate-pulse">Filtering...</span>}
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        {!query && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
            <span className="text-slate-500 font-semibold mr-1">Popular:</span>
            {quickSearches.map((name) => (
              <button
                key={name}
                onClick={() => {
                  setQuery(name);
                  setSearchParams({ q: name });
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition border border-slate-800"
              >
                {name}
              </button>
            ))}
          </div>
        )}

      </div>

      {/* ── Player Cards Grid ── */}
      <div>
        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {results.map((p) => {
              const bestPrs = Math.max(p.batting_prs || 0, p.bowling_prs || 0);
              return (
                <div
                  key={p.player_id}
                  className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between border-slate-800 hover:border-rr-pink/50 transition duration-300 shadow-lg hover:shadow-xl hover:shadow-rr-pink/10 group space-y-4 bg-slate-900/60"
                >
                  {/* Top Bar: Player Photo + Name */}
                  <div className="flex items-start space-x-3.5 min-w-0">
                    <PlayerAvatar
                      name={p.player_name}
                      imageUrl={p.image_url}
                      role={p.role}
                      size="xl"
                      className="border-2 border-slate-700/80 group-hover:border-rr-pink transition shadow-md shrink-0"
                    />
                    <div className="min-w-0 flex-1 pt-0.5">
                      <Link
                        to={`/player/${p.player_id}`}
                        className="font-display font-bold text-base sm:text-lg text-white group-hover:text-rr-pink transition truncate block"
                      >
                        {p.player_name}
                      </Link>
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        {p.role} • {p.teams?.[0] || 'T20 Cricketer'}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        ID #{p.player_id}
                      </div>
                    </div>
                  </div>

                  {/* Dual Discipline Rankings & PRS Box */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">🏏 Batting</div>
                      {p.batting_prs ? (
                        <div className="mt-1">
                          <span className="font-display font-black text-rr-pink text-sm sm:text-base">
                            {p.batting_rank ? `#${p.batting_rank}` : 'Ranked'}
                          </span>
                          <div className="text-[10px] text-slate-400 font-mono font-bold">{p.batting_prs} PRS</div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-500 mt-1">No Pressure Data</div>
                      )}
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">🎯 Bowling</div>
                      {p.bowling_prs ? (
                        <div className="mt-1">
                          <span className="font-display font-black text-blue-400 text-sm sm:text-base">
                            {p.bowling_rank ? `#${p.bowling_rank}` : 'Ranked'}
                          </span>
                          <div className="text-[10px] text-slate-400 font-mono font-bold">{p.bowling_prs} PRS</div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-500 mt-1">No Pressure Data</div>
                      )}
                    </div>
                  </div>

                  {/* Action Link: Analyse Stats Button */}
                  <Link
                    to={`/player/${p.player_id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-gradient-to-r hover:from-rr-pink hover:to-rr-pink-dark text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition duration-200 shadow-md group-hover:shadow-rr-pink/20"
                  >
                    <span>Analyse Stats</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card p-12 sm:p-16 rounded-3xl text-center border-slate-800 space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-display font-bold text-white">No cricketers found matching "{query}"</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Check the spelling, or switch the role filter to "All Players" to search the full historical dataset of 958 cricketers.
            </p>
            <button
              onClick={() => {
                setQuery('');
                setRole('all');
                setSearchParams({});
              }}
              className="px-4 py-2 rounded-xl bg-rr-pink text-white font-bold text-xs hover:bg-rr-pink-light transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
