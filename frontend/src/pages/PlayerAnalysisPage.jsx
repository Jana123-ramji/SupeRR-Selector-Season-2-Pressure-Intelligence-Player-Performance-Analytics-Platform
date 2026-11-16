import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Trophy,
  Flame,
  ArrowLeft,
  Calendar,
  Target,
  Zap,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  BarChart3,
  TrendingUp,
  Activity,
  Award,
  ChevronRight,
  Filter
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { api } from '../services/api';
import PlayerAvatar from '../components/PlayerAvatar';

export default function PlayerAnalysisPage() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('batting'); // 'batting' or 'bowling'
  const [evidenceFilter, setEvidenceFilter] = useState('');

  useEffect(() => {
    async function loadPlayer() {
      try {
        setLoading(true);
        const data = await api.getPlayerProfile(id);
        setPlayer(data);
        if (!data.batting?.pressure_balls && data.bowling?.pressure_balls) {
          setActiveTab('bowling');
        } else {
          setActiveTab('batting');
        }
      } catch (err) {
        console.error('Failed to load player:', err);
        setError(err.message || 'Player not found');
      } finally {
        setLoading(false);
      }
    }
    loadPlayer();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-rr-pink border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-300 font-semibold text-sm">Loading player intelligence profile...</p>
        <p className="text-slate-500 text-xs">Querying historical ball-by-ball records & models</p>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-display font-black text-white">Player Record Not Found</h2>
        <p className="text-sm text-slate-400">{error || 'Unable to retrieve statistics for this player.'}</p>
        <Link
          to="/explorer"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rr-pink text-white font-bold text-xs shadow-lg shadow-rr-pink/30 hover:bg-rr-pink-light transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Player Explorer</span>
        </Link>
      </div>
    );
  }

  const bat = player.batting;
  const bowl = player.bowling;
  const currentDiscipline = activeTab === 'batting' ? bat : bowl;

  // Comparison Data
  const comparisonData = activeTab === 'batting' && bat ? [
    { metric: 'Strike Rate', Normal: bat.normal_strike_rate, Pressure: bat.pressure_strike_rate },
  ] : activeTab === 'bowling' && bowl ? [
    { metric: 'Economy Rate', Normal: bowl.normal_economy, Pressure: bowl.pressure_economy },
  ] : [];

  // Stage Breakdown Chart Data
  const stagesData = currentDiscipline?.stage_breakdown ? [
    {
      stage: 'Powerplay (1-6)',
      balls: activeTab === 'batting' ? currentDiscipline.stage_breakdown.powerplay.balls : currentDiscipline.stage_breakdown.powerplay.overs,
      performance: activeTab === 'batting' ? currentDiscipline.stage_breakdown.powerplay.sr : currentDiscipline.stage_breakdown.powerplay.econ
    },
    {
      stage: 'Middle (7-15)',
      balls: activeTab === 'batting' ? currentDiscipline.stage_breakdown.middle.balls : currentDiscipline.stage_breakdown.middle.overs,
      performance: activeTab === 'batting' ? currentDiscipline.stage_breakdown.middle.sr : currentDiscipline.stage_breakdown.middle.econ
    },
    {
      stage: 'Death (16-20)',
      balls: activeTab === 'batting' ? currentDiscipline.stage_breakdown.death.balls : currentDiscipline.stage_breakdown.death.overs,
      performance: activeTab === 'batting' ? currentDiscipline.stage_breakdown.death.sr : currentDiscipline.stage_breakdown.death.econ
    }
  ] : [];

  // Filtered evidence
  const allEvidence = player.evidence || [];
  const disciplineEvidence = allEvidence.filter((ev) => ev.type.toLowerCase() === activeTab);
  const filteredEvidence = evidenceFilter
    ? disciplineEvidence.filter((ev) =>
        ev.competition?.toLowerCase().includes(evidenceFilter.toLowerCase()) ||
        ev.opponent?.toLowerCase().includes(evidenceFilter.toLowerCase()) ||
        ev.situation?.toLowerCase().includes(evidenceFilter.toLowerCase())
      )
    : disciplineEvidence;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 sm:space-y-12 overflow-x-hidden">
      
      {/* ── Breadcrumbs ── */}
      <nav className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
        <Link to="/" className="hover:text-white transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <Link to="/rankings" className="hover:text-white transition">Rankings</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <Link to="/explorer" className="hover:text-white transition">Players</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-white font-bold">{player.player_name}</span>
      </nav>

      {/* ── 1. Hero Showcase Card ── */}
      <section className="glass-card p-6 sm:p-10 rounded-3xl border-slate-800/80 relative overflow-hidden bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-slate-950 shadow-2xl">
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-rr-pink/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-600/10 blur-[100px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 relative z-10">
          
          {/* Player Portrait & Main Identity */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-5 sm:space-y-0 sm:space-x-7 text-center sm:text-left w-full lg:w-auto">
            
            <div className="relative shrink-0 group">
              <PlayerAvatar
                name={player.player_name}
                imageUrl={player.image_url}
                role={player.role}
                size="2xl"
                className="border-2 border-slate-700/80 group-hover:border-rr-pink/80 shadow-2xl shadow-rr-pink/20 transition duration-300"
              />
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-950 border border-slate-700 text-[10px] font-extrabold text-rr-pink uppercase tracking-widest shadow-md whitespace-nowrap">
                {player.role || 'Cricketer'}
              </div>
            </div>

            <div className="space-y-3 min-w-0">
              {/* Teams & Tournaments Pills */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                {player.teams?.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-bold px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Player Name */}
              <h1 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
                {player.player_name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-400">
                Official Player Profile • ID #{player.player_id} • 883 Matches Analysed (2022–2026)
              </p>

              {/* Global Discipline Ranking Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                {bat && (
                  <div className="px-3.5 py-1.5 rounded-xl bg-rr-pink/15 border border-rr-pink/30 text-rr-pink text-xs font-extrabold flex items-center space-x-1.5 shadow-sm">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Batting Rank: {bat.rank ? `#${bat.rank}` : 'Unranked'}</span>
                  </div>
                )}
                {bowl && (
                  <div className="px-3.5 py-1.5 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 text-xs font-extrabold flex items-center space-x-1.5 shadow-sm">
                    <Target className="w-3.5 h-3.5" />
                    <span>Bowling Rank: {bowl.rank ? `#${bowl.rank}` : 'Unranked'}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Discipline Switcher + Pressure Reliability Score Card */}
          <div className="flex flex-col items-center lg:items-end space-y-4 shrink-0 w-full lg:w-auto">
            
            {/* Discipline Selector Tabs */}
            <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-full sm:w-auto justify-center shadow-lg">
              {bat && (
                <button
                  onClick={() => setActiveTab('batting')}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 ${
                    activeTab === 'batting'
                      ? 'bg-gradient-to-r from-rr-pink to-rr-pink-dark text-white shadow-lg shadow-rr-pink/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🏏 Batting Stats</span>
                  {bat.rank && (
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md font-mono">
                      #{bat.rank}
                    </span>
                  )}
                </button>
              )}
              {bowl && (
                <button
                  onClick={() => setActiveTab('bowling')}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 ${
                    activeTab === 'bowling'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🎯 Bowling Stats</span>
                  {bowl.rank && (
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md font-mono">
                      #{bowl.rank}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Pressure Reliability Gauge Card */}
            {currentDiscipline && (
              <div className="glass-card px-8 py-5 rounded-2xl text-center border-slate-700/80 shadow-2xl bg-slate-950/80 w-full sm:w-auto">
                <div className="text-[11px] text-slate-400 font-extrabold uppercase tracking-widest">
                  Pressure Reliability Score
                </div>
                <div className="text-4xl sm:text-5xl font-display font-black text-white mt-1">
                  <span className={activeTab === 'batting' ? 'text-rr-pink' : 'text-blue-400'}>
                    {currentDiscipline.prs_score}
                  </span>
                  <span className="text-sm text-slate-500 font-mono font-normal"> / 100</span>
                </div>
                <div className="text-xs font-bold text-emerald-400 mt-1.5 flex items-center justify-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {currentDiscipline.rank
                      ? `Global Rank #${currentDiscipline.rank} of all ${activeTab === 'batting' ? 'Batters' : 'Bowlers'}`
                      : 'Unranked'}
                  </span>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Insufficient Evidence Warning Banner */}
        {currentDiscipline && !currentDiscipline.eligible && (
          <div className="mt-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center space-x-3 text-amber-300 text-xs">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold">Insufficient Evidence: </span>
              {currentDiscipline.evidence_status}. The official hackathon qualification threshold requires at least 30 high-pressure deliveries.
            </div>
          </div>
        )}
      </section>


      {/* ── 2. Pressure Performance vs Normal Situation Metrics ── */}
      {currentDiscipline && (
        <section className="space-y-5">
          <div className="flex items-center space-x-3">
            <PlayerAvatar name={player.player_name} imageUrl={player.image_url} size="sm" />
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white flex items-center space-x-2">
                <Zap className="w-5 h-5 text-rr-pink" />
                <span>Performance Breakdown: Pressure vs Normal Baseline</span>
              </h2>
              <p className="text-xs text-slate-400">
                Detailed comparison of performance metrics under high pressure (Pressure Index ≥ 70) versus standard baseline play
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {activeTab === 'batting' ? (
              <>
                <div className="glass-card p-4 rounded-2xl border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-semibold">Pressure Strike Rate</div>
                  <div className="text-2xl font-display font-black text-white mt-1">
                    {bat.pressure_strike_rate}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Normal SR: {bat.normal_strike_rate}</div>
                </div>

                <div className="glass-card p-4 rounded-2xl border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-semibold">Strike Rate Delta</div>
                  <div className={`text-2xl font-display font-black mt-1 ${
                    bat.strike_rate_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {bat.strike_rate_delta >= 0 ? `+${bat.strike_rate_delta}` : bat.strike_rate_delta}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Elevation under pressure</div>
                </div>

                <div className="glass-card p-4 rounded-2xl border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-semibold">Pressure Runs</div>
                  <div className="text-2xl font-display font-black text-white mt-1">
                    {bat.pressure_runs}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Off {bat.pressure_balls} crunch balls</div>
                </div>

                <div className="glass-card p-4 rounded-2xl border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-semibold">ML Value Added (RAAE)</div>
                  <div className={`text-2xl font-display font-black mt-1 ${
                    bat.runs_added_above_expected >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {bat.runs_added_above_expected >= 0 ? `+${bat.runs_added_above_expected}` : bat.runs_added_above_expected}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Exp Runs: {bat.expected_pressure_runs}</div>
                </div>

                <div className="glass-card p-4 rounded-2xl border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-semibold">Crunch Boundaries</div>
                  <div className="text-2xl font-display font-black text-amber-400 mt-1">
                    {bat.pressure_fours + bat.pressure_sixes}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{bat.pressure_fours} Fours • {bat.pressure_sixes} Sixes</div>
                </div>

                <div className="glass-card p-4 rounded-2xl border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-semibold">Match Consistency</div>
                  <div className="text-2xl font-display font-black text-blue-400 mt-1">
                    {bat.consistency_pct}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Positive outcome match rate</div>
                </div>
              </>
            ) : (
              <>
                <div className="glass-card p-4 rounded-2xl border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-semibold">Pressure Economy</div>
                  <div className="text-2xl font-display font-black text-white mt-1">
                    {bowl.pressure_economy}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Normal Econ: {bowl.normal_economy}</div>
                </div>

                <div className="glass-card p-4 rounded-2xl border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-semibold">Economy Delta</div>
                  <div className={`text-2xl font-display font-black mt-1 ${
                    bowl.economy_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {bowl.economy_delta >= 0 ? `+${bowl.economy_delta}` : bowl.economy_delta}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Tighter under pressure</div>
                </div>

                <div className="glass-card p-4 rounded-2xl border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-semibold">Pressure Wickets</div>
                  <div className="text-2xl font-display font-black text-white mt-1">
                    {bowl.pressure_wickets}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Across {bowl.pressure_overs} overs</div>
                </div>

                <div className="glass-card p-4 rounded-2xl border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-semibold">Bowler Value Added</div>
                  <div className={`text-2xl font-display font-black mt-1 ${
                    bowl.bowler_value_added >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {bowl.bowler_value_added >= 0 ? `+${bowl.bowler_value_added}` : bowl.bowler_value_added}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Runs saved + Wkts value</div>
                </div>

                <div className="glass-card p-4 rounded-2xl border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-semibold">Pressure Dot Ball %</div>
                  <div className="text-2xl font-display font-black text-blue-400 mt-1">
                    {bowl.pressure_dot_pct}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{bowl.pressure_dot_balls} dot balls</div>
                </div>

                <div className="glass-card p-4 rounded-2xl border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-semibold">Match Consistency</div>
                  <div className="text-2xl font-display font-black text-emerald-400 mt-1">
                    {bowl.consistency_pct}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Positive defense matches</div>
                </div>
              </>
            )}
          </div>
        </section>
      )}


      {/* ── 3. Visual Analytics Charts ── */}
      {currentDiscipline && (
        <section className="space-y-5">
          <div className="flex items-center space-x-2 text-rr-pink text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Interactive Visual Analytics</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Innings Stage Breakdown Chart */}
            <div className="glass-card p-6 sm:p-7 rounded-3xl border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-white">
                    Innings Stage Performance under Pressure
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeTab === 'batting'
                      ? 'Strike Rate across Powerplay (1-6), Middle (7-15), and Death (16-20) overs'
                      : 'Economy Rate across Powerplay, Middle, and Death overs'}
                  </p>
                </div>
                <PlayerAvatar name={player.player_name} imageUrl={player.image_url} size="xs" />
              </div>

              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stagesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="stage" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0B132B', borderColor: '#334155', borderRadius: '12px' }}
                      labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                    />
                    <Bar
                      dataKey="performance"
                      name={activeTab === 'batting' ? 'Strike Rate' : 'Economy Rate'}
                      fill={activeTab === 'batting' ? '#E40066' : '#2563EB'}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Baseline Elevation Delta Comparison */}
            <div className="glass-card p-6 sm:p-7 rounded-3xl border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-white">
                    Baseline Elevation Analysis
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Comparing normal play performance against high-pressure situation outcomes
                  </p>
                </div>
                <PlayerAvatar name={player.player_name} imageUrl={player.image_url} size="xs" />
              </div>

              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="metric" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0B132B', borderColor: '#334155', borderRadius: '12px' }}
                      labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="Normal" fill="#64748B" radius={[8, 8, 0, 0]} />
                    <Bar
                      dataKey="Pressure"
                      fill={activeTab === 'batting' ? '#E40066' : '#F59E0B'}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </section>
      )}


      {/* ── 4. Traceable Match Evidence Log Table ── */}
      {currentDiscipline && (
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <PlayerAvatar name={player.player_name} imageUrl={player.image_url} size="sm" />
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-white flex items-center space-x-2">
                  <Target className="w-5 h-5 text-amber-400" />
                  <span>Traceable Match Evidence Log</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Delivery-level evidence and match situations extracted from historical records supporting this player's rating
                </p>
              </div>
            </div>

            {/* Table Search Filter */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Filter tournament or opponent..."
                value={evidenceFilter}
                onChange={(e) => setEvidenceFilter(e.target.value)}
                className="w-full bg-slate-900 text-xs text-white placeholder-slate-400 pl-8 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-rr-pink"
              />
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-800">
                <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Player</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Tournament</th>
                    <th className="py-3.5 px-4">Opponent</th>
                    <th className="py-3.5 px-4">Match Situation</th>
                    <th className="py-3.5 px-4 text-right">Actual Outcome</th>
                    <th className="py-3.5 px-4 text-right">Model Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredEvidence.length > 0 ? (
                    filteredEvidence.map((ev, i) => (
                      <tr key={i} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <PlayerAvatar name={player.player_name} imageUrl={player.image_url} size="xs" />
                            <span className="font-sans font-bold text-white text-xs">{player.player_name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">{ev.date}</td>
                        <td className="py-3 px-4 text-white font-sans text-xs">{ev.competition}</td>
                        <td className="py-3 px-4 text-slate-300 font-sans text-xs">{ev.opponent}</td>
                        <td className="py-3 px-4 text-slate-400 font-sans text-xs">{ev.situation}</td>
                        <td className="py-3 px-4 text-right text-white font-bold">{ev.performance}</td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ev.is_positive
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {ev.impact}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        No match evidence records found matching your filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
