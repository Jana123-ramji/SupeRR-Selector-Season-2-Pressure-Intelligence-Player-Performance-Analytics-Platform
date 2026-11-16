import React, { useState } from 'react';
import { User } from 'lucide-react';

export default function PlayerAvatar({
  name,
  imageUrl,
  role,
  size = 'md',
  className = '',
  showRoleBadge = true
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Compute clean 2-letter initials
  const initials = (name || 'Player')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  // Sizing definitions
  const sizeClasses = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-9 h-9 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-28 h-28 sm:w-32 sm:h-32 text-2xl',
    '3xl': 'w-36 h-36 sm:w-44 sm:h-44 text-3xl'
  }[size] || 'w-12 h-12 text-sm';

  // Deterministic athletic color gradient based on player name
  const gradients = [
    'from-rose-600 via-pink-700 to-indigo-950',      // Rajasthan Royals royal pink
    'from-blue-600 via-indigo-700 to-slate-950',     // Deep royal blue
    'from-purple-600 via-fuchsia-800 to-slate-950',  // Royal purple
    'from-amber-500 via-orange-600 to-red-950',      // Amber flame
    'from-emerald-600 via-teal-700 to-cyan-950',     // Teal emerald
    'from-sky-500 via-blue-700 to-indigo-950'        // Sky electric
  ];
  const charSum = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const gradient = gradients[charSum % gradients.length];

  // Role icon overlay
  const roleLower = role?.toLowerCase() || '';
  const roleIcon = roleLower === 'bowler' ? '🎯' : roleLower === 'all-rounder' ? '⚡' : '🏏';

  const hasPhoto = !!imageUrl && !imageFailed;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl overflow-hidden border border-slate-700/80 shadow-md ${sizeClasses} ${className} bg-slate-900 select-none`}
    >
      {hasPhoto ? (
        <>
          {/* Skeleton Shimmer while image loads */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
              <span className="font-display font-black text-slate-500 text-xs">{initials}</span>
            </div>
          )}
          <img
            src={imageUrl}
            alt={name || 'Player'}
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              setImageFailed(true);
              setIsLoaded(true);
            }}
            className={`w-full h-full object-cover object-top transition duration-300 hover:scale-105 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
          />
        </>
      ) : (
        /* Professional Athletic Monogram Silhouette Fallback */
        <div
          className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center relative p-1.5`}
          title={`${name} (${role || 'Cricketer'})`}
        >
          {/* Subtle athlete silhouette watermark */}
          <div className="absolute inset-0 opacity-15 flex items-center justify-center pointer-events-none">
            <User className="w-3/4 h-3/4 text-white" />
          </div>

          {/* Monogram initials */}
          <span className="relative z-10 font-display font-black text-white tracking-widest drop-shadow-md">
            {initials}
          </span>

          {/* Player name preview on large sizes */}
          {(size === '2xl' || size === '3xl') && (
            <span className="relative z-10 text-[10px] font-bold text-white/80 uppercase tracking-wider text-center mt-1 truncate max-w-full px-1">
              {name}
            </span>
          )}
        </div>
      )}

      {/* Role Badge Indicator */}
      {showRoleBadge && (size === 'lg' || size === 'xl' || size === '2xl' || size === '3xl') && (
        <div
          className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-slate-950/90 border border-slate-700 flex items-center justify-center text-[10px] shadow-lg z-20"
          title={role || 'Cricket Player'}
        >
          {roleIcon}
        </div>
      )}
    </div>
  );
}
