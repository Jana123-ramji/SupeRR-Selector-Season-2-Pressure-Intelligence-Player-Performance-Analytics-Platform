import React from 'react';
import { BookOpen, ShieldCheck, Flame, Cpu, Calculator, CheckCircle2, Award, Zap } from 'lucide-react';

export default function MethodologyPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 space-y-2">
        <div className="inline-flex items-center space-x-2 text-rr-pink text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Technical Whitepaper & Scoring Logic</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-black text-white">
          Pressure Intelligence Methodology
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Comprehensive documentation of the mathematical modeling, machine learning pipelines, and Bayesian reliability scoring engineered for Rajasthan Royals SupeRR Selector Season 2.
        </p>
      </div>

      {/* Section 1: Defining Pressure */}
      <section className="glass-card p-8 rounded-3xl border-slate-800 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rr-pink/15 flex items-center justify-center text-rr-pink">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-white">
              1. Mathematical Definition of Match Pressure
            </h2>
            <p className="text-xs text-slate-400">Contextual, dynamic evaluation at every ball with zero future leakage</p>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-slate-300 space-y-4 leading-relaxed">
          <p>
            In T20 cricket, pressure is asymmetric and non-linear. A batter chasing a modest target with 9 wickets in hand is under minimal stress; the exact same required run rate with 8 wickets down in the 19th over is maximum pressure.
          </p>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
            <div className="text-rr-pink font-bold text-sm">Pressure Index (PI) Formulation:</div>
            <div>• <span className="text-white font-bold">Innings 2 (Chasing):</span></div>
            <div className="pl-4 text-slate-300">
              PI = Clip[ ((RRR - 4.0) × 8.0) × (1.0 + (5 - W_rem) × 0.08) × (1.0 + Death_Factor) × Knockout_Boost, 5.0, 100.0 ]
            </div>
            <div>• <span className="text-white font-bold">Innings 1 (Setting Total):</span></div>
            <div className="pl-4 text-slate-300">
              Crisis Score (Top-order collapse: ≥ 3 wickets lost in overs 1-6) + Death Push (≥ over 16) + Knockout Multiplier
            </div>
            <div>• <span className="text-white font-bold">Innings 3 & 4 (Super Over):</span> Fixed maximum pressure = 100.0</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-400">Normal Situations</span>
              <div className="text-sm font-bold text-white mt-1">PI &lt; 45</div>
              <p className="text-[11px] text-slate-500 mt-1">Standard match conditions, comfortable chases.</p>
            </div>
            <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-blue-400">Moderate Pressure</span>
              <div className="text-sm font-bold text-white mt-1">45 ≤ PI &lt; 70</div>
              <p className="text-[11px] text-slate-500 mt-1">Equilibrium matches, tight run rates.</p>
            </div>
            <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-rr-pink">High Pressure (Crunch)</span>
              <div className="text-sm font-bold text-white mt-1">PI ≥ 70</div>
              <p className="text-[11px] text-slate-500 mt-1">Steep chases, death overs, collapses, super overs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Machine Learning Architecture */}
      <section className="glass-card p-8 rounded-3xl border-slate-800 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-white">
              2. Machine Learning Expected Value Architecture
            </h2>
            <p className="text-xs text-slate-400">Dual gradient boosting pipelines predicting delivery-level expectations</p>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-slate-300 space-y-4 leading-relaxed">
          <p>
            Rather than inventing arbitrary player scores, our system uses supervised Machine Learning to calculate what an <em>average player under the exact same match situation</em> would be expected to produce.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-sm">Batting Expected Runs Regressor:</h3>
              <p className="text-xs text-slate-400">
                Predicts E[runs] scored off the bat per delivery using match state, over, balls remaining, wickets in hand, RRR, CRR, batting position, bowler type, and venue characteristics.
              </p>
              <div className="text-xs font-mono text-emerald-400 pt-1">
                Value Added = Actual Runs - Expected Runs (RAAE)
              </div>
            </div>

            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-sm">Bowling Dual Expected Model:</h3>
              <p className="text-xs text-slate-400">
                Predicts expected runs conceded per ball and expected wicket probability. A wicket is statistically valued at +4.5 runs saved based on T20 win probability transition matrices.
              </p>
              <div className="text-xs font-mono text-blue-400 pt-1">
                Bowler Value Added = Runs Saved + (4.5 × Wickets Above Exp)
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-xs">
            <span className="font-bold text-white">Chronological Validation Split: </span>
            <span className="text-slate-400">
              Trained on 120,248 deliveries (2022-2024), tested on 80,751 deliveries (2025-2026). Zero future leakage ensures full real-world predictive validity.
            </span>
          </div>
        </div>
      </section>

      {/* Section 3: Pressure Reliability Score */}
      <section className="glass-card p-8 rounded-3xl border-slate-800 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-white">
              3. Pressure Reliability Score (PRS) Formulation
            </h2>
            <p className="text-xs text-slate-400">Harmonizing ML value, player baseline elevation, and Bayesian confidence</p>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-slate-300 space-y-4 leading-relaxed">
          <p>
            The final Pressure Reliability Score (0-100 scale) is calculated using an explainable multi-component formula:
          </p>

          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 font-mono text-xs space-y-2">
            <div className="text-white font-bold">PRS = Normalize( Raw_Score × Confidence_Factor )</div>
            <div className="text-slate-400">Where:</div>
            <div className="pl-4 text-slate-300">• Raw_Score = 0.45 × Z(ML_Value_Added) + 0.30 × Z(Baseline_Elevation_Delta) + 0.25 × Z(Match_Consistency)</div>
            <div className="pl-4 text-slate-300">• Confidence_Factor = 1.0 / (1.0 + e^(-0.06 × (N_pressure_balls - 45))) [Bayesian Sigmoid Shrinkage]</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-white text-xs">Batters Baseline Elevation:</span>
              <p className="text-xs text-slate-400">
                Measures ΔSR = SR(Pressure) - SR(Normal). A batter who scores at 210 SR under pressure while batting at 145 normally receives substantial credit for rising to the occasion.
              </p>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-white text-xs">Bowlers Baseline Elevation:</span>
              <p className="text-xs text-slate-400">
                Measures ΔEcon = Econ(Normal) - Econ(Pressure). A bowler whose economy stays sub-7.0 in crunch scenarios when ordinary overs go for 8.5+ receives highest defense reliability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Minimum Opportunity & Sample Qualification */}
      <section className="glass-card p-8 rounded-3xl border-slate-800 space-y-4">
        <h2 className="text-lg font-display font-bold text-white flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>4. Eligibility & Insufficient Evidence Safeguards</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          To ensure fairness and statistical significance, a player must have faced or bowled at least <strong>30 pressure deliveries</strong> in the dataset to qualify for official rank assignment. Players below 30 deliveries are preserved in the database for complete transparency, but carry an explicit <em>Insufficient Evidence</em> warning to prevent premature conclusions.
        </p>
      </section>

    </div>
  );
}
