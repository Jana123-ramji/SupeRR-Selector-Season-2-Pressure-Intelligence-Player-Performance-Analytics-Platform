"""
FastAPI Routes for SupeRR Selector Platform
"""
from fastapi import APIRouter, HTTPException, Query
import os
import json
from typing import Optional
from backend.services.data_service import service
from backend.services.model_accuracy_service import run_model_accuracy_evaluation, get_latest_evaluation

router = APIRouter(prefix="/api", tags=["cricket-analytics"])

@router.get("/summary")
def get_summary():
    """Return dataset overview, match numbers, pressure distribution"""
    summary = service.get_summary()
    if not summary:
        service.load_data()
        summary = service.get_summary()
    return summary

@router.get("/rankings/top-batters")
def get_top_batters(limit: int = 10):
    """Return Top 10 Batters under pressure"""
    return service.get_top_batters(limit=limit)

@router.get("/rankings/top-bowlers")
def get_top_bowlers(limit: int = 10):
    """Return Top 10 Bowlers under pressure"""
    return service.get_top_bowlers(limit=limit)

@router.get("/rankings/batting")
def get_batting_rankings(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    team: Optional[str] = None,
    min_balls: int = Query(0, ge=0),
    only_eligible: bool = Query(False),
    sort_by: str = Query("prs_score"),
    sort_order: str = Query("desc")
):
    """Paginated, searchable, filterable complete Batting Leaderboard"""
    return service.get_batting_rankings(
        page=page,
        limit=limit,
        search=search,
        team=team,
        min_balls=min_balls,
        only_eligible=only_eligible,
        sort_by=sort_by,
        sort_order=sort_order
    )

@router.get("/rankings/bowling")
def get_bowling_rankings(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    team: Optional[str] = None,
    min_balls: int = Query(0, ge=0),
    only_eligible: bool = Query(False),
    sort_by: str = Query("prs_score"),
    sort_order: str = Query("desc")
):
    """Paginated, searchable, filterable complete Bowling Leaderboard"""
    return service.get_bowling_rankings(
        page=page,
        limit=limit,
        search=search,
        team=team,
        min_balls=min_balls,
        only_eligible=only_eligible,
        sort_by=sort_by,
        sort_order=sort_order
    )

@router.get("/player/{player_id}")
def get_player_profile(player_id: int):
    """Return complete profile, pressure metrics, stages, and match evidence"""
    player = service.get_player(player_id)
    if not player:
        # Reload attempt
        service.load_data()
        player = service.get_player(player_id)
        if not player:
            raise HTTPException(status_code=404, detail=f"Player ID {player_id} not found in historical records.")
    return player

@router.get("/search")
def search_players(
    q: str = Query("", description="Search term for player name"),
    role: Optional[str] = Query(None, description="Filter by Batter, Bowler, All-Rounder"),
    limit: int = Query(10, ge=1, le=50)
):
    """Fast instant autocomplete search across all eligible and historical players"""
    return service.search_players(query=q, role=role, limit=limit)

@router.get("/analytics")
def get_analytics():
    """Return comprehensive analytics, trend distributions, format comparisons"""
    return service.get_analytics()

@router.get("/models/evaluation")
def get_model_evaluation():
    """Return ML validation metrics, train/test MAE, RMSE, and feature info"""
    return service.get_model_evaluation()

@router.get("/models/improved-benchmarks")
def get_improved_benchmarks():
    """Return comprehensive multi-phase ML benchmark and optimization results"""
    comp_path = os.path.join(os.path.dirname(__file__), "..", "processed_data", "comprehensive_evaluation_report.json")
    if os.path.exists(comp_path):
        with open(comp_path, "r") as f:
            return json.load(f)
    return {"message": "Comprehensive report not found. Run model accuracy evaluation first."}

@router.get("/models/latest-evaluation")
def get_latest_eval():
    """Return most recently completed live model accuracy evaluation"""
    res = get_latest_evaluation()
    if res:
        return res
    # fallback to run once
    return run_model_accuracy_evaluation()

@router.post("/models/calculate-accuracy")
def calculate_model_accuracy():
    """
    Live evaluation endpoint: trains and evaluates all 4 ML models on actual data.
    Returns real R², MAE, RMSE, Accuracy, Precision, Recall, F1 metrics.
    This can take 60–120 seconds on first run.
    """
    try:
        result = run_model_accuracy_evaluation()
        return result
    except ImportError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Missing dependency: {str(e)}. Install with: pip install scikit-learn xgboost"
        )
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Dataset not found: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Model evaluation failed: {str(e)}"
        )
