# RailPulse — Rail Intelligence System (SIH 2026 · PS 26028 · Team CATHODE)

Probabilistic train ETA: a **real trained XGBoost model**, **real timetable + delay statistics**, **live weather**,
and an honest UI that labels every input as LIVE / REAL DATA / SIMULATED / PLANNED.
One folder, one server: FastAPI serves both the API and the built React UI.

```
railpulse/
├─ backend/                FastAPI + model + data   (this is what you run / deploy)
│  ├─ app/                 API (routers), model code, registry, trained model, built UI in app/static
│  ├─ app/data/            trains/*.json (88 trains), delay_stats.csv, stations.json
│  ├─ data_raw/            the two public datasets everything is built from
│  ├─ scripts/build_data.py   datasets  -> trains/*.json + delay_stats.csv
│  └─ tests/               19 automated tests
├─ frontend/               React + Vite source of the UI (only needed if you edit the UI)
├─ JURY_QA.md              honest answers to the questions a jury will ask
├─ render.yaml  Dockerfile deploy files
└─ run.bat / run.sh        one-click start
```

## Quick start (Hinglish)
1. Python 3.10+ chahiye. Folder `railpulse` mein terminal kholo.
2. **Windows:** `run.bat` double-click karo. **Mac/Linux:** `./run.sh`.
   (Ye pehli baar dependencies install karta hai aur server start karta hai.)
3. Browser mein kholo: **http://localhost:8000** (UI) aur **http://localhost:8000/docs** (API).
4. Model dobara train karna ho: `cd backend` → `python scripts/build_data.py` → `python -m app.ml.train`.
5. Tests: `cd backend` → `python -m pytest -q` (19 pass hone chahiye).

Python 3.14 par numpy build error aaye to `requirements.txt` mein `>=` versions hi hain, `pip install -r requirements.txt` dobara chalao.

## What is real, what is not
| | Status | Detail |
|---|---|---|
| Timetable (88 trains) | REAL DATA | `IRCTC_cleaned.csv`, public dump, date unknown, **not NTES-verified** |
| Station delay statistics | REAL DATA | etrain.info 1-year aggregate scraped 2025-09-27 (public Kaggle dump). Aggregate, not day-by-day |
| XGBoost model (q10/q50/q90) | REAL DATA | trained on those statistics, evaluated on unseen services (see below) |
| Weather | LIVE | Open-Meteo, cached 10 min, stale fallback, never faked. Station coordinates: curated or geocoded (approximate) |
| Train position / live delay | SIMULATED | no public RTIS API; the UI slider and stop-click are the inputs |
| TSR, preceding train, weather override, disruption | SIMULATED | labelled rules (assumed constants, exposed at `/api/meta`) |

## The model, precisely
* **Predicts** the *typical delay at a station* for a train (target = real 1-year average), from: minutes since the
  true origin departure, share of journey, total journey time, train class, direction (odd/even number), hour of day.
* **Live delay propagation:** `predicted(j) = max(0, delay(j-1) + prior(j) − prior(j−1))`. The delay at the current stop is the
  (simulated) input; downstream stops add the model's expected extra delay between stops.
* **Evaluation** (`GET /api/eval`, GroupKFold by up/down train pair so a train's reverse direction never leaks):
  MAE **21.0 min vs 25.4 min** for a constant-median baseline (~18% lower); large gains for Vande Bharat, Shatabdi, Rajdhani;
  **no gain for Duronto**. P10–P90 coverage is **72%** against an 80% target, so ranges are somewhat optimistic. The UI shows this.
* **Not claimed:** a day-specific forecast, a calibrated interval, or verified timetables.

## API (all documented at /docs)
`GET /api/health` · `/api/meta` · `/api/trains` · `/api/schedule/{id}` · `/api/trains/{id}/stats` · `/api/eval` ·
`/api/weather/station/{code}` · `POST /api/predict` · `POST /api/cascade`

The API is **stateless**: scenario inputs travel in the `/api/cascade` request, so many people can use the deployed demo at once.

## Fallback chain
model priors + live delay → last valid weather (marked stale) → weather unavailable (not applied, never faked) → schedule only (no model files).

## Adding trains
Put both datasets' rows for the train into `data_raw/` and run `python scripts/build_data.py && python -m app.ml.train`.
No code change: the registry, UI list and model features are all data-driven.

## Editing the UI
`cd frontend && npm install && npm run dev` (proxies `/api` to localhost:8000). `npm run build` writes into `backend/app/static`.

## Deploy (free)
* **Render:** push this folder to GitHub → New Web Service → it reads `render.yaml`. Free tier sleeps after ~15 min idle:
  open the link once before the demo to warm it up.
* **Docker:** `docker build -t railpulse . && docker run -p 8000:8000 railpulse`.
* If the UI is hosted elsewhere, build it with `VITE_API_BASE=https://your-api` and set `RAILPULSE_CORS` on the API.

## Known limitations
Small data (~90 trains); 66 of the 88 trains have partial routes (only stops present in both datasets); zones are not available;
state thresholds (on time ≤5, minor ≤15 min) and weather/TSR/spill-over constants are assumptions; geocoded station
coordinates are approximate; the delay dataset was scraped from etrain.info — credit it and check its terms before commercial use.
