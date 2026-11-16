# SupeRR SELECTOR – SEASON 2
## Pressure Intelligence & Player Performance Analytics Platform
### Built for the Rajasthan Royals Hackathon (Season 2)

![Rajasthan Royals SupeRR Selector](https://img.shields.io/badge/Rajasthan_Royals-SupeRR_Selector_Season_2-E40066?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Scikit-Learn](https://img.shields.io/badge/ML-Gradient_Boosting-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)

---

## 1. Executive Summary

In T20 cricket, champions are forged in high-pressure match situations. The objective of **SupeRR Selector Season 2** is to distinguish players who consistently rise to the occasion from those whose performance dips under crunch pressure, using official historical ball-by-ball records from 2022 to 2026.

This platform implements an explainable, data-backed Machine Learning pipeline:
- **883 Matches** analysed (401 IPL matches + 482 T20 International matches).
- **200,999 Deliveries** processed with zero data leakage.
- **43,877 Pressure Deliveries** (21.8% of match play) identified via dynamic situational modeling.
- **958 Unique Players** evaluated and ranked with Bayesian confidence adjustments.

---

## 2. Official Hackathon Top 10 Rankings

### Top 10 Batters Under Pressure (Selected for Unstop Submission)

| Rank | Player Name | Pressure Runs | Balls Faced | Pressure SR | Normal SR | SR Delta (Δ) | Runs Added Above Expected (RAAE) | Pressure Reliability Score (PRS) |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **1** | **Shamar Springer** | 114 | 65 | 175.4 | 50.0 | +125.4 | +40.5 | **98.5** |
| **2** | **Angelo Mathews** | 144 | 77 | 187.0 | 84.9 | +102.1 | +36.3 | **98.5** |
| **3** | **Matthew Forde** | 136 | 75 | 181.3 | 82.1 | +99.2 | +40.4 | **98.5** |
| **4** | **Naman Dhir** | 358 | 176 | 203.4 | 153.5 | +49.9 | +80.8 | **97.4** |
| **5** | **Suryakumar Yadav** | 711 | 316 | 225.0 | 158.9 | +66.1 | +125.2 | **96.8** |
| **6** | **Glenn Phillips** | 453 | 219 | 206.9 | 134.1 | +72.8 | +84.6 | **95.8** |
| **7** | **Akeal Hosein** | 240 | 156 | 153.9 | 68.7 | +85.2 | +52.8 | **95.0** |
| **8** | **Dewald Brevis** | 139 | 68 | 204.4 | 146.6 | +57.8 | +38.2 | **95.0** |
| **9** | **Muhammad Irfan** | 136 | 69 | 197.1 | 92.6 | +104.5 | +19.9 | **93.9** |
| **10** | **Nitish Reddy** | 316 | 162 | 195.1 | 136.3 | +58.8 | +65.0 | **93.2** |

---

### Top 10 Bowlers Under Pressure (Selected for Unstop Submission)

| Rank | Player Name | Pressure Wickets | Pressure Overs | Pressure Economy | Normal Economy | Economy Delta (Δ) | Bowler Value Added (BVA) | Pressure Reliability Score (PRS) |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **1** | **Sunil Narine** | 19 | 36.4 | 6.05 | 7.01 | +0.96 | +122.3 | **98.5** |
| **2** | **Hasan Mahmud** | 12 | 22.2 | 6.35 | 8.32 | +1.97 | +53.9 | **98.5** |
| **3** | **Kane Richardson** | 10 | 17.5 | 7.57 | 10.19 | +2.62 | +33.2 | **96.9** |
| **4** | **Mohammad Nawaz** | 12 | 18.2 | 5.36 | 7.35 | +1.99 | +48.6 | **96.6** |
| **5** | **Abrar Ahmed** | 12 | 16.4 | 5.50 | 6.99 | +1.49 | +45.7 | **96.0** |
| **6** | **Sakib Hussain** | 9 | 11.5 | 8.35 | 10.09 | +1.74 | +36.3 | **95.0** |
| **7** | **Shadab Khan** | 12 | 20.3 | 6.19 | 8.22 | +2.03 | +42.5 | **94.9** |
| **8** | **Akeal Hosein** | 11 | 24.1 | 7.52 | 7.77 | +0.25 | +47.5 | **93.1** |
| **9** | **Matheesha Pathirana** | 47 | 78.4 | 8.70 | 8.90 | +0.20 | +160.4 | **90.6** |
| **10** | **Gurjapneet Singh** | 6 | 8.0 | 8.13 | 9.16 | +1.03 | +23.6 | **89.0** |

---

## 3. Methodology & System Architecture

### A. Contextual Pressure Detection Engine
At every delivery $t$, match pressure is classified based strictly on cumulative past information (zero data leakage):
1. **Innings 2 (Chases)**:
   - Required Run Rate ($RRR$) vs baseline benchmark.
   - Wickets in hand ($W_{\text{rem}} = 10 - \text{wickets fallen}$). Fewer wickets exponentially amplifies pressure.
   - Balls remaining ($B_{\text{rem}}$): Death overs ($B_{\text{rem}} \le 30$) multiplier.
   - Knockout match boost ($1.10\times$).
2. **Innings 1 (First Innings Total Setting)**:
   - Top-order collapse: $\ge 3$ wickets lost in overs 1-6 or $\ge 4$ wickets before over 10.
   - Death overs acceleration: Overs 16-20 with few wickets remaining.
3. **Innings 3 & 4 (Super Overs)**:
   - Automatically flagged as maximum crunch ($PI = 100$).
- **Pressure Categorization**:
  - Normal: $PI < 45$ (68.8% of balls)
  - Moderate: $45 \le PI < 70$ (9.3% of balls)
  - High Pressure: $PI \ge 70$ (21.8% of balls)

### B. Machine Learning Expected Value Models
- **Batting Model**: Histogram Gradient Boosting Regressor predicting expected runs per ball ($E[\text{runs}]$).
  - Chronological Split: 2022-2024 Train (120,248 deliveries), 2025-2026 Test (80,751 deliveries).
  - Validation: Test MAE = 1.2950, Test RMSE = 1.7399.
  - Value Metric: $\text{RAAE} = \sum (\text{Actual Runs} - E[\text{runs}])$.
- **Bowling Model**: Dual Gradient Boosting pipeline predicting expected runs conceded and expected wicket probability.
  - Test Runs MAE = 1.2809, Wicket ROC-AUC = 0.6204.
  - Value Metric: $\text{BVA} = (\text{Runs Saved}) + 4.5 \times (\text{Wickets Above Expected})$.

### C. Pressure Reliability Score (PRS) Formulation
$$\text{Raw Score} = 0.45 \times Z(\text{ML Value Added}) + 0.30 \times Z(\text{Baseline Delta}) + 0.25 \times Z(\text{Consistency \%})$$
$$\text{Confidence Factor} = \frac{1}{1 + e^{-0.06 \times (N_{\text{pressure balls}} - 45)}}$$
$$\text{PRS} = \text{MinMaxNormalize}(\text{Raw Score} \times \text{Confidence Factor}) \to [35.0, 98.5]$$

- **Sample Size Requirement**: $\ge 30$ pressure deliveries for official ranking. Players with $< 30$ deliveries are flagged with an explicit *Insufficient Evidence* banner.

---

## 4. Project Structure

```
Super-RR-project/
│
├── frontend/                     # React 19 + Vite + Tailwind CSS + Recharts
│   ├── src/
│   │   ├── components/           # Navbar, Footer, PlayerAvatar, Badges
│   │   ├── pages/                # Home, Rankings, Explorer, PlayerAnalysis, Analytics, Methodology
│   │   ├── services/             # Unified API Client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── backend/                      # FastAPI REST Backend
│   ├── api/
│   │   └── routes.py             # Paginated REST endpoints
│   ├── services/
│   │   └── data_service.py       # Precomputed JSON service layer
│   ├── processed_data/           # Model outputs, leaderboard JSON, profiles
│   └── main.py                   # App entrypoint & static SPA mounting
│
├── ml_engine/                    # Machine Learning & Pressure Engine
│   └── run_full_pipeline.py      # End-to-end training & ranking pipeline
│
├── 6af458274c1e8_data_pack/      # Official Dataset CSVs
│
├── requirements.txt              # Backend Python dependencies
├── render.yaml                   # Production deployment configuration
└── README.md
```

---

## 5. Local Setup & Execution Instructions

### 1. Backend Setup & Pipeline Execution
```bash
# Navigate to project root
cd "D:\Desktop\Super RR project"

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# (Optional) Re-run the full ML pipeline if dataset is updated
python ml_engine/run_full_pipeline.py

# Launch FastAPI Backend Server
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: `http://127.0.0.1:8000/api/docs`

### 2. Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
Web Application will run at: `http://localhost:3000`

---

## 6. Render Public Deployment

The application is configured for deployment as a single full-stack web service on Render:
1. Connect this GitHub repository to Render.
2. Select **Web Service**.
3. Set Build Command:
   ```bash
   pip install -r requirements.txt && npm --prefix frontend install && npm --prefix frontend run build
   ```
4. Set Start Command:
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port $PORT
   ```
5. Health Check Path: `/api/health`

---

## 7. Compliance with Official Rules
- 100% Genuine Data: No synthetic or hardcoded players.
- Chronologically validated Machine Learning with zero data leakage.
- Completely traceable match evidence records for every player.
- Separate batting and bowling pressure rankings.
- Full eligible player pool analyzed across 883 matches.
