import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Trophy, ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-rr-navy-dark border-t border-slate-800/80 mt-20 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-rr-pink flex items-center justify-center font-display font-black text-white text-sm">
                RR
              </div>
              <span className="font-display font-extrabold text-white text-lg tracking-tight">
                SupeRR <span className="text-rr-pink">Selector</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rr-pink/20 text-rr-pink border border-rr-pink/30">
                Season 2
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Official cricket analytics & machine learning platform developed for the Rajasthan Royals Hackathon (SupeRR Selector Season 2). Built on 200,999 historical IPL & T20I deliveries with transparent, explainable Pressure Intelligence.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>100% Data-Backed • Zero Hallucinations • Chronologically Validated ML</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/rankings" className="hover:text-rr-pink transition">Top 10 Batters & Bowlers</Link></li>
              <li><Link to="/model-accuracy" className="hover:text-rr-pink transition">Model Accuracy (ML)</Link></li>
              <li><Link to="/explorer" className="hover:text-rr-pink transition">Player Search & Explorer</Link></li>
              <li><Link to="/analytics" className="hover:text-rr-pink transition">Analytics & Model Validation</Link></li>
              <li><Link to="/methodology" className="hover:text-rr-pink transition">Scoring Methodology</Link></li>
            </ul>
          </div>

          {/* Hackathon Specs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Hackathon Info</h4>
            <p className="text-xs text-slate-400 mb-2">Rajasthan Royals SupeRR Selector Season 2 Challenge</p>
            <p className="text-xs text-slate-500">Dataset: 2022-2026 IPL & T20I Official Records</p>
            <p className="text-xs text-slate-500">Eligible Player Pool: 958 Players</p>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-4 sm:space-y-0">
          <div>
            © {new Date().getFullYear()} SupeRR Selector Season 2. Powered by Gradient Boosting & Bayesian Reliability.
          </div>
          <div className="flex items-center space-x-1 text-slate-400">
            <span>Built with passion for Rajasthan Royals & Cricket Data Science</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
