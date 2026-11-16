/**
 * API Client for SupeRR Selector Platform
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function handleResponse(res) {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error [${res.status}]: ${errorText || res.statusText}`);
  }
  return res.json();
}

export const api = {
  getSummary: async () => {
    return handleResponse(await fetch(`${API_BASE}/summary`));
  },
  getTopBatters: async (limit = 10) => {
    return handleResponse(await fetch(`${API_BASE}/rankings/top-batters?limit=${limit}`));
  },
  getTopBowlers: async (limit = 10) => {
    return handleResponse(await fetch(`${API_BASE}/rankings/top-bowlers?limit=${limit}`));
  },
  getBattingRankings: async ({ page = 1, limit = 20, search = '', team = '', minBalls = 0, onlyEligible = false, sortBy = 'prs_score', sortOrder = 'desc' } = {}) => {
    const query = new URLSearchParams({
      page,
      limit,
      search,
      team,
      min_balls: minBalls,
      only_eligible: onlyEligible,
      sort_by: sortBy,
      sort_order: sortOrder
    });
    return handleResponse(await fetch(`${API_BASE}/rankings/batting?${query.toString()}`));
  },
  getBowlingRankings: async ({ page = 1, limit = 20, search = '', team = '', minBalls = 0, onlyEligible = false, sortBy = 'prs_score', sortOrder = 'desc' } = {}) => {
    const query = new URLSearchParams({
      page,
      limit,
      search,
      team,
      min_balls: minBalls,
      only_eligible: onlyEligible,
      sort_by: sortBy,
      sort_order: sortOrder
    });
    return handleResponse(await fetch(`${API_BASE}/rankings/bowling?${query.toString()}`));
  },
  getPlayerProfile: async (playerId) => {
    return handleResponse(await fetch(`${API_BASE}/player/${playerId}`));
  },
  searchPlayers: async (query, role = 'all', limit = 10) => {
    const params = new URLSearchParams({ q: query, limit });
    if (role && role !== 'all') params.append('role', role);
    return handleResponse(await fetch(`${API_BASE}/search?${params.toString()}`));
  },
  getAnalytics: async () => {
    return handleResponse(await fetch(`${API_BASE}/analytics`));
  },
  getModelEvaluation: async () => {
    return handleResponse(await fetch(`${API_BASE}/models/evaluation`));
  },
  getImprovedBenchmarks: async () => {
    return handleResponse(await fetch(`${API_BASE}/models/improved-benchmarks`));
  },
  getLatestEvaluation: async () => {
    return handleResponse(await fetch(`${API_BASE}/models/latest-evaluation`));
  },
  calculateModelAccuracy: async () => {
    return handleResponse(await fetch(`${API_BASE}/models/calculate-accuracy`, {
      method: 'POST',
    }));
  }
};
