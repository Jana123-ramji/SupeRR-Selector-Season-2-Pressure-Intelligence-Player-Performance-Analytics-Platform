"""
Data Service Layer for SupeRR Selector Backend
Loads precomputed JSON data and serves fast, cached queries with pagination and search.
"""
import os
import json
from typing import List, Dict, Any, Optional

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "processed_data")

class CricketDataService:
    def __init__(self):
        self.batting_rankings: List[Dict[str, Any]] = []
        self.bowling_rankings: List[Dict[str, Any]] = []
        self.player_profiles: Dict[str, Dict[str, Any]] = {}
        self.dataset_summary: Dict[str, Any] = {}
        self.model_evaluation: Dict[str, Any] = {}
        self.analytics_data: Dict[str, Any] = {}
        self.player_evidence: Dict[str, List[Dict[str, Any]]] = {}
        self.is_loaded = False
        self.load_data()

    def load_data(self):
        try:
            bat_path = os.path.join(DATA_DIR, "batting_rankings.json")
            if os.path.exists(bat_path):
                with open(bat_path, "r", encoding="utf-8") as f:
                    self.batting_rankings = json.load(f)

            bowl_path = os.path.join(DATA_DIR, "bowling_rankings.json")
            if os.path.exists(bowl_path):
                with open(bowl_path, "r", encoding="utf-8") as f:
                    self.bowling_rankings = json.load(f)

            prof_path = os.path.join(DATA_DIR, "player_profiles.json")
            if os.path.exists(prof_path):
                with open(prof_path, "r", encoding="utf-8") as f:
                    self.player_profiles = json.load(f)

            sum_path = os.path.join(DATA_DIR, "dataset_summary.json")
            if os.path.exists(sum_path):
                with open(sum_path, "r", encoding="utf-8") as f:
                    self.dataset_summary = json.load(f)

            eval_path = os.path.join(DATA_DIR, "model_evaluation.json")
            if os.path.exists(eval_path):
                with open(eval_path, "r", encoding="utf-8") as f:
                    self.model_evaluation = json.load(f)

            ana_path = os.path.join(DATA_DIR, "analytics_data.json")
            if os.path.exists(ana_path):
                with open(ana_path, "r", encoding="utf-8") as f:
                    self.analytics_data = json.load(f)

            ev_path = os.path.join(DATA_DIR, "player_evidence.json")
            if os.path.exists(ev_path):
                with open(ev_path, "r", encoding="utf-8") as f:
                    self.player_evidence = json.load(f)

            self.is_loaded = True
            print(f"[CricketDataService] Successfully loaded: {len(self.batting_rankings)} batters, {len(self.bowling_rankings)} bowlers, {len(self.player_profiles)} profiles.")
        except Exception as e:
            print(f"[CricketDataService] Error loading data: {e}")

    def get_summary(self) -> Dict[str, Any]:
        return self.dataset_summary

    def get_top_batters(self, limit: int = 10) -> List[Dict[str, Any]]:
        eligible = [p for p in self.batting_rankings if p.get("eligible")]
        return eligible[:limit]

    def get_top_bowlers(self, limit: int = 10) -> List[Dict[str, Any]]:
        eligible = [p for p in self.bowling_rankings if p.get("eligible")]
        return eligible[:limit]

    def get_batting_rankings(
        self,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None,
        team: Optional[str] = None,
        min_balls: int = 0,
        only_eligible: bool = False,
        sort_by: str = "prs_score",
        sort_order: str = "desc"
    ) -> Dict[str, Any]:
        results = list(self.batting_rankings)
        
        if only_eligible:
            results = [r for r in results if r.get("eligible")]
        if min_balls > 0:
            results = [r for r in results if r.get("pressure_balls", 0) >= min_balls]
        if team:
            team_lower = team.lower()
            results = [r for r in results if any(team_lower in t.lower() for t in r.get("teams", []))]
        if search:
            s_lower = search.lower()
            results = [r for r in results if s_lower in r.get("player_name", "").lower()]

        # Sorting
        reverse = sort_order.lower() == "desc"
        if sort_by in ["prs_score", "pressure_runs", "pressure_strike_rate", "runs_added_above_expected", "pressure_balls"]:
            results.sort(key=lambda x: (x.get(sort_by) is not None, x.get(sort_by, 0)), reverse=reverse)

        total_count = len(results)
        start = (page - 1) * limit
        end = start + limit
        paginated = results[start:end]

        return {
            "total": total_count,
            "page": page,
            "limit": limit,
            "total_pages": (total_count + limit - 1) // limit if limit > 0 else 1,
            "data": paginated
        }

    def get_bowling_rankings(
        self,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None,
        team: Optional[str] = None,
        min_balls: int = 0,
        only_eligible: bool = False,
        sort_by: str = "prs_score",
        sort_order: str = "desc"
    ) -> Dict[str, Any]:
        results = list(self.bowling_rankings)
        
        if only_eligible:
            results = [r for r in results if r.get("eligible")]
        if min_balls > 0:
            results = [r for r in results if r.get("pressure_balls", 0) >= min_balls]
        if team:
            team_lower = team.lower()
            results = [r for r in results if any(team_lower in t.lower() for t in r.get("teams", []))]
        if search:
            s_lower = search.lower()
            results = [r for r in results if s_lower in r.get("player_name", "").lower()]

        reverse = sort_order.lower() == "desc"
        if sort_by in ["prs_score", "pressure_wickets", "pressure_economy", "bowler_value_added", "pressure_balls"]:
            if sort_by == "pressure_economy":
                # For economy, ascending is naturally better, but follow sort_order
                results.sort(key=lambda x: (x.get(sort_by) is not None, x.get(sort_by, 99)), reverse=reverse)
            else:
                results.sort(key=lambda x: (x.get(sort_by) is not None, x.get(sort_by, 0)), reverse=reverse)

        total_count = len(results)
        start = (page - 1) * limit
        end = start + limit
        paginated = results[start:end]

        return {
            "total": total_count,
            "page": page,
            "limit": limit,
            "total_pages": (total_count + limit - 1) // limit if limit > 0 else 1,
            "data": paginated
        }

    def get_player(self, player_id: int) -> Optional[Dict[str, Any]]:
        pid_str = str(player_id)
        return self.player_profiles.get(pid_str)

    def search_players(self, query: str, role: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        q_lower = query.strip().lower()
        matches = []
        for pid_str, prof in self.player_profiles.items():
            name = prof.get("player_name", "")
            if q_lower and q_lower not in name.lower():
                continue
            if role and role.lower() != "all" and prof.get("role", "").lower() != role.lower():
                continue
            
            # Quick summary card
            matches.append({
                "player_id": prof["player_id"],
                "player_name": prof["player_name"],
                "role": prof.get("role", "Player"),
                "teams": prof.get("teams", []),
                "image_url": prof.get("image_url"),
                "batting_rank": prof.get("batting", {}).get("rank") if prof.get("batting") else None,
                "batting_prs": prof.get("batting", {}).get("prs_score") if prof.get("batting") else None,
                "bowling_rank": prof.get("bowling", {}).get("rank") if prof.get("bowling") else None,
                "bowling_prs": prof.get("bowling", {}).get("prs_score") if prof.get("bowling") else None,
            })
            if len(matches) >= limit:
                break
        return matches

    def get_analytics(self) -> Dict[str, Any]:
        return self.analytics_data

    def get_model_evaluation(self) -> Dict[str, Any]:
        return self.model_evaluation

# Global singleton
service = CricketDataService()
