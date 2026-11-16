import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Trophy, Flame, Filter, Search, ArrowUpDown, ChevronLeft, ChevronRight, Award, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import PlayerAvatar from '../components/PlayerAvatar';

export default function RankingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('tab') || 'batting';

  const [activeTab, setActiveTab] = useState(initialCategory); // 'batting' or 'bowling'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [minBalls, setMinBalls] = useState(30); // 30 is default official qualification threshold
  const [sortBy, setSortBy] = useState('prs_score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [onlyEligible, setOnlyEligible] = useState(true);

  useEffect(() => {
    async function loadRankings() {
      try {
        setLoading(true);
        let res;
        const params = {
          page,
          limit: 15,
          search,
          minBalls: Number(minBalls),
          onlyEligible,
          sortBy,
          sortOrder
        };

        if (activeTab === 'batting') {
          res = await api.getBattingRankings(params);
        } else {
          res = await api.getBowlingRankings(params);
        }

        setData(res.data || []);
        setTotalPages(res.total_pages || 1);
        setTotalRecords(res.total || 0);
      } catch (err) {
        console.error('Failed to load rankings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRankings();
  }, [activeTab, page, search, minBalls, sortBy, sortOrder, onlyEligible]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearchParams({ tab });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-rr-pink text-xs font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-4 h-4" />
            <span>Complete Leaderboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white">
            Pressure Performance Rankings
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Ranked dynamically by the Pressure Reliability Score (PRS). Powered by Machine Learning Expected Value models trained on 200,999 deliveries.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => handleTabChange('batting')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'batting'
                ? 'bg-gradient-to-r from-rr-pink to-rr-pink-dark text-white shadow-lg shadow-rr-pink/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🏏 Batters Under Pressure</span>
          </button>
          <button
            onClick={() => handleTabChange('bowling')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'bowling'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🎯 Bowlers Under Pressure</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Filters, Search & Sort */}
      <div className="glass-card p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            placeholder={`Filter ${activeTab === 'batting' ? 'batters' : 'bowlers'} by name...`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-900/90 text-xs sm:text-sm text-white placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-rr-pink transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Min Balls Threshold */}
        <div className="flex items-center space-x-2 text-xs text-slate-300">
          <span className="text-slate-400">Min Crunch Balls:</span>
          <select
            value={minBalls}
            onChange={(e) => {
              setMinBalls(Number(e.target.value));
              setPage(1);
            }}
            className="bg-slate-900 text-xs text-white rounded-xl border border-slate-700 px-3 py-2 focus:outline-none focus:border-rr-pink"
          >
            <option value="0">All Deliveries (0+)</option>
            <option value="30">Official Threshold (30+ balls)</option>
            <option value="50">50+ Pressure Balls</option>
            <option value="100">100+ Pressure Balls</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center space-x-2 text-xs text-slate-300">
          <span className="text-slate-400">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 text-xs text-white rounded-xl border border-slate-700 px-3 py-2 focus:outline-none focus:border-rr-pink"
          >
            <option value="prs_score">Pressure Reliability Score (PRS)</option>
            {activeTab === 'batting' ? (
              <>
                <option value="pressure_runs">Pressure Runs</option>
                <option value="pressure_strike_rate">Pressure Strike Rate</option>
                <option value="runs_added_above_expected">Runs Added Above Expected</option>
                <option value="pressure_balls">Pressure Balls</option>
              </>
            ) : (
              <>
                <option value="pressure_wickets">Pressure Wickets</option>
                <option value="pressure_economy">Pressure Economy</option>
                <option value="bowler_value_added">Bowler Value Added</option>
                <option value="pressure_balls">Pressure Balls</option>
              </>
            )}
          </select>
        </div>

        {/* Eligible Toggle */}
        <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyEligible}
            onChange={(e) => {
              setOnlyEligible(e.target.checked);
              setPage(1);
            }}
            className="rounded border-slate-700 text-rr-pink focus:ring-0 w-4 h-4 bg-slate-900"
          />
          <span>Only Eligible (&ge; 30 balls)</span>
        </label>
      </div>

      {/* Leaderboard Table */}
      <div className="glass-card rounded-2xl overflow-hidden border-slate-800 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-800">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="py-4 px-4 text-center">Rank</th>
                <th className="py-4 px-4">Player</th>
                <th className="py-4 px-4 text-center">PRS Score</th>
                <th className="py-4 px-4 text-right">Pressure Performance</th>
                <th className="py-4 px-4 text-right">Normal Baseline</th>
                <th className="py-4 px-4 text-right">ML Expected vs Actual</th>
                <th className="py-4 px-4 text-center">Opportunities</th>
                <th className="py-4 px-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-rr-pink border-t-transparent rounded-full animate-spin" />
                      <span>Loading complete rankings from database...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((p) => {
                  const isTop3 = p.rank && p.rank <= 3;
                  const rankBadge =
                    p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : `#${p.rank || '-'}`;

                  return (
                    <tr
                      key={p.player_id}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      {/* Rank */}
                      <td className="py-4 px-4 text-center font-display font-black text-sm text-slate-300">
                        <span className={`inline-block ${isTop3 ? 'scale-125' : ''}`}>
                          {rankBadge}
                        </span>
                      </td>

                      {/* Player Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <PlayerAvatar name={p.player_name} imageUrl={p.image_url} size="md" />
                          <div className="truncate max-w-[180px] sm:max-w-[220px]">
                            <div className="font-bold text-white text-sm group-hover:text-rr-pink transition truncate">
                              {p.player_name}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {p.teams?.[0] || 'T20 Franchise'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* PRS Score */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`px-2.5 py-1 rounded-xl text-xs font-display font-black ${
                            activeTab === 'batting'
                              ? 'bg-rr-pink/15 text-rr-pink border border-rr-pink/30'
                              : 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                          }`}>
                            {p.prs_score}
                          </span>
                          <span className="text-[10px] text-slate-500 mt-0.5">/ 100</span>
                        </div>
                      </td>

                      {/* Pressure Performance */}
                      <td className="py-4 px-4 text-right font-mono">
                        {activeTab === 'batting' ? (
                          <div>
                            <span className="text-white font-bold">{p.pressure_runs} runs</span>
                            <span className="text-slate-400 text-[11px]"> ({p.pressure_balls}b)</span>
                            <div className="text-[11px] text-amber-400 font-semibold">{p.pressure_strike_rate} SR</div>
                          </div>
                        ) : (
                          <div>
                            <span className="text-white font-bold">{p.pressure_wickets} wkts</span>
                            <span className="text-slate-400 text-[11px]"> ({p.pressure_overs} ov)</span>
                            <div className="text-[11px] text-blue-400 font-semibold">{p.pressure_economy} Econ</div>
                          </div>
                        )}
                      </td>

                      {/* Normal Baseline */}
                      <td className="py-4 px-4 text-right font-mono">
                        {activeTab === 'batting' ? (
                          <div>
                            <span className="text-slate-300">{p.normal_strike_rate} SR</span>
                            <div className={`text-[11px] font-semibold ${
                              p.strike_rate_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {p.strike_rate_delta >= 0 ? `+${p.strike_rate_delta}` : p.strike_rate_delta} Δ
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="text-slate-300">{p.normal_economy} Econ</span>
                            <div className={`text-[11px] font-semibold ${
                              p.economy_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {p.economy_delta >= 0 ? `+${p.economy_delta}` : p.economy_delta} Δ
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Expected vs Actual */}
                      <td className="py-4 px-4 text-right font-mono">
                        {activeTab === 'batting' ? (
                          <div>
                            <div className={`text-xs font-bold ${
                              p.runs_added_above_expected >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {p.runs_added_above_expected >= 0 ? `+${p.runs_added_above_expected}` : p.runs_added_above_expected} RAAE
                            </div>
                            <span className="text-[10px] text-slate-500">Exp: {p.expected_pressure_runs}</span>
                          </div>
                        ) : (
                          <div>
                            <div className={`text-xs font-bold ${
                              p.bowler_value_added >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {p.bowler_value_added >= 0 ? `+${p.bowler_value_added}` : p.bowler_value_added} BVA
                            </div>
                            <span className="text-[10px] text-slate-500">Exp Wkts: {p.expected_pressure_wickets}</span>
                          </div>
                        )}
                      </td>

                      {/* Opportunities */}
                      <td className="py-4 px-4 text-center text-slate-400 font-mono text-[11px]">
                        <div>{p.pressure_matches} matches</div>
                        <div className="text-[10px] text-slate-500">{p.pressure_balls} balls</div>
                      </td>

                      {/* Action Button */}
                      <td className="py-4 px-4 text-center">
                        <Link
                          to={`/player/${p.player_id}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rr-pink text-slate-200 hover:text-white font-medium text-xs transition"
                        >
                          Analyse Stats
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No players matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing Page <span className="text-white font-bold">{page}</span> of{' '}
            <span className="text-white font-bold">{totalPages}</span> ({totalRecords} players)
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
