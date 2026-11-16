import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Zap, ShieldCheck, Activity, Award, CheckCircle2, Flame, Layers } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { api } from '../services/api';

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await api.getAnalytics();
        setData(res);
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-rr-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Loading comprehensive cricket analytics & ML validation metrics...</p>
      </div>
    );
  }

  const { summary, over_trends, format_comparison, model_evaluation } = data;

  // Pressure distribution data
  const pressureDistData = [
    { name: 'Normal Situations (< 45)', value: summary.pressure_distribution.Normal, color: '#64748B' },
    { name: 'Moderate Pressure (45-69)', value: summary.pressure_distribution.Moderate, color: '#3B82F6' },
    { name: 'High Pressure (70-100)', value: summary.pressure_distribution.High, color: '#E40066' },
  ];

  // IPL vs T20I comparison chart data
  const iplT20Data = [
    { metric: 'Avg Score', IPL: format_comparison.IPL.avg_score, T20I: format_comparison.T20I.avg_score },
    { metric: 'Run Rate', IPL: format_comparison.IPL.run_rate, T20I: format_comparison.T20I.run_rate },
    { metric: 'Boundary %', IPL: format_comparison.IPL.boundary_pct, T20I: format_comparison.T20I.boundary_pct },
    { metric: 'Pressure %', IPL: format_comparison.IPL.pressure_pct, T20I: format_comparison.T20I.pressure_pct },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center space-x-2 text-rr-pink text-xs font-bold uppercase tracking-wider mb-2">
          <BarChart3 className="w-4 h-4" />
          <span>Global Intelligence Overview</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-white">
          Cricket Analytics & Model Evaluation Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          Complete macro-level performance patterns, chronological machine learning validation metrics, and format comparisons across 200,999 deliveries.
        </p>
      </div>

      {/* Top Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Matches Analysed</div>
          <div className="text-3xl font-display font-black text-white mt-1">
            {summary.total_matches.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{summary.ipl_matches} IPL • {summary.t20i_matches} T20I</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Deliveries</div>
          <div className="text-3xl font-display font-black text-rr-pink mt-1">
            {summary.total_deliveries.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">2022 to 2026 Seasons</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Pressure Deliveries</div>
          <div className="text-3xl font-display font-black text-amber-400 mt-1">
            {summary.total_pressure_deliveries.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{summary.pressure_percentage}% of total play</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Eligible Player Pool</div>
          <div className="text-3xl font-display font-black text-blue-400 mt-1">
            {summary.total_players}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{summary.eligible_batters} Batters • {summary.eligible_bowlers} Bowlers</div>
        </div>
      </div>

      {/* Row 1: Over-by-Over Trends & Pressure Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Over by over run rate and pressure % */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Over-by-Over Run Rate & Pressure Spike Analysis
              </h3>
              <p className="text-xs text-slate-400">
                Tracking average run rate (RPO) and pressure delivery density across overs 1 to 20
              </p>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rr-pink/20 text-rr-pink">
              20 Overs Dynamic
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={over_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E40066" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#E40066" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="over" stroke="#64748B" fontSize={11} label={{ value: 'Over Number', position: 'insideBottomRight', offset: -5 }} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="run_rate" name="Run Rate (RPO)" stroke="#2563EB" fillOpacity={1} fill="url(#colorRR)" />
                <Area type="monotone" dataKey="pressure_pct" name="Pressure Ball %" stroke="#E40066" fillOpacity={1} fill="url(#colorPressure)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pressure Distribution Donut */}
        <div className="glass-card p-6 rounded-3xl border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-white">
              Pressure Level Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Categorization across all 200,999 match deliveries
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pressureDistData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pressureDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#334155', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-xs">
            {pressureDistData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="truncate max-w-[170px]">{d.name}</span>
                </div>
                <span className="font-mono font-bold text-white">{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 2: Format Comparison & ML Evaluation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* IPL vs T20I Head-to-Head */}
        <div className="glass-card p-6 rounded-3xl border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-white">
                IPL vs T20 International Comparison
              </h3>
              <p className="text-xs text-slate-400">
                Macro metrics across 401 IPL matches and 482 T20I matches
              </p>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
              Format Parity
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rr-pink">IPL (T20 League)</span>
                <span className="text-xs font-mono text-slate-400">{format_comparison.IPL.matches} Matches</span>
              </div>
              <div className="text-2xl font-display font-black text-white">{format_comparison.IPL.avg_score}</div>
              <div className="text-[11px] text-slate-400">Average Team Innings Score</div>
              <div className="pt-2 border-t border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Run Rate:</span>
                  <span className="font-mono font-bold text-white">{format_comparison.IPL.run_rate} RPO</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Boundary Rate:</span>
                  <span className="font-mono font-bold text-amber-400">{format_comparison.IPL.boundary_pct}%</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400">T20 Internationals</span>
                <span className="text-xs font-mono text-slate-400">{format_comparison.T20I.matches} Matches</span>
              </div>
              <div className="text-2xl font-display font-black text-white">{format_comparison.T20I.avg_score}</div>
              <div className="text-[11px] text-slate-400">Average Team Innings Score</div>
              <div className="pt-2 border-t border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Run Rate:</span>
                  <span className="font-mono font-bold text-white">{format_comparison.T20I.run_rate} RPO</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Boundary Rate:</span>
                  <span className="font-mono font-bold text-amber-400">{format_comparison.T20I.boundary_pct}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Machine Learning Validation & Metrics */}
        <div className="glass-card p-6 rounded-3xl border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-white flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>ML Model Validation Report</span>
              </h3>
              <p className="text-xs text-slate-400">
                Rigorous chronological train/test split: Train ({model_evaluation.train_period}) • Test ({model_evaluation.test_period})
              </p>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              0% Leakage
            </span>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            {/* Batting Model Metrics */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Batting Expected Runs Regressor</span>
                <span className="text-[10px] text-rr-pink font-mono">Gradient Boosting</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <div className="text-slate-400 text-[10px]">Test MAE</div>
                  <div className="font-mono font-bold text-white mt-0.5">{model_evaluation.batting_model.test_mae}</div>
                </div>
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <div className="text-slate-400 text-[10px]">Test RMSE</div>
                  <div className="font-mono font-bold text-white mt-0.5">{model_evaluation.batting_model.test_rmse}</div>
                </div>
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <div className="text-slate-400 text-[10px]">Deliveries</div>
                  <div className="font-mono font-bold text-emerald-400 mt-0.5">{model_evaluation.test_deliveries.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Bowling Model Metrics */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Bowling Runs & Wickets Classifier</span>
                <span className="text-[10px] text-blue-400 font-mono">Dual Pipeline</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <div className="text-slate-400 text-[10px]">Runs MAE</div>
                  <div className="font-mono font-bold text-white mt-0.5">{model_evaluation.bowling_model.test_runs_mae}</div>
                </div>
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <div className="text-slate-400 text-[10px]">Wicket AUC</div>
                  <div className="font-mono font-bold text-blue-400 mt-0.5">{model_evaluation.bowling_model.test_wicket_auc}</div>
                </div>
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <div className="text-slate-400 text-[10px]">Wicket Weight</div>
                  <div className="font-mono font-bold text-amber-400 mt-0.5">+4.5 Runs</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
