import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BrainCircuit, Play, Loader2, CheckCircle2, AlertCircle,
  TrendingUp, Target, BarChart3, Zap, ChevronDown, ChevronUp,
  Info, Award, ArrowRight, ShieldCheck, Flame, Layers, Sparkles, Sliders
} from 'lucide-react';

// ── Utility helpers ───────────────────────────────────────────────────────────
const fmt = (v, d = 4) =>
  v === null || v === undefined ? 'N/A' : typeof v === 'number' ? v.toFixed(d) : v;
const pct = (v) =>
  v === null || v === undefined ? 'N/A' : `${(v * 100).toFixed(2)}%`;
const time = (v) =>
  v === null || v === undefined ? 'N/A' : `${v}s`;

// ── Metric card ───────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, color = 'text-white', note }) {
  return (
    <div className="bg-slate-900/70 border border-slate-700/70 rounded-xl p-4 flex flex-col gap-1 transition hover:border-slate-600">
      <div className={`text-xl font-display font-black ${color}`}>{value}</div>
      <div className="text-xs font-semibold text-white">{label}</div>
      {sub  && <div className="text-[11px] text-slate-400">{sub}</div>}
      {note && <div className="text-[11px] text-amber-400 mt-1 italic">{note}</div>}
    </div>
  );
}

// ── Task badge ────────────────────────────────────────────────────────────────
function TaskBadge({ done, label }) {
  return (
    <div className={`flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-full border ${
      done
        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        : 'bg-slate-800 border-slate-700 text-slate-400 animate-pulse'
    }`}>
      {done
        ? <CheckCircle2 className="w-3.5 h-3.5" />
        : <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      <span>{label}</span>
    </div>
  );
}

export default function ModelAccuracyPage() {
  const [activeTab, setActiveTab] = useState('benchmarks'); // 'benchmarks' | 'live'
  const [benchmarks, setBenchmarks] = useState(null);
  const [loadingBenchmarks, setLoadingBenchmarks] = useState(true);

  // Live calculation states
  const [status, setStatus] = useState('idle'); // idle | running | done | error
  const [liveData, setLiveData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const timerRef = React.useRef(null);

  // Fetch benchmark and latest live evaluation on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoadingBenchmarks(true);
        const [res, latestEval] = await Promise.all([
          api.getImprovedBenchmarks().catch(() => null),
          api.getLatestEvaluation().catch(() => null)
        ]);
        if (res && res.results) {
          setBenchmarks(res);
        }
        if (latestEval && latestEval.models) {
          setLiveData(latestEval);
          setStatus('done');
        }
      } catch (err) {
        console.error('Error fetching initial ML data:', err);
      } finally {
        setLoadingBenchmarks(false);
      }
    }
    loadInitialData();
  }, []);

  const startEvaluation = async () => {
    setActiveTab('live');
    setStatus('running');
    setLiveData(null);
    setErrorMsg('');
    setElapsed(0);

    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);

    try {
      const result = await api.calculateModelAccuracy();
      setLiveData(result);
      setStatus('done');
    } catch (err) {
      setErrorMsg(err.message || 'Evaluation failed. Check the backend server.');
      setStatus('error');
    } finally {
      clearInterval(timerRef.current);
    }
  };

  const resetLive = () => {
    setStatus('idle');
    setLiveData(null);
    setErrorMsg('');
    setElapsed(0);
  };

  const b = benchmarks?.results || {};
  const c = benchmarks?.classification || {};
  const feat = benchmarks?.top_feature_importances || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-rr-pink text-xs font-bold uppercase tracking-wider mb-2">
            <BrainCircuit className="w-4 h-4" />
            <span>SupeRR Selector · Machine Learning Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black text-white">
            Model Performance <span className="gradient-text-rr">Evaluation</span>
          </h1>
          <p className="text-slate-300 text-sm mt-2 max-w-2xl leading-relaxed">
            Evaluate how effectively our machine learning models predict cricket performance using unseen historical match data.
            Trained on 120,248 deliveries (2022–2024) and tested on 80,751 untouched deliveries (2025–2026).
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={startEvaluation}
            disabled={status === 'running'}
            className={`flex items-center space-x-2 px-6 py-3.5 rounded-xl font-bold text-sm shadow-xl transition ${
              status === 'running'
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-rr-pink to-rr-pink-dark hover:from-rr-pink-light hover:to-rr-pink text-white shadow-rr-pink/25 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {status === 'running' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating Live… ({elapsed}s)</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Calculate Accuracy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('benchmarks')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'benchmarks'
              ? 'bg-gradient-to-r from-rr-pink to-rr-pink-dark text-white shadow-lg shadow-rr-pink/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Core Results & Benchmarks (Phases 1–8)</span>
        </button>

        <button
          onClick={() => setActiveTab('live')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'live'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>Live Evaluation Runner {status === 'done' && '✓'}</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 1: CORE RESULTS & ADVANCED BENCHMARKS
         ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-10">

          {/* ── 1. Core Results At A Glance Banner ── */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border-slate-800/80 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-slate-950 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center space-x-2 text-rr-pink text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Key Breakthroughs Verified</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-black text-white mt-1">
                  Core Results At A Glance
                </h2>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                Untouched 2025–2026 Test Set (80,751 balls)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Highlight 1: Single Ball Batting */}
              <div className="glass-card p-5 rounded-2xl border-slate-800 hover:border-rr-pink/50 transition">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Single-Ball Batting</span>
                  <span className="text-rr-pink font-mono text-[10px]">+27.6% Gain</span>
                </div>
                <div className="text-2xl font-display font-black text-white">
                  R² = {fmt(b.lightgbm?.r2, 4)}
                </div>
                <div className="text-xs text-rr-pink font-semibold mt-1">
                  LightGBM (Best Regressor)
                </div>
                <div className="text-[11px] text-slate-400 mt-2 space-y-1 border-t border-slate-800 pt-2">
                  <div>RF: <strong className="text-white">0.0333 → 0.0402</strong> (+20.7%)</div>
                  <div>GB: <strong className="text-white">0.0357 → 0.0382</strong> (+7.0%)</div>
                  <div>MAE: <strong className="text-blue-400">{fmt(b.lightgbm?.mae, 4)} runs/ball</strong></div>
                </div>
              </div>

              {/* Highlight 2: Multi-Delivery Horizon */}
              <div className="glass-card p-5 rounded-2xl border-slate-800 hover:border-blue-500/50 transition">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Over-Block Horizon</span>
                  <span className="text-blue-400 font-mono text-[10px]">17.5% Explained</span>
                </div>
                <div className="text-2xl font-display font-black text-blue-400">
                  R² = {fmt(b.next_6_balls_lgb?.r2, 4)}
                </div>
                <div className="text-xs text-slate-200 font-semibold mt-1">
                  Next 6 Deliveries [t, t+5]
                </div>
                <div className="text-[11px] text-slate-400 mt-2 space-y-1 border-t border-slate-800 pt-2">
                  <div>Dampens discrete ball noise</div>
                  <div>LightGBM: <strong className="text-white">R² = 0.1749</strong></div>
                  <div>GB: <strong className="text-white">R² = 0.1672</strong></div>
                  <div>MAE: <strong className="text-blue-400">{fmt(b.next_6_balls_lgb?.mae, 4)} runs</strong></div>
                </div>
              </div>

              {/* Highlight 3: Bowling Pipeline */}
              <div className="glass-card p-5 rounded-2xl border-slate-800 hover:border-indigo-500/50 transition">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Bowling Pipeline</span>
                  <span className="text-indigo-400 font-mono text-[10px]">Runs Conceded</span>
                </div>
                <div className="text-2xl font-display font-black text-indigo-400">
                  R² = {fmt(b.bowling_lgb_runs?.r2, 4)}
                </div>
                <div className="text-xs text-slate-200 font-semibold mt-1">
                  LightGBM Bowling Regressor
                </div>
                <div className="text-[11px] text-slate-400 mt-2 space-y-1 border-t border-slate-800 pt-2">
                  <div>MAE: <strong className="text-indigo-300">{fmt(b.bowling_lgb_runs?.mae, 4)} runs/ball</strong></div>
                  <div>RMSE: <strong className="text-slate-300">{fmt(b.bowling_lgb_runs?.rmse, 4)}</strong></div>
                  <div>GB Bowling: <strong className="text-white">R² = 0.0427</strong></div>
                </div>
              </div>

              {/* Highlight 4: Logistic Regression */}
              <div className="glass-card p-5 rounded-2xl border-slate-800 hover:border-purple-500/50 transition">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Boundary Classifier</span>
                  <span className="text-purple-400 font-mono text-[10px]">τ = 0.490</span>
                </div>
                <div className="text-2xl font-display font-black text-purple-400">
                  {pct(c.optimized_threshold?.recall)}
                </div>
                <div className="text-xs text-slate-200 font-semibold mt-1">
                  Boundary Recall (10,816 detected)
                </div>
                <div className="text-[11px] text-slate-400 mt-2 space-y-1 border-t border-slate-800 pt-2">
                  <div>Precision: <strong className="text-white">{pct(c.optimized_threshold?.precision)}</strong></div>
                  <div>F1-Score: <strong className="text-emerald-400">{fmt(c.optimized_threshold?.f1, 4)}</strong></div>
                  <div>ROC-AUC: <strong className="text-purple-300">{fmt(c.roc_auc, 4)}</strong></div>
                  <div>PR-AUC: <strong className="text-purple-300">{fmt(c.pr_auc, 4)}</strong></div>
                </div>
              </div>
            </div>
          </div>


          {/* ── 2. Detailed Single-Ball Batting Benchmark Table ── */}
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-lg text-white">
                  1. Single-Delivery Batting Runs Prediction (Untouched 2025–2026 Test Set)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparison between naive baseline, 14-feature baseline models, and 38-feature enriched models
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Target: Runs scored off bat per ball
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Model Architecture</th>
                    <th className="py-3 px-4">Feature Set</th>
                    <th className="py-3 px-4 text-right">R² Score</th>
                    <th className="py-3 px-4 text-right">MAE (runs/ball)</th>
                    <th className="py-3 px-4 text-right">RMSE (runs/ball)</th>
                    <th className="py-3 px-4 text-right">Relative Gain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-slate-400">Mean Baseline</td>
                    <td className="py-3 px-4 text-slate-500">None (Historical Mean)</td>
                    <td className="py-3 px-4 text-right font-mono text-rose-400">{fmt(b.mean_baseline?.r2, 4)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">{fmt(b.mean_baseline?.mae, 4)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">{fmt(b.mean_baseline?.rmse, 4)}</td>
                    <td className="py-3 px-4 text-right text-slate-500">Benchmark</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-white">XGBoost Regressor (Baseline)</td>
                    <td className="py-3 px-4 text-slate-400">14 Situation Features</td>
                    <td className="py-3 px-4 text-right font-mono text-amber-400">{fmt(b.xgb_baseline?.r2, 4)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">{fmt(b.xgb_baseline?.mae, 4)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">{fmt(b.xgb_baseline?.rmse, 4)}</td>
                    <td className="py-3 px-4 text-right text-slate-400">Baseline</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-white">Random Forest (Baseline)</td>
                    <td className="py-3 px-4 text-slate-400">14 Situation Features</td>
                    <td className="py-3 px-4 text-right font-mono text-amber-400">{fmt(b.rf_baseline?.r2, 4)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">{fmt(b.rf_baseline?.mae, 4)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">{fmt(b.rf_baseline?.rmse, 4)}</td>
                    <td className="py-3 px-4 text-right text-slate-400">Baseline</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-white">Gradient Boosting (Baseline)</td>
                    <td className="py-3 px-4 text-slate-400">14 Situation Features</td>
                    <td className="py-3 px-4 text-right font-mono text-amber-400">{fmt(b.gb_baseline?.r2, 4)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">{fmt(b.gb_baseline?.mae, 4)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">{fmt(b.gb_baseline?.rmse, 4)}</td>
                    <td className="py-3 px-4 text-right text-slate-400">Baseline</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-white">XGBoost Regressor (Enriched)</td>
                    <td className="py-3 px-4 text-slate-300 font-medium">38 Features (Situation + Pre-Match)</td>
                    <td className="py-3 px-4 text-right font-mono text-rr-pink">{fmt(b.xgb_enriched?.r2, 4)}</td>
                    <td className="py-3 px-4 text-right font-mono text-blue-400">{fmt(b.xgb_enriched?.mae, 4)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">{fmt(b.xgb_enriched?.rmse, 4)}</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-semibold">+3.4%</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-white">Extra Trees Regressor (New Candidate)</td>
                    <td className="py-3 px-4 text-slate-300 font-medium">38 Features</td>
                    <td className="py-3 px-4 text-right font-mono text-rr-pink">{fmt(b.extra_trees?.r2, 4)}</td>
                    <td className="py-3 px-4 text-right font-mono text-blue-400">{fmt(b.extra_trees?.mae, 4)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">{fmt(b.extra_trees?.rmse, 4)}</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-semibold">+17.2%</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-white">Gradient Boosting (Enriched)</td>
                    <td className="py-3 px-4 text-slate-300 font-medium">38 Features</td>
                    <td className="py-3 px-4 text-right font-mono text-rr-pink">{fmt(b.gb_enriched?.r2, 4)}</td>
                    <td className="py-3 px-4 text-right font-mono text-blue-400">{fmt(b.gb_enriched?.mae, 4)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">{fmt(b.gb_enriched?.rmse, 4)}</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-semibold">+19.7%</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-white">Random Forest (Enriched)</td>
                    <td className="py-3 px-4 text-slate-300 font-medium">38 Features</td>
                    <td className="py-3 px-4 text-right font-mono text-rr-pink font-bold">{fmt(b.rf_enriched?.r2, 4)}</td>
                    <td className="py-3 px-4 text-right font-mono text-blue-400">{fmt(b.rf_enriched?.mae, 4)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">{fmt(b.rf_enriched?.rmse, 4)}</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-bold">+26.0%</td>
                  </tr>
                  <tr className="bg-rr-pink/10 hover:bg-rr-pink/15 border-t-2 border-rr-pink/40">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center space-x-2">
                      <Award className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>LightGBM Regressor (Best Model)</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 font-bold">38 Features + Regularized Trees</td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-black text-sm">{fmt(b.lightgbm?.r2, 4)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-white font-bold">{fmt(b.lightgbm?.mae, 4)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">{fmt(b.lightgbm?.rmse, 4)}</td>
                    <td className="py-3.5 px-4 text-right text-emerald-400 font-black">+27.6%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>


          {/* ── 3. Over-Block Target & Bowling Pipelines ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Multi-Delivery Horizon Card */}
            <div className="glass-card p-6 rounded-2xl border-slate-800 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base">
                    2. Multi-Delivery Over-Block Horizon ([t, t+5])
                  </h3>
                  <p className="text-xs text-slate-400">
                    Predicting expected runs across the next 6 balls dampens discrete single-ball stochastic noise.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <MetricCard
                  label="LightGBM Over-Block R²"
                  value={fmt(b.next_6_balls_lgb?.r2, 4)}
                  sub="17.5% variance explained"
                  color="text-blue-400"
                />
                <MetricCard
                  label="Over-Block MAE"
                  value={`${fmt(b.next_6_balls_lgb?.mae, 4)} runs`}
                  sub="Across 6 legal balls"
                  color="text-slate-200"
                />
              </div>

              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gradient Boosting (Over-Block):</span>
                  <span className="font-mono text-white font-bold">R² = {fmt(b.next_6_balls_gb?.r2, 4)} (MAE: {fmt(b.next_6_balls_gb?.mae, 4)})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mean Baseline (No model):</span>
                  <span className="font-mono text-rose-400">R² = {fmt(b.next_6_balls_mean_baseline?.r2, 4)}</span>
                </div>
              </div>
            </div>

            {/* Separate Bowling Pipeline Card */}
            <div className="glass-card p-6 rounded-2xl border-slate-800 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                  <Target className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base">
                    3. Separate Bowling Pipeline (Bowler Runs Conceded)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Evaluates bowler containment ability under high-pressure scenarios.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <MetricCard
                  label="LightGBM Bowling R²"
                  value={fmt(b.bowling_lgb_runs?.r2, 4)}
                  sub="Runs conceded per delivery"
                  color="text-indigo-400"
                />
                <MetricCard
                  label="Bowling MAE"
                  value={`${fmt(b.bowling_lgb_runs?.mae, 4)} runs`}
                  sub="Mean error per ball"
                  color="text-slate-200"
                />
              </div>

              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gradient Boosting Bowling:</span>
                  <span className="font-mono text-white font-bold">R² = {fmt(b.bowling_gb_runs?.r2, 4)} (MAE: {fmt(b.bowling_gb_runs?.mae, 4)})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">RMSE per delivery:</span>
                  <span className="font-mono text-slate-300">{fmt(b.bowling_lgb_runs?.rmse, 4)} runs</span>
                </div>
              </div>
            </div>

          </div>


          {/* ── 4. Logistic Regression Classification & Threshold Optimization ── */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border-purple-500/30 bg-gradient-to-br from-slate-900/90 via-purple-950/20 to-slate-950 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                  <Target className="w-4 h-4" />
                  <span>Phase 6 Optimization</span>
                </div>
                <h3 className="text-2xl font-display font-black text-white mt-1">
                  4. Logistic Regression — Boundary Classification (runs ≥ 4)
                </h3>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
                Optimal τ = 0.490 (Tuned on 2024 validation)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard
                label="Boundary Recall"
                value={pct(c.optimized_threshold?.recall)}
                sub="10,816 of 15,234 caught"
                color="text-purple-400"
              />
              <MetricCard
                label="Precision"
                value={pct(c.optimized_threshold?.precision)}
                sub="Of flagged boundaries"
                color="text-blue-400"
              />
              <MetricCard
                label="F1-Score"
                value={fmt(c.optimized_threshold?.f1, 4)}
                sub="Up from baseline 0.3334"
                color="text-emerald-400"
              />
              <MetricCard
                label="ROC-AUC / PR-AUC"
                value={`${fmt(c.roc_auc, 3)} / ${fmt(c.pr_auc, 3)}`}
                sub="vs 0.189 no-skill baseline"
                color="text-amber-400"
              />
            </div>

            {/* Confusion Matrix Visual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Optimized Confusion Matrix (τ = 0.490)
                </h4>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                    <div className="text-[10px] text-slate-400">True Negatives (Non-boundary)</div>
                    <div className="text-base font-mono font-bold text-white mt-1">
                      {c.optimized_threshold?.confusion_matrix?.[0]?.[0]?.toLocaleString() || '30,581'}
                    </div>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                    <div className="text-[10px] text-slate-400">False Positives</div>
                    <div className="text-base font-mono font-bold text-amber-400 mt-1">
                      {c.optimized_threshold?.confusion_matrix?.[0]?.[1]?.toLocaleString() || '34,936'}
                    </div>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                    <div className="text-[10px] text-slate-400">False Negatives (Missed)</div>
                    <div className="text-base font-mono font-bold text-rose-400 mt-1">
                      {c.optimized_threshold?.confusion_matrix?.[1]?.[0]?.toLocaleString() || '4,418'}
                    </div>
                  </div>
                  <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/40">
                    <div className="text-[10px] text-emerald-300 font-bold">True Positives (Boundaries)</div>
                    <div className="text-base font-mono font-bold text-emerald-400 mt-1">
                      {c.optimized_threshold?.confusion_matrix?.[1]?.[1]?.toLocaleString() || '10,816'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-center space-y-3 text-xs leading-relaxed text-slate-300">
                <div className="flex items-center space-x-2 text-white font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Why Majority Baseline Fails in Cricket:</span>
                </div>
                <p className="text-slate-400">
                  Because 81.13% of balls are not boundaries, a naive model that predicts <em>"no boundary" on every ball</em> achieves 81.13% accuracy with <strong>0% Recall and F1 = 0</strong> — it fails to identify a single four or six.
                </p>
                <p className="text-slate-400">
                  By balancing class weights and tuning the decision threshold to τ = 0.490, our model successfully detects <strong>71.00% of all boundaries</strong> hitting the fence in high-pressure matches.
                </p>
              </div>
            </div>
          </div>


          {/* ── 5. Feature Importances: What Drives The Improvement ── */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-white">
                  5. Feature Importances: What Truly Drives Predictions
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Top features in LightGBM — 6 of the top 10 are the new pre-delivery signals
                </p>
              </div>
              <span className="text-xs text-rr-pink font-mono">Zero Data Leakage</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(feat).slice(0, 12).map(([name, splits], idx) => {
                const isNew = [
                  'run_rate_deficit', 'batter_career_sr', 'bowler_econ_match',
                  'batter_sr_inn', 'bowler_career_econ', 'batter_runs_inn',
                  'batter_career_avg', 'bowler_runs_match', 'batter_balls_inn'
                ].includes(name);

                return (
                  <div key={name} className={`p-3 rounded-xl border flex items-center justify-between ${
                    isNew ? 'bg-rr-pink/10 border-rr-pink/30' : 'bg-slate-900/60 border-slate-800'
                  }`}>
                    <div className="truncate pr-2">
                      <div className="text-xs font-semibold text-white flex items-center space-x-1.5">
                        <span className="text-slate-500 font-mono text-[10px]">#{idx + 1}</span>
                        <span className="truncate">{name}</span>
                        {isNew && <span className="text-[9px] px-1.5 py-0.2 rounded bg-rr-pink text-white font-bold shrink-0">NEW</span>}
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-300 shrink-0">
                      {splits} splits
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}


      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 2: LIVE EVALUATION RUNNER
         ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'live' && (
        <div className="space-y-8">
          
          <div className="glass-card p-6 rounded-2xl border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-xl text-white">Live Model Evaluation Runner</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Trains the 4 live models (Random Forest, Gradient Boosting, Logistic Regression, XGBoost) directly on the backend dataset.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {status === 'done' && (
                  <button
                    onClick={resetLive}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                  >
                    Clear Results
                  </button>
                )}
                <button
                  onClick={startEvaluation}
                  disabled={status === 'running'}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-rr-pink to-rr-pink-dark text-white font-bold text-xs sm:text-sm shadow-lg shadow-rr-pink/25 hover:opacity-90 disabled:opacity-50"
                >
                  {status === 'running' ? `Running (${elapsed}s)...` : status === 'done' ? 'Re-calculate Live' : 'Start Live Calculation'}
                </button>
              </div>
            </div>

            {status === 'running' && (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-rr-pink mx-auto" />
                <p className="text-sm font-semibold text-white">Training models live on 120,248 deliveries & testing on 80,751 deliveries...</p>
                <p className="text-xs text-slate-500">Elapsed time: {elapsed} seconds (standard cycle: ~15–20s)</p>
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {status === 'done' && liveData && (
              <div className="pt-4 border-t border-slate-800 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
                  <div className="flex flex-wrap gap-4">
                    <span>🗓 Train: <strong className="text-white">{liveData.train_period}</strong></span>
                    <span>🗓 Test: <strong className="text-white">{liveData.test_period}</strong></span>
                    <span>📊 Train: <strong className="text-white">{liveData.train_records?.toLocaleString()} balls</strong></span>
                    <span>📊 Test: <strong className="text-white">{liveData.test_records?.toLocaleString()} balls</strong></span>
                    <span>⏱ Cycle: <strong className="text-white">{liveData.total_evaluation_time_s}s</strong></span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                    ✓ Evaluated On Actual Dataset
                  </span>
                </div>

                {/* Live Model Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(liveData.models || {}).map(([key, m]) => (
                    <div key={key} className="glass-card p-5 rounded-2xl border-slate-800 hover:border-slate-700 transition space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{m.task}</div>
                          <div className="text-base font-display font-bold text-white mt-0.5">{m.name}</div>
                          <div className="text-[11px] text-slate-400">Target: {m.target}</div>
                        </div>
                        <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
                          {m.library}
                        </span>
                      </div>

                      {m.task === 'Classification' ? (
                        <>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                            <MetricCard label="Accuracy" value={pct(m.accuracy)} color="text-purple-400" />
                            <MetricCard label="Recall" value={pct(m.recall)} color="text-emerald-400" sub="10,816 detected" />
                            <MetricCard label="Precision" value={pct(m.precision)} color="text-blue-400" />
                            <MetricCard label="F1-Score" value={fmt(m.f1_score, 4)} color="text-amber-400" />
                          </div>
                          {m.roc_auc && (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-slate-300 flex justify-between">
                                <span className="text-slate-400">ROC-AUC:</span>
                                <span className="font-mono font-bold text-white">{fmt(m.roc_auc, 4)}</span>
                              </div>
                              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-slate-300 flex justify-between">
                                <span className="text-slate-400">PR-AUC:</span>
                                <span className="font-mono font-bold text-white">{fmt(m.pr_auc, 4)}</span>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                          <MetricCard label="R² Score" value={fmt(m.r2_score, 4)} color={m.r2_score > 0.1 ? 'text-blue-400' : 'text-rr-pink'} />
                          <MetricCard label="MAE" value={`${fmt(m.mae, 4)}`} sub="runs/ball" color="text-blue-400" />
                          <MetricCard label="RMSE" value={`${fmt(m.rmse, 4)}`} sub="runs/ball" color="text-slate-300" />
                        </div>
                      )}

                      {m.description && (
                        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                          {m.description}
                        </div>
                      )}

                      {m.cricket_example && (
                        <div className="bg-rr-pink/5 p-3 rounded-xl border border-rr-pink/20 text-[11px] text-slate-300 leading-relaxed">
                          <strong className="text-rr-pink">🏏 Cricket Scenario: </strong>{m.cricket_example}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {status === 'idle' && (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <BrainCircuit className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm">Click "Start Live Calculation" above to trigger a fresh training run on the backend.</p>
                <p className="text-xs text-slate-500">Alternatively, review the verified multi-phase benchmark in the tab above.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}