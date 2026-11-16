import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ArrowRight, Zap, Target, Sparkles, TrendingUp } from 'lucide-react';
import PlayerAvatar from './PlayerAvatar';

export default function PlayerCard({
  player,
  type = 'batting', // 'batting' | 'bowling' | 'general'
  featured = false,
  className = ''
}) {
  if (!player) return null;

  const isBatting = type === 'batting';
  const isBowling = type === 'bowling';
  const rank = player.rank;
  const isChampion = rank === 1;
  const isPodium = rank && rank <= 3;

  // Primary stats extraction
  const prs = player.prs_score || (isBatting ? player.batting?.prs_score : player.bowling?.prs_score);
  const runs = player.pressure_runs ?? player.batting?.pressure_runs;
  const sr = player.pressure_strike_rate ?? player.batting?.pressure_strike_rate;
  const raae = player.runs_added_above_expected ?? player.batting?.runs_added_above_expected;

  const wickets = player.pressure_wickets ?? player.bowling?.pressure_wickets;
  const econ = player.pressure_economy ?? player.bowling?.pressure_economy;
  const bva = player.bowler_value_added ?? player.bowling?.bowler_value_added;

  // Teams string
  const primaryTeam = Array.isArray(player.teams) && player.teams.length > 0 ? player.teams[0] : (player.team || 'T20 Cricketer');

  // Champion / Podium styling
  const cardBorder = isChampion
    ? 'border-amber-400/60 shadow-xl shadow-amber-500/10 bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-slate-950'
    : rank === 2
    ? 'border-slate-400/50 shadow-lg shadow-slate-400/5 bg-gradient-to-br from-slate-400/10 via-slate-900/90 to-slate-950'
    : rank === 3
    ? 'border-amber-700/50 shadow-lg shadow-amber-700/5 bg-gradient-to-br from-amber-700/10 via-slate-900/90 to-slate-950'
    : isBatting
    ? 'border-slate-800/80 hover:border-rr-pink/50 hover:shadow-lg hover:shadow-rr-pink/10'
    : 'border-slate-800/80 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10';

  const rankBadge = isChampion ? (
    <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/30">
      <Sparkles className="w-3 h-3 fill-slate-950" />
      <span>#1 CHAMPION</span>
    </div>
  ) : rank === 2 ? (
    <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-300 text-slate-950 font-black text-xs shadow-sm">
      <span>🥈 #2</span>
    </div>
  ) : rank === 3 ? (
    <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-700/80 text-amber-100 font-black text-xs border border-amber-600/50">
      <span>🥉 #3</span>
    </div>
  ) : rank ? (
    <div className="px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-400 font-mono font-bold text-xs">
      #{rank}
    </div>
  ) : null;

  return (
    <div
      className={`glass-card rounded-2xl p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between gap-4 relative overflow-hidden group ${cardBorder} ${className}`}
    >
      {/* Top Bar: Rank Badge + PRS Score */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          {rankBadge}
          <span className="text-[11px] font-medium text-slate-400 truncate max-w-[130px] sm:max-w-[160px]">
            {primaryTeam}
          </span>
        </div>

        {/* PRS Score Badge */}
        {prs !== undefined && prs !== null && (
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden xs:inline">
              PRS
            </span>
            <div
              className={`px-2.5 py-1 rounded-xl font-display font-black text-xs sm:text-sm shadow-md ${
                isBatting
                  ? 'bg-rr-pink/15 text-rr-pink border border-rr-pink/30'
                  : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
              }`}
            >
              {prs}
            </div>
          </div>
        )}
      </div>

      {/* Main Identity: Photo + Player Name + Discipline */}
      <div className="flex items-center space-x-3.5 min-w-0">
        <PlayerAvatar
          name={player.player_name}
          imageUrl={player.image_url}
          role={player.role || (isBatting ? 'Batter' : 'Bowler')}
          size={isChampion ? 'xl' : 'lg'}
          className={`shrink-0 ring-2 transition-transform duration-300 group-hover:scale-105 ${
            isChampion
              ? 'ring-amber-400/80'
              : isBatting
              ? 'ring-rr-pink/40'
              : 'ring-blue-500/40'
          }`}
        />

        <div className="min-w-0 flex-1">
          <Link
            to={`/player/${player.player_id}`}
            className="font-display font-bold text-base sm:text-lg text-white hover:text-rr-pink transition truncate block group-hover:underline"
          >
            {player.player_name}
          </Link>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
            <span className="capitalize">{player.role || (isBatting ? 'Batter' : 'Bowler')}</span>
            <span>•</span>
            <span className="text-slate-500 text-[11px] font-mono">ID #{player.player_id}</span>
          </div>
        </div>
      </div>

      {/* Stats Metric Grid */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-center">
        {isBatting && (
          <>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Pressure Runs</div>
              <div className="text-sm font-display font-black text-white mt-0.5">{runs ?? '-'}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Strike Rate</div>
              <div className="text-sm font-display font-black text-amber-400 mt-0.5">{sr ?? '-'}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">RAAE Metric</div>
              <div
                className={`text-sm font-display font-black mt-0.5 ${
                  raae > 0 ? 'text-emerald-400' : 'text-slate-300'
                }`}
              >
                {raae !== undefined && raae !== null ? (raae > 0 ? `+${raae}` : raae) : '-'}
              </div>
            </div>
          </>
        )}

        {isBowling && (
          <>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Pressure Wkts</div>
              <div className="text-sm font-display font-black text-white mt-0.5">{wickets ?? '-'}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Economy</div>
              <div className="text-sm font-display font-black text-cyan-400 mt-0.5">{econ ?? '-'}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">BVA Metric</div>
              <div
                className={`text-sm font-display font-black mt-0.5 ${
                  bva > 0 ? 'text-emerald-400' : 'text-slate-300'
                }`}
              >
                {bva !== undefined && bva !== null ? (bva > 0 ? `+${bva}` : bva) : '-'}
              </div>
            </div>
          </>
        )}

        {!isBatting && !isBowling && (
          <>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Batting Rank</div>
              <div className="text-xs font-bold text-rr-pink mt-0.5">
                {player.batting_rank ? `#${player.batting_rank}` : '-'}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Bowling Rank</div>
              <div className="text-xs font-bold text-blue-400 mt-0.5">
                {player.bowling_rank ? `#${player.bowling_rank}` : '-'}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">PRS Best</div>
              <div className="text-xs font-bold text-emerald-400 mt-0.5">
                {Math.max(player.batting_prs || 0, player.bowling_prs || 0) || '-'}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action CTA: Analyse Stats Button */}
      <Link
        to={`/player/${player.player_id}`}
        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition duration-200 shadow-md ${
          isChampion
            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/20'
            : isBatting
            ? 'bg-gradient-to-r from-rr-pink to-rr-pink-dark hover:from-rr-pink-light hover:to-rr-pink text-white shadow-rr-pink/20'
            : isBowling
            ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white shadow-blue-600/20'
            : 'bg-slate-800 hover:bg-rr-pink text-slate-200 hover:text-white'
        }`}
      >
        <span>Analyse Stats</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
