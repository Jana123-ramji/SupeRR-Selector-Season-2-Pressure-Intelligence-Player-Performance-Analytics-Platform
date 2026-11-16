"""
End-to-End Cricket Analytics, Machine Learning & Pressure Reliability Pipeline
for Rajasthan Royals SupeRR Selector Season 2
"""
import os
import sys
import json
import numpy as np
import pandas as pd
from datetime import datetime
import joblib
from sklearn.ensemble import HistGradientBoostingRegressor, HistGradientBoostingClassifier
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, roc_auc_score

def sanitize_for_json(data):
    """Recursively convert NumPy data types to Python standard primitives."""
    if isinstance(data, dict):
        return {str(k): sanitize_for_json(v) for k, v in data.items()}
    elif isinstance(data, list) or isinstance(data, tuple) or isinstance(data, set):
        return [sanitize_for_json(v) for v in data]
    elif isinstance(data, np.integer):
        return int(data)
    elif isinstance(data, np.floating):
        return round(float(data), 4) if not np.isnan(data) else None
    elif isinstance(data, np.ndarray):
        return sanitize_for_json(data.tolist())
    elif pd.isna(data):
        return None
    return data

# Paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(BASE_DIR, "6af458274c1e8_data_pack", "Data Pack")
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
PROCESSED_DATA_DIR = os.path.join(BACKEND_DIR, "processed_data")
os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)

print("="*70)
print("SupeRR SELECTOR – SEASON 2: RUNNING ML & PRESSURE ANALYTICS PIPELINE")
print("="*70)

# 1. LOAD CSV DATASETS
print("\n[Step 1/7] Loading datasets...")
comps = pd.read_csv(os.path.join(DATA_DIR, "competitions.csv"))
matches = pd.read_csv(os.path.join(DATA_DIR, "matches.csv"))
teams = pd.read_csv(os.path.join(DATA_DIR, "teams.csv"))
player_map = pd.read_csv(os.path.join(DATA_DIR, "competition_team_player_mapping.csv"))
bb = pd.read_csv(os.path.join(DATA_DIR, "ball_by_ball.csv"))

print(f"Competitions: {len(comps)}, Matches: {len(matches)}, Deliveries: {len(bb)}")

# 2. BUILD TEAM & PLAYER DICTIONARIES
print("\n[Step 2/7] Constructing entity lookups...")
team_name_map = dict(zip(teams["team_id"], teams["team_name"]))

player_teams = {}
for _, row in player_map.iterrows():
    pid = int(row["player_id"])
    tname = row["team_name"]
    if pid not in player_teams:
        player_teams[pid] = set()
    if pd.notna(tname):
        player_teams[pid].add(str(tname))

player_teams = {k: sorted(list(v)) for k, v in player_teams.items()}

PLAYER_IMAGES = {
    1187: "https://documents.iplt20.com/ipl/IPLHeadshot2024/1187.png", # Jason Roy
    1125: "https://documents.iplt20.com/ipl/IPLHeadshot2024/2.png", # Virat Kohli
    1124: "https://documents.iplt20.com/ipl/IPLHeadshot2024/6.png", # Rohit Sharma
    1097: "https://documents.iplt20.com/ipl/IPLHeadshot2024/1.png", # MS Dhoni
    190:  "https://documents.iplt20.com/ipl/IPLHeadshot2024/190.png", # Sanju Samson
    509:  "https://documents.iplt20.com/ipl/IPLHeadshot2024/509.png", # Jos Buttler
    1144: "https://documents.iplt20.com/ipl/IPLHeadshot2024/9.png", # Jasprit Bumrah
    2885: "https://documents.iplt20.com/ipl/IPLHeadshot2024/2885.png", # Rashid Khan
    174:  "https://documents.iplt20.com/ipl/IPLHeadshot2024/174.png", # Suryakumar Yadav
    964:  "https://documents.iplt20.com/ipl/IPLHeadshot2024/964.png", # Trent Boult
    10:   "https://documents.iplt20.com/ipl/IPLHeadshot2024/10.png", # Yuzvendra Chahal
    2740: "https://documents.iplt20.com/ipl/IPLHeadshot2024/2740.png", # Hardik Pandya
    261:  "https://documents.iplt20.com/ipl/IPLHeadshot2024/261.png", # Ravindra Jadeja
    3840: "https://documents.iplt20.com/ipl/IPLHeadshot2024/3840.png", # Heinrich Klaasen
    177:  "https://documents.iplt20.com/ipl/IPLHeadshot2024/177.png", # Andre Russell
    3097: "https://documents.iplt20.com/ipl/IPLHeadshot2024/3097.png", # Rinku Singh
    3845: "https://documents.iplt20.com/ipl/IPLHeadshot2024/3845.png", # Travis Head
    2884: "https://documents.iplt20.com/ipl/IPLHeadshot2024/2884.png", # Nicholas Pooran
    3800: "https://documents.iplt20.com/ipl/IPLHeadshot2024/3800.png", # Arshdeep Singh
    1160: "https://documents.iplt20.com/ipl/IPLHeadshot2024/1160.png", # Mitchell Starc
    2699: "https://documents.iplt20.com/ipl/IPLHeadshot2024/2699.png", # Pat Cummins
    3824: "https://documents.iplt20.com/ipl/IPLHeadshot2024/3824.png", # Yashasvi Jaiswal
    3838: "https://documents.iplt20.com/ipl/IPLHeadshot2024/3838.png", # Shivam Dube
    3874: "https://documents.iplt20.com/ipl/IPLHeadshot2024/3874.png", # Riyan Parag
    3830: "https://documents.iplt20.com/ipl/IPLHeadshot2024/3830.png", # Tilak Varma
    1157: "https://documents.iplt20.com/ipl/IPLHeadshot2024/1157.png", # David Miller
    2889: "https://documents.iplt20.com/ipl/IPLHeadshot2024/2889.png", # Shimron Hetmyer
}

# 3. MATCH METADATA & REVISED TARGET ENRICHMENT
matches["match_dt"] = pd.to_datetime(matches["match_date"], errors="coerce")
matches["match_year"] = matches["match_dt"].dt.year.fillna(2022).astype(int)

comp_format_map = dict(zip(comps["comp_id"], comps["match_format"]))
comp_name_map = dict(zip(comps["comp_id"], comps["comp_name"]))
matches["match_format"] = matches["comp_id"].map(comp_format_map).fillna("T20I")
matches["comp_name"] = matches["comp_id"].map(comp_name_map).fillna("T20 Tournament")
matches["is_ipl"] = (matches["match_format"] == "T20").astype(int)

bb["extras1_runs"] = bb["extras1_runs"].fillna(0).astype(int)
bb["extras_2_runs"] = bb["extras_2_runs"].fillna(0).astype(int)
bb["delivery_extras"] = bb["extras1_runs"] + bb["extras_2_runs"]
bb["total_delivery_runs"] = bb["runs"] + bb["delivery_extras"]

bb["is_legal_ball"] = ~bb["extras_type"].isin(["wide", "Overstep"])
bb["is_batter_ball"] = bb["extras_type"] != "wide"
bb["is_bowler_wicket"] = bb["is_wicket"] & bb["dismissal_type"].isin(["Caught", "Bowled", "LBW", "Stump", "Hit Wicket"])
bb["bowler_runs_conceded"] = bb["runs"] + np.where(bb["extras_type"].isin(["wide", "Overstep"]), bb["delivery_extras"], 0)

bb = bb.sort_values(["match_id", "innings", "overid", "over_ball_num"]).reset_index(drop=True)
bb = bb.merge(matches[["match_id", "match_year", "match_date", "knock_out", "revised_target", "is_ipl", "match_format", "comp_name", "home_team", "away_team"]], on="match_id", how="left")

inn1_totals = bb[bb["innings"] == 1].groupby("match_id")["total_delivery_runs"].sum().to_dict()
target_map = {}
for _, m in matches.iterrows():
    mid = m["match_id"]
    if pd.notna(m["revised_target"]) and m["revised_target"] > 0:
        target_map[mid] = float(m["revised_target"])
    elif mid in inn1_totals:
        target_map[mid] = float(inn1_totals[mid] + 1)
    else:
        target_map[mid] = 165.0

bb["target"] = bb["match_id"].map(target_map).fillna(165.0)

bb["cum_runs"] = bb.groupby(["match_id", "innings"])["total_delivery_runs"].cumsum() - bb["total_delivery_runs"]
bb["cum_wickets"] = bb.groupby(["match_id", "innings"])["is_wicket"].cumsum() - bb["is_wicket"]
bb["cum_legal_balls"] = bb.groupby(["match_id", "innings"])["is_legal_ball"].cumsum() - bb["is_legal_ball"]

bb["balls_rem"] = np.clip(120 - bb["cum_legal_balls"], 1, 120)
bb["wickets_rem"] = np.clip(10 - bb["cum_wickets"], 1, 10)
bb["runs_needed"] = np.maximum(0, bb["target"] - bb["cum_runs"])

bb["rrr"] = np.where(bb["innings"] == 2, (bb["runs_needed"] / bb["balls_rem"]) * 6.0, 0.0)
bb["crr"] = np.where(bb["cum_legal_balls"] > 0, (bb["cum_runs"] / bb["cum_legal_balls"]) * 6.0, 8.0)

# 4. PRESSURE DETECTION ENGINE
print("\n[Step 3/7] Calculating explainable Pressure Index for every delivery...")
def compute_pressure_index(row):
    inn = row["innings"]
    if inn >= 3:
        return 100.0
    
    over = row["overid"]
    w_rem = row["wickets_rem"]
    w_lost = 10 - w_rem
    ko_boost = 1.10 if row.get("knock_out", 0) == 1 else 1.0
    
    if inn == 2:
        rrr = row["rrr"]
        b_rem = row["balls_rem"]
        r_need = row["runs_needed"]
        
        if r_need <= 0:
            return 10.0
            
        rrr_score = np.clip((rrr - 4.0) * 8.0, 10.0, 95.0)
        w_factor = 1.0 + (5.0 - w_rem) * 0.08
        d_factor = 1.0 + (max(0, 30 - b_rem) / 60.0)
        pi = rrr_score * w_factor * d_factor * ko_boost
        
        if rrr < 7.0 and w_rem >= 7:
            pi = min(pi, 35.0)
            
        return float(np.clip(pi, 5.0, 100.0))
    else:
        crisis = 0.0
        if over <= 6 and w_lost >= 3:
            crisis = 35.0 + (w_lost - 3) * 15.0
        elif over <= 10 and w_lost >= 4:
            crisis = 30.0 + (w_lost - 4) * 12.0
            
        death = (35.0 + (over - 16) * 7.0 + w_lost * 3.0) if over >= 16 else 0.0
        pi = (30.0 + crisis + death) * ko_boost
        return float(np.clip(pi, 15.0, 95.0))

bb["pressure_index"] = bb.apply(compute_pressure_index, axis=1)
bb["pressure_cat"] = pd.cut(bb["pressure_index"], bins=[-1, 45, 70, 101], labels=["Normal", "Moderate", "High"])
bb["is_pressure"] = bb["pressure_index"] >= 70.0

def get_innings_stage(over):
    if over <= 6:
        return "Powerplay"
    elif over <= 15:
        return "Middle"
    else:
        return "Death"

bb["innings_stage"] = bb["overid"].apply(get_innings_stage)

# 5. MACHINE LEARNING ENGINE: BATTING & BOWLING MODELS
print("\n[Step 4/7] Training Machine Learning Pipelines (Chronological Validation)...")
bb["pace_spin_encoded"] = (bb["pace_or_spin"].fillna("Pace").str.lower() == "spin").astype(int)
bb["batting_order"] = bb["batting_order"].fillna(4).astype(int)

feature_cols = [
    "innings", "overid", "over_ball_num", "balls_rem", "wickets_rem",
    "cum_runs", "crr", "rrr", "runs_needed", "pressure_index",
    "is_ipl", "batting_order", "pace_spin_encoded", "knock_out"
]

train_mask = bb["match_year"] <= 2024
test_mask = bb["match_year"] >= 2025

X_train = bb.loc[train_mask, feature_cols].fillna(0)
X_test = bb.loc[test_mask, feature_cols].fillna(0)
X_all = bb[feature_cols].fillna(0)

# A. Batting Model
y_train_bat = bb.loc[train_mask, "runs"]
y_test_bat = bb.loc[test_mask, "runs"]

bat_model = HistGradientBoostingRegressor(max_iter=150, min_samples_leaf=30, learning_rate=0.08, random_state=42)
bat_model.fit(X_train, y_train_bat)

bat_pred_train = bat_model.predict(X_train)
bat_pred_test = bat_model.predict(X_test)
bb["exp_runs"] = bat_model.predict(X_all)

bat_mae_train = mean_absolute_error(y_train_bat, bat_pred_train)
bat_rmse_train = root_mean_squared_error(y_train_bat, bat_pred_train)
bat_mae_test = mean_absolute_error(y_test_bat, bat_pred_test)
bat_rmse_test = root_mean_squared_error(y_test_bat, bat_pred_test)

print(f"Batting Model - Train MAE: {bat_mae_train:.4f}, Test MAE: {bat_mae_test:.4f}, Test RMSE: {bat_rmse_test:.4f}")

# B. Bowling Regressor & Classifier
y_train_bowl_runs = bb.loc[train_mask, "bowler_runs_conceded"]
y_test_bowl_runs = bb.loc[test_mask, "bowler_runs_conceded"]

bowl_runs_model = HistGradientBoostingRegressor(max_iter=150, min_samples_leaf=30, learning_rate=0.08, random_state=42)
bowl_runs_model.fit(X_train, y_train_bowl_runs)
bb["exp_bowl_runs"] = bowl_runs_model.predict(X_all)

bowl_mae_test = mean_absolute_error(y_test_bowl_runs, bowl_runs_model.predict(X_test))
bowl_rmse_test = root_mean_squared_error(y_test_bowl_runs, bowl_runs_model.predict(X_test))

y_train_wicket = bb.loc[train_mask, "is_bowler_wicket"].astype(int)
y_test_wicket = bb.loc[test_mask, "is_bowler_wicket"].astype(int)

bowl_wicket_model = HistGradientBoostingClassifier(max_iter=120, min_samples_leaf=30, learning_rate=0.08, random_state=42)
bowl_wicket_model.fit(X_train, y_train_wicket)
bb["exp_wicket_prob"] = bowl_wicket_model.predict_proba(X_all)[:, 1]

wicket_auc_test = roc_auc_score(y_test_wicket, bowl_wicket_model.predict_proba(X_test)[:, 1])
print(f"Bowling Model - Test Runs MAE: {bowl_mae_test:.4f}, Wicket AUC: {wicket_auc_test:.4f}")

# Save models
joblib.dump(bat_model, os.path.join(PROCESSED_DATA_DIR, "batting_model.joblib"))
joblib.dump(bowl_runs_model, os.path.join(PROCESSED_DATA_DIR, "bowling_runs_model.joblib"))
joblib.dump(bowl_wicket_model, os.path.join(PROCESSED_DATA_DIR, "bowling_wicket_model.joblib"))

model_eval_data = {
    "train_period": "2022 - 2024",
    "test_period": "2025 - 2026",
    "train_deliveries": int(train_mask.sum()),
    "test_deliveries": int(test_mask.sum()),
    "batting_model": {
        "algorithm": "Histogram Gradient Boosting Regressor",
        "target": "Runs scored per delivery (off bat)",
        "train_mae": round(float(bat_mae_train), 4),
        "test_mae": round(float(bat_mae_test), 4),
        "train_rmse": round(float(bat_rmse_train), 4),
        "test_rmse": round(float(bat_rmse_test), 4),
        "features": feature_cols
    },
    "bowling_model": {
        "algorithm": "Dual Gradient Boosting (Runs Regressor + Wicket Classifier)",
        "target": "Bowler runs conceded + Wicket probability",
        "test_runs_mae": round(float(bowl_mae_test), 4),
        "test_runs_rmse": round(float(bowl_rmse_test), 4),
        "test_wicket_auc": round(float(wicket_auc_test), 4),
        "wicket_value_multiplier": 4.5
    }
}
with open(os.path.join(PROCESSED_DATA_DIR, "model_evaluation.json"), "w") as f:
    json.dump(sanitize_for_json(model_eval_data), f, indent=2)

# 6. COMPUTE BATTING PRESSURE RELIABILITY SCORES
print("\n[Step 5/7] Computing Batting Pressure Reliability Scores...")
bb_bat = bb[bb["is_batter_ball"]].copy()
strikers = bb_bat["striker_id"].unique()
batting_records = []

for sid in strikers:
    s_df = bb_bat[bb_bat["striker_id"] == sid]
    s_name = s_df["striker_name"].iloc[0]
    total_balls = len(s_df)
    total_runs = int(s_df["runs"].sum())
    total_matches = int(s_df["match_id"].nunique())
    
    norm_df = s_df[~s_df["is_pressure"]]
    press_df = s_df[s_df["is_pressure"]]
    
    press_balls = len(press_df)
    press_runs = int(press_df["runs"].sum())
    press_innings = int(press_df.groupby(["match_id", "innings"]).ngroups)
    press_matches = int(press_df["match_id"].nunique())
    
    norm_sr = round((norm_df["runs"].sum() / len(norm_df) * 100.0), 2) if len(norm_df) > 0 else 0.0
    press_sr = round((press_runs / press_balls * 100.0), 2) if press_balls > 0 else 0.0
    total_sr = round((total_runs / total_balls * 100.0), 2) if total_balls > 0 else 0.0
    
    press_fours = int(press_df["is_four"].sum())
    press_sixes = int(press_df["is_six"].sum())
    press_dismissals = int(press_df["is_wicket"].sum())
    press_avg = round(press_runs / max(1, press_dismissals), 2) if press_dismissals > 0 else float(press_runs)
    
    exp_press_runs = float(press_df["exp_runs"].sum())
    runs_added_above_exp = round(press_runs - exp_press_runs, 2)
    raae_per_100 = round((runs_added_above_exp / max(1, press_balls)) * 100.0, 2)
    
    match_impact = press_df.groupby("match_id").apply(lambda m: m["runs"].sum() - m["exp_runs"].sum())
    consistency_pct = round(float((match_impact >= 0).mean() * 100.0), 1) if len(match_impact) > 0 else 0.0
    
    pp_balls = len(press_df[press_df["innings_stage"] == "Powerplay"])
    pp_runs = int(press_df[press_df["innings_stage"] == "Powerplay"]["runs"].sum())
    mid_balls = len(press_df[press_df["innings_stage"] == "Middle"])
    mid_runs = int(press_df[press_df["innings_stage"] == "Middle"]["runs"].sum())
    death_balls = len(press_df[press_df["innings_stage"] == "Death"])
    death_runs = int(press_df[press_df["innings_stage"] == "Death"]["runs"].sum())
    
    eligible = press_balls >= 30
    
    batting_records.append({
        "player_id": int(sid),
        "player_name": s_name,
        "image_url": PLAYER_IMAGES.get(int(sid), None),
        "teams": player_teams.get(int(sid), ["T20 Franchise"]),
        "total_balls": total_balls,
        "total_runs": total_runs,
        "total_matches": total_matches,
        "total_strike_rate": total_sr,
        "pressure_balls": press_balls,
        "pressure_runs": press_runs,
        "pressure_innings": press_innings,
        "pressure_matches": press_matches,
        "pressure_strike_rate": press_sr,
        "normal_strike_rate": norm_sr,
        "strike_rate_delta": round(press_sr - norm_sr, 2),
        "pressure_average": press_avg,
        "pressure_fours": press_fours,
        "pressure_sixes": press_sixes,
        "pressure_dismissals": press_dismissals,
        "expected_pressure_runs": round(exp_press_runs, 2),
        "runs_added_above_expected": runs_added_above_exp,
        "raae_per_100_balls": raae_per_100,
        "consistency_pct": consistency_pct,
        "stage_breakdown": {
            "powerplay": {"balls": pp_balls, "runs": pp_runs, "sr": round(pp_runs/max(1, pp_balls)*100, 1)},
            "middle": {"balls": mid_balls, "runs": mid_runs, "sr": round(mid_runs/max(1, mid_balls)*100, 1)},
            "death": {"balls": death_balls, "runs": death_runs, "sr": round(death_runs/max(1, death_balls)*100, 1)}
        },
        "eligible": eligible,
        "evidence_status": "Sufficient Evidence" if eligible else f"Insufficient Evidence ({press_balls}/30 pressure balls)"
    })

bat_df = pd.DataFrame(batting_records)

def calc_bat_prs(df):
    el_mask = df["eligible"]
    if not el_mask.any():
        df["prs_score"] = 0.0
        return df
    
    raae_z = (df.loc[el_mask, "raae_per_100_balls"] - df.loc[el_mask, "raae_per_100_balls"].mean()) / (df.loc[el_mask, "raae_per_100_balls"].std() + 1e-6)
    delta_z = (df.loc[el_mask, "strike_rate_delta"] - df.loc[el_mask, "strike_rate_delta"].mean()) / (df.loc[el_mask, "strike_rate_delta"].std() + 1e-6)
    cons_z = (df.loc[el_mask, "consistency_pct"] - df.loc[el_mask, "consistency_pct"].mean()) / (df.loc[el_mask, "consistency_pct"].std() + 1e-6)
    
    raw_composite = 0.45 * raae_z + 0.30 * delta_z + 0.25 * cons_z
    confidence = 1.0 / (1.0 + np.exp(-0.06 * (df.loc[el_mask, "pressure_balls"] - 45)))
    adjusted = raw_composite * confidence
    
    min_adj, max_adj = adjusted.quantile(0.02), adjusted.quantile(0.98)
    scaled = 50.0 + (adjusted - min_adj) / (max_adj - min_adj + 1e-6) * 45.0
    scaled = np.clip(scaled, 35.0, 98.5).round(1)
    
    df.loc[el_mask, "prs_score"] = scaled
    df.loc[~el_mask, "prs_score"] = (df.loc[~el_mask, "pressure_balls"] / 30.0 * 30.0).round(1)
    return df

bat_df = calc_bat_prs(bat_df)
bat_eligible = bat_df[bat_df["eligible"]].sort_values("prs_score", ascending=False).reset_index(drop=True)
bat_eligible["rank"] = bat_eligible.index + 1
bat_ineligible = bat_df[~bat_df["eligible"]].sort_values("pressure_balls", ascending=False).reset_index(drop=True)
bat_ineligible["rank"] = None

batting_leaderboard = pd.concat([bat_eligible, bat_ineligible], ignore_index=True)

# 7. COMPUTE BOWLING PRESSURE RELIABILITY SCORES
print("\n[Step 6/7] Computing Bowling Pressure Reliability Scores...")
bb_bowl = bb[bb["is_legal_ball"] | bb["extras_type"].isin(["wide", "Overstep"])].copy()
bowlers = bb_bowl["bowler_id"].unique()
bowling_records = []

for bid in bowlers:
    b_df = bb_bowl[bb_bowl["bowler_id"] == bid]
    b_name = b_df["bowler_name"].iloc[0]
    total_balls = len(b_df[b_df["is_legal_ball"]])
    total_runs_conceded = int(b_df["bowler_runs_conceded"].sum())
    total_wickets = int(b_df["is_bowler_wicket"].sum())
    total_matches = int(b_df["match_id"].nunique())
    
    norm_df = b_df[~b_df["is_pressure"]]
    press_df = b_df[b_df["is_pressure"]]
    
    norm_legal = len(norm_df[norm_df["is_legal_ball"]])
    press_legal = len(press_df[press_df["is_legal_ball"]])
    press_runs = int(press_df["bowler_runs_conceded"].sum())
    press_wickets = int(press_df["is_bowler_wicket"].sum())
    press_overs = round(press_legal / 6.0, 1)
    press_matches = int(press_df["match_id"].nunique())
    
    norm_econ = round(norm_df["bowler_runs_conceded"].sum() / max(1, norm_legal) * 6.0, 2) if norm_legal > 0 else 8.5
    press_econ = round(press_runs / max(1, press_legal) * 6.0, 2) if press_legal > 0 else 8.5
    total_econ = round(total_runs_conceded / max(1, total_balls) * 6.0, 2) if total_balls > 0 else 8.5
    
    press_avg = round(press_runs / max(1, press_wickets), 2) if press_wickets > 0 else float(press_runs)
    press_dots = int((press_df["runs"] == 0).sum())
    press_dot_pct = round(press_dots / max(1, press_legal) * 100.0, 1)
    
    exp_press_runs = float(press_df["exp_bowl_runs"].sum())
    exp_press_wickets = float(press_df["exp_wicket_prob"].sum())
    
    runs_saved = exp_press_runs - press_runs
    wickets_above_exp = press_wickets - exp_press_wickets
    bva = round(runs_saved + 4.5 * wickets_above_exp, 2)
    bva_per_100 = round((bva / max(1, press_legal)) * 100.0, 2)
    econ_delta = round(norm_econ - press_econ, 2)
    
    match_bva = press_df.groupby("match_id").apply(lambda m: (m["exp_bowl_runs"].sum() - m["bowler_runs_conceded"].sum()) + 4.5 * (m["is_bowler_wicket"].sum() - m["exp_wicket_prob"].sum()))
    consistency_pct = round(float((match_bva >= 0).mean() * 100.0), 1) if len(match_bva) > 0 else 0.0
    
    pp_legal = len(press_df[(press_df["innings_stage"] == "Powerplay") & press_df["is_legal_ball"]])
    pp_runs = int(press_df[press_df["innings_stage"] == "Powerplay"]["bowler_runs_conceded"].sum())
    pp_wkts = int(press_df[press_df["innings_stage"] == "Powerplay"]["is_bowler_wicket"].sum())
    
    mid_legal = len(press_df[(press_df["innings_stage"] == "Middle") & press_df["is_legal_ball"]])
    mid_runs = int(press_df[press_df["innings_stage"] == "Middle"]["bowler_runs_conceded"].sum())
    mid_wkts = int(press_df[press_df["innings_stage"] == "Middle"]["is_bowler_wicket"].sum())
    
    death_legal = len(press_df[(press_df["innings_stage"] == "Death") & press_df["is_legal_ball"]])
    death_runs = int(press_df[press_df["innings_stage"] == "Death"]["bowler_runs_conceded"].sum())
    death_wkts = int(press_df[press_df["innings_stage"] == "Death"]["is_bowler_wicket"].sum())
    
    eligible = press_legal >= 30
    
    bowling_records.append({
        "player_id": int(bid),
        "player_name": b_name,
        "image_url": PLAYER_IMAGES.get(int(bid), None),
        "teams": player_teams.get(int(bid), ["T20 Franchise"]),
        "total_balls": total_balls,
        "total_overs": round(total_balls / 6.0, 1),
        "total_runs_conceded": total_runs_conceded,
        "total_wickets": total_wickets,
        "total_economy": total_econ,
        "total_matches": total_matches,
        "pressure_balls": press_legal,
        "pressure_overs": press_overs,
        "pressure_runs_conceded": press_runs,
        "pressure_wickets": press_wickets,
        "pressure_matches": press_matches,
        "pressure_economy": press_econ,
        "normal_economy": norm_econ,
        "economy_delta": econ_delta,
        "pressure_average": press_avg,
        "pressure_dot_balls": press_dots,
        "pressure_dot_pct": press_dot_pct,
        "expected_pressure_runs": round(exp_press_runs, 2),
        "expected_pressure_wickets": round(exp_press_wickets, 2),
        "runs_saved_above_expected": round(runs_saved, 2),
        "wickets_above_expected": round(wickets_above_exp, 2),
        "bowler_value_added": bva,
        "bva_per_100_balls": bva_per_100,
        "consistency_pct": consistency_pct,
        "stage_breakdown": {
            "powerplay": {"overs": round(pp_legal/6.0, 1), "runs": pp_runs, "wickets": pp_wkts, "econ": round(pp_runs/max(1, pp_legal)*6, 2)},
            "middle": {"overs": round(mid_legal/6.0, 1), "runs": mid_runs, "wickets": mid_wkts, "econ": round(mid_runs/max(1, mid_legal)*6, 2)},
            "death": {"overs": round(death_legal/6.0, 1), "runs": death_runs, "wickets": death_wkts, "econ": round(death_runs/max(1, death_legal)*6, 2)}
        },
        "eligible": eligible,
        "evidence_status": "Sufficient Evidence" if eligible else f"Insufficient Evidence ({press_legal}/30 pressure balls)"
    })

bowl_df = pd.DataFrame(bowling_records)

def calc_bowl_prs(df):
    el_mask = df["eligible"]
    if not el_mask.any():
        df["prs_score"] = 0.0
        return df
    
    bva_z = (df.loc[el_mask, "bva_per_100_balls"] - df.loc[el_mask, "bva_per_100_balls"].mean()) / (df.loc[el_mask, "bva_per_100_balls"].std() + 1e-6)
    econ_z = (df.loc[el_mask, "economy_delta"] - df.loc[el_mask, "economy_delta"].mean()) / (df.loc[el_mask, "economy_delta"].std() + 1e-6)
    cons_z = (df.loc[el_mask, "consistency_pct"] - df.loc[el_mask, "consistency_pct"].mean()) / (df.loc[el_mask, "consistency_pct"].std() + 1e-6)
    
    raw_composite = 0.45 * bva_z + 0.30 * econ_z + 0.25 * cons_z
    confidence = 1.0 / (1.0 + np.exp(-0.06 * (df.loc[el_mask, "pressure_balls"] - 45)))
    
    adjusted = raw_composite * confidence
    min_adj, max_adj = adjusted.quantile(0.02), adjusted.quantile(0.98)
    scaled = 50.0 + (adjusted - min_adj) / (max_adj - min_adj + 1e-6) * 45.0
    scaled = np.clip(scaled, 35.0, 98.5).round(1)
    
    df.loc[el_mask, "prs_score"] = scaled
    df.loc[~el_mask, "prs_score"] = (df.loc[~el_mask, "pressure_balls"] / 30.0 * 30.0).round(1)
    return df

bowl_df = calc_bowl_prs(bowl_df)
bowl_eligible = bowl_df[bowl_df["eligible"]].sort_values("prs_score", ascending=False).reset_index(drop=True)
bowl_eligible["rank"] = bowl_eligible.index + 1
bowl_ineligible = bowl_df[~bowl_df["eligible"]].sort_values("pressure_balls", ascending=False).reset_index(drop=True)
bowl_ineligible["rank"] = None

bowling_leaderboard = pd.concat([bowl_eligible, bowl_ineligible], ignore_index=True)

# 8. EXTRACT MATCH-LEVEL EVIDENCE & EXPORT JSON
print("\n[Step 7/7] Generating Match Evidence & Exporting API Caches...")
player_evidence_map = {}
all_player_ids = set(bat_df["player_id"]).union(set(bowl_df["player_id"]))

press_deliveries = bb[bb["is_pressure"]].copy()

for pid in all_player_ids:
    p_bat_ev = press_deliveries[press_deliveries["striker_id"] == pid]
    p_bowl_ev = press_deliveries[press_deliveries["bowler_id"] == pid]
    evidence_items = []
    
    if len(p_bat_ev) > 0:
        for mid, mgroup in p_bat_ev.groupby("match_id"):
            m_first = mgroup.iloc[0]
            runs_sc = int(mgroup["runs"].sum())
            balls_f = len(mgroup)
            exp_r = round(float(mgroup["exp_runs"].sum()), 1)
            opp_team = m_first["away_team"] if str(m_first.get("batting_team_id")) == str(m_first.get("home_team_id")) else m_first["home_team"]
            
            situation_desc = f"Innings {m_first['innings']}, Over {mgroup['overid'].min()}-{mgroup['overid'].max()}"
            if m_first["innings"] == 2:
                situation_desc += f" | Chasing {int(m_first['target'])} (RRR was {m_first['rrr']:.1f})"
            else:
                situation_desc += f" | Rebuilding/Death push ({m_first['innings_stage']})"
                
            evidence_items.append({
                "match_id": int(mid),
                "type": "Batting",
                "date": str(m_first["match_date"]),
                "competition": str(m_first["comp_name"]),
                "opponent": str(opp_team),
                "situation": situation_desc,
                "pressure_level": "High (Score 70-100)",
                "performance": f"{runs_sc} runs off {balls_f} balls (Exp: {exp_r})",
                "impact": f"{runs_sc - exp_r:+0.1f} RAAE",
                "is_positive": bool(runs_sc >= exp_r)
            })
            
    if len(p_bowl_ev) > 0:
        for mid, mgroup in p_bowl_ev.groupby("match_id"):
            m_first = mgroup.iloc[0]
            runs_conc = int(mgroup["bowler_runs_conceded"].sum())
            wkts = int(mgroup["is_bowler_wicket"].sum())
            legal_b = len(mgroup[mgroup["is_legal_ball"]])
            exp_r = round(float(mgroup["exp_bowl_runs"].sum()), 1)
            opp_team = m_first["away_team"] if str(m_first.get("bowling_team_id")) == str(m_first.get("home_team_id")) else m_first["home_team"]
            
            situation_desc = f"Defending in {m_first['innings_stage']} overs ({mgroup['overid'].min()}-{mgroup['overid'].max()})"
            if m_first["innings"] == 2:
                situation_desc += f" | Defending target {int(m_first['target'])}"
                
            runs_saved = exp_r - runs_conc
            is_pos = runs_saved >= 0 or wkts > 0
            
            evidence_items.append({
                "match_id": int(mid),
                "type": "Bowling",
                "date": str(m_first["match_date"]),
                "competition": str(m_first["comp_name"]),
                "opponent": str(opp_team),
                "situation": situation_desc,
                "pressure_level": "High (Score 70-100)",
                "performance": f"{wkts} wkts, {runs_conc} runs in {legal_b} balls (Exp: {exp_r})",
                "impact": f"{runs_saved:+0.1f} runs saved",
                "is_positive": bool(is_pos)
            })
            
    evidence_items.sort(key=lambda x: str(x["date"]), reverse=True)
    player_evidence_map[str(pid)] = evidence_items[:12]

# Save evidence
with open(os.path.join(PROCESSED_DATA_DIR, "player_evidence.json"), "w") as f:
    json.dump(sanitize_for_json(player_evidence_map), f, indent=2)

# Save Batting & Bowling Leaderboards
batting_leaderboard_json = batting_leaderboard.to_dict(orient="records")
with open(os.path.join(PROCESSED_DATA_DIR, "batting_rankings.json"), "w") as f:
    json.dump(sanitize_for_json(batting_leaderboard_json), f, indent=2)

bowling_leaderboard_json = bowling_leaderboard.to_dict(orient="records")
with open(os.path.join(PROCESSED_DATA_DIR, "bowling_rankings.json"), "w") as f:
    json.dump(sanitize_for_json(bowling_leaderboard_json), f, indent=2)

# Save Unified Player Profiles Dictionary
player_profiles = {}
bat_lookup = {r["player_id"]: r for r in batting_leaderboard_json}
bowl_lookup = {r["player_id"]: r for r in bowling_leaderboard_json}

for pid in all_player_ids:
    b_stat = bat_lookup.get(pid, None)
    w_stat = bowl_lookup.get(pid, None)
    
    pname = b_stat["player_name"] if b_stat else (w_stat["player_name"] if w_stat else "Unknown")
    teams_list = b_stat["teams"] if b_stat else (w_stat["teams"] if w_stat else [])
    
    has_bat = b_stat and b_stat["total_balls"] >= 30
    has_bowl = w_stat and w_stat["total_balls"] >= 30
    if has_bat and has_bowl:
        role = "All-Rounder"
    elif has_bowl:
        role = "Bowler"
    else:
        role = "Batter"
        
    player_profiles[str(pid)] = {
        "player_id": int(pid),
        "player_name": pname,
        "image_url": PLAYER_IMAGES.get(int(pid), None),
        "role": role,
        "teams": teams_list,
        "batting": b_stat,
        "bowling": w_stat,
        "evidence": player_evidence_map.get(str(pid), [])
    }

with open(os.path.join(PROCESSED_DATA_DIR, "player_profiles.json"), "w") as f:
    json.dump(sanitize_for_json(player_profiles), f, indent=2)

# Overall Dataset Summary
dataset_summary = {
    "total_matches": int(len(matches)),
    "total_deliveries": int(len(bb)),
    "total_players": int(len(all_player_ids)),
    "total_pressure_deliveries": int(bb["is_pressure"].sum()),
    "pressure_percentage": round(float(bb["is_pressure"].mean() * 100), 2),
    "seasons": [int(y) for y in sorted(list(matches["match_year"].unique()))],
    "ipl_matches": int((matches["is_ipl"] == 1).sum()),
    "t20i_matches": int((matches["is_ipl"] == 0).sum()),
    "pressure_distribution": {
        "Normal": int((bb["pressure_cat"] == "Normal").sum()),
        "Moderate": int((bb["pressure_cat"] == "Moderate").sum()),
        "High": int((bb["pressure_cat"] == "High").sum())
    },
    "eligible_batters": int(len(bat_eligible)),
    "eligible_bowlers": int(len(bowl_eligible)),
    "generated_at": datetime.now().isoformat()
}
with open(os.path.join(PROCESSED_DATA_DIR, "dataset_summary.json"), "w") as f:
    json.dump(sanitize_for_json(dataset_summary), f, indent=2)

# Analytics Trends Data (for Dashboard charts)
over_trends = []
for over in range(1, 21):
    o_df = bb[bb["overid"] == over]
    over_trends.append({
        "over": int(over),
        "run_rate": round(float(o_df["total_delivery_runs"].mean() * 6.0), 2),
        "pressure_pct": round(float(o_df["is_pressure"].mean() * 100.0), 1),
        "wicket_pct": round(float(o_df["is_wicket"].mean() * 100.0), 1)
    })

format_comp = {
    "IPL": {
        "matches": int((matches["is_ipl"] == 1).sum()),
        "avg_score": round(float(bb[bb["is_ipl"] == 1].groupby(["match_id", "innings"])["total_delivery_runs"].sum().mean()), 1),
        "run_rate": round(float(bb[bb["is_ipl"] == 1]["total_delivery_runs"].mean() * 6.0), 2),
        "boundary_pct": round(float(bb[bb["is_ipl"] == 1]["runs"].isin([4, 6]).mean() * 100.0), 1),
        "pressure_pct": round(float(bb[bb["is_ipl"] == 1]["is_pressure"].mean() * 100.0), 1)
    },
    "T20I": {
        "matches": int((matches["is_ipl"] == 0).sum()),
        "avg_score": round(float(bb[bb["is_ipl"] == 0].groupby(["match_id", "innings"])["total_delivery_runs"].sum().mean()), 1),
        "run_rate": round(float(bb[bb["is_ipl"] == 0]["total_delivery_runs"].mean() * 6.0), 2),
        "boundary_pct": round(float(bb[bb["is_ipl"] == 0]["runs"].isin([4, 6]).mean() * 100.0), 1),
        "pressure_pct": round(float(bb[bb["is_ipl"] == 0]["is_pressure"].mean() * 100.0), 1)
    }
}

analytics_data = {
    "summary": dataset_summary,
    "over_trends": over_trends,
    "format_comparison": format_comp,
    "model_evaluation": model_eval_data,
    "top_batters_preview": batting_leaderboard_json[:10],
    "top_bowlers_preview": bowling_leaderboard_json[:10]
}
with open(os.path.join(PROCESSED_DATA_DIR, "analytics_data.json"), "w") as f:
    json.dump(sanitize_for_json(analytics_data), f, indent=2)

print("\n" + "="*70)
print("SUCCESS: PIPELINE COMPLETED! ALL PRECOMPUTED ARTIFACTS SAVED TO:")
print(PROCESSED_DATA_DIR)
print("="*70)
