import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Trophy,
  BarChart3,
  Users,
  BookOpen,
  Flame,
  X,
  BrainCircuit,
  Menu,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import PlayerAvatar from './PlayerAvatar';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowDropdown(false);
  }, [location.pathname]);

  // Live search debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await api.searchPlayers(searchQuery, 'all', 8);
        setSearchResults(results);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const navLinks = [
    { name: 'Overview', path: '/', icon: Flame },
    { name: 'Pressure Rankings', path: '/rankings', icon: Trophy },
    { name: 'Player Explorer', path: '/explorer', icon: Users },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Model Accuracy', path: '/model-accuracy', icon: BrainCircuit, badge: 'Live ML' },
    { name: 'Methodology', path: '/methodology', icon: BookOpen }
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-rr-pink via-rose-600 to-indigo-900 p-0.5 shadow-lg shadow-rr-pink/25 group-hover:shadow-rr-pink/40 group-hover:scale-105 transition duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <span className="text-rr-pink font-display font-black text-xl tracking-tighter">RR</span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-display font-black text-base sm:text-xl tracking-tight text-white group-hover:text-rr-pink transition">
                  SupeRR <span className="text-rr-pink">Selector</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-rr-pink/15 text-rr-pink border border-rr-pink/30">
                  S2
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider hidden xs:block">
                Pressure Intelligence Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition duration-200 relative ${
                    isActive
                      ? 'bg-rr-pink/15 text-white border border-rr-pink/40 shadow-sm shadow-rr-pink/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 transition-colors ${
                      isActive ? 'text-rr-pink' : 'text-slate-400'
                    }`}
                  />
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search Box + Mobile Menu Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Instant Search Box with Player Photos */}
            <div ref={searchRef} className="relative w-44 sm:w-64 md:w-72">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search player photo & stats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                  className="w-full bg-slate-900/90 text-xs sm:text-sm text-white placeholder-slate-400 pl-8 sm:pl-9 pr-7 py-2 rounded-xl border border-slate-700/80 focus:outline-none focus:border-rr-pink focus:ring-1 focus:ring-rr-pink transition shadow-inner"
                />
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-2.5 top-2.5" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Dropdown Results with Player Portraits */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-72 sm:w-88 md:w-96 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950/80">
                    <span className="font-semibold text-slate-200">
                      Matching Players ({searchResults.length})
                    </span>
                    {isSearching && (
                      <span className="text-rr-pink text-[11px] font-bold animate-pulse">
                        Searching...
                      </span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                    {searchResults.length > 0 ? (
                      searchResults.map((p) => (
                        <button
                          key={p.player_id}
                          onClick={() => {
                            setShowDropdown(false);
                            setSearchQuery('');
                            navigate(`/player/${p.player_id}`);
                          }}
                          className="w-full text-left p-3 hover:bg-slate-800/60 transition flex items-center space-x-3 group"
                        >
                          <PlayerAvatar
                            name={p.player_name}
                            imageUrl={p.image_url}
                            role={p.role}
                            size="md"
                            className="border border-slate-700 group-hover:border-rr-pink transition shrink-0"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold text-white group-hover:text-rr-pink transition truncate">
                              {p.player_name}
                            </div>
                            <div className="text-xs text-slate-400 truncate">
                              {p.role} • {p.teams?.[0] || 'T20 Player'}
                            </div>
                          </div>

                          <div className="text-right text-xs shrink-0 flex flex-col items-end space-y-1">
                            {p.batting_prs && (
                              <span className="px-1.5 py-0.5 rounded bg-rr-pink/15 text-rr-pink font-mono text-[10px] font-bold border border-rr-pink/30">
                                BAT #{p.batting_rank || '-'} ({p.batting_prs})
                              </span>
                            )}
                            {p.bowling_prs && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-mono text-[10px] font-bold border border-blue-500/30">
                                BOWL #{p.bowling_rank || '-'} ({p.bowling_prs})
                              </span>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-400">
                        {isSearching ? 'Searching database...' : 'No cricketers found matching your search.'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-rr-pink" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation (Slides down on mobile toggle) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/98 border-t border-slate-800 px-4 py-4 space-y-2 animate-in slide-in-from-top-3 duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3 rounded-xl text-sm font-bold transition ${
                  isActive
                    ? 'bg-rr-pink/15 text-white border border-rr-pink/30 shadow-md'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rr-pink' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </div>
                {link.badge ? (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {link.badge}
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
