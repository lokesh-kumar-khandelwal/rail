# Real-Time Telemetry & Route-Wide Weather Intelligence Engine

A comprehensive upgrade to the Indian Railways predictive arrival platform, introducing an interactive real-time GPS playback simulation with speed profile dynamics and route-wide Open-Meteo weather impact telemetry across all scheduled route stations.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were selected during interactive clarification and form the operational baseline for this upgrade:

- **Confirmed Decision 1 (Core Focus)**: Implement a full live telemetry and real-time tracking engine with continuous train progression, section dwell times, and instant ETA recomputations.
- **Confirmed Decision 2 (Weather Intelligence)**: Expand Open-Meteo integration from single-station (Kota) to route-wide weather impact telemetry across key corridor stations (Mumbai Central, Vadodara, Ratlam, Kota, Hazrat Nizamuddin/New Delhi), computing weather-induced track friction and rain speed caps.
- **Confirmed Decision 3 (Simulation Engine)**: Real-time GPS playback with dynamic speed profiles (MPS 130/160 km/h limits, TSR caution orders, actual rolling-stock acceleration/braking curves) and an interactive scrubbable playback controller (1×, 2×, 5× speed).

---

## 1. Overview & Core Concept

### What It Does
Transforms the static forecast display into an interactive, operational dispatcher & passenger digital twin:
1. **Live GPS Playback Engine**: An interactive playback controller allowing users to simulate real-time train movement between stations, displaying live speed, kilometer markers, block section occupancy, and signal aspects.
2. **Dynamic Speed Profile & Caution Orders**: A telemetry graph mapping permissible section speed vs. actual speed, visualizing real-time speed drops caused by TSR (Temporary Speed Restrictions) and weather.
3. **Route-Wide Open-Meteo Weather Corridor**: Live multi-point weather polling for all route nodes with rain/fog impact ratings, ambient temperature, wind gusts, and adhesion coefficients fed into the XGBoost arrival predictor.
4. **Light-Theme Engineering Blueprint**: Maintains the crisp, high-contrast light theme (`#FFFFFF` surfaces, `#F8FAFC` canvas, `#0F172A` high-contrast typography, `#F97316` and `#2563EB` signal accents) with zero-pill typography and tabular metric alignments.

### Target Audience & Persona
- **Section Controllers & Dispatchers**: Need sub-minute awareness of cascading headway delays, section clearance, and weather bottlenecks.
- **Station Managers & Passenger Information Staff**: Need dependable, honest arrival forecasts rather than static scheduled timetables.
- **Rail Enthusiasts & Engineers**: Appreciate transparent physics-grounded telemetry, GPS coordinates, and real atmospheric data.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Live Corridor Monitoring**: User views the train journey with a continuous GPS progress marker moving between stations on the route strip.
2. **Speed & Section Telemetry Inspection**: User toggles the speed profile viewer to inspect current velocity (e.g. 118 km/h), maximum permissible speed (130 km/h), and upcoming TSR zones.
3. **Route Weather Audit**: User switches to or inspects the corridor weather panel, viewing synchronized live Open-Meteo readings for MMCT, BRC, RTM, KOTA, and NZM with weather friction status badges.
4. **Simulation Playback & Disruption Testing**: User controls playback (Play/Pause, 1×/2×/5×, scrub position) or toggles severe weather / preceding delay to watch downstream ETAs recalculate live with animated confidence intervals.

### Visual Identity & Theme Tokens
- **Canvas & Background**: `#F8FAFC` (Slate-50) soft engineering backdrop with crisp `#FFFFFF` elevation surfaces and `#E2E8F0` micro-borders.
- **Typography**: Display sans (`Plus Jakarta Sans` / `Outfit`) for headers; strict monospace tabular figures (`JetBrains Mono` / `font-mono`) for speeds, timestamps, station codes, and coordinate decimals.
- **Accent Palette**:
  - `Rail Amber / Orange`: `#F97316` for key train markers and warning caution orders.
  - `Signal Green`: `#10B981` for clear signals and on-time variance.
  - `Telemetry Blue`: `#2563EB` for live Open-Meteo weather syncing and GPS lock.
  - `Caution / Delay Red`: `#EF4444` for TSR zones and severe weather restrictions.
- **Zero-Pill Discipline**: Status indicators use clean typography with colored status dots (`inline-flex items-center gap-1.5 text-xs font-mono font-medium`) rather than bulky bubble capsules.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Client-Side Multi-Station Weather Batching
- **Chosen Approach**: Query Open-Meteo's batch coordinates endpoint or parallel lightweight fetches for the 5 corridor stations, with a 5-minute memory cache and offline fallback.
- **Why**: Keeps telemetry 100% live without API keys, zero rate-limiting risk, and provides instant route-wide atmospheric condition awareness.
- **Alternatives Considered**: Polling only single station (Kota) was limited; server proxy was unnecessary since Open-Meteo is CORS-friendly and public.

### Decision 2: Physics-Based GPS & Speed Interpolation
- **Chosen Approach**: A high-efficiency `requestAnimationFrame` and interval clock computing train progress, calculating realistic deceleration curves when approaching caution orders or scheduled halts.
- **Why**: Delivers a silky smooth 60fps simulation experience that dispatcher tools use, avoiding jumpy progress bars.
- **Alternatives Considered**: Discrete step jumping felt artificial and didn't allow speed profiling.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          User Interface Canvas                         │
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────────────────────┐  │
│  │   Train Service Bar   │  │  Live Telemetry GPS Playback Bar      │  │
│  │  (12951, 12009, 22436)│  │  [Play/Pause] [1x|2x|5x] [Scrubber]   │  │
│  └──────────┬────────────┘  └──────────────────┬────────────────────┘  │
│             │                                  │                       │
│             ▼                                  ▼                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Live Cockpit / Dispatch View                  │  │
│  │  ┌─────────────────────────┐   ┌──────────────────────────────┐  │  │
│  │  │ Route Strip + Station   │   │ Real-time Speed Profile      │  │  │
│  │  │ Nodes & Distance Mark   │   │ (Current km/h vs MPS & TSR)  │  │  │
│  │  └─────────────────────────┘   └──────────────────────────────┘  │  │
│  │  ┌─────────────────────────┐   ┌──────────────────────────────┐  │  │
│  │  │ Route Weather Corridor  │   │ Downstream ETA Forecast      │  │  │
│  │  │ (Multi-station Meteo)   │   │ with Confidence Intervals    │  │  │
│  │  └─────────────────────────┘   └──────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼                                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────────┐
│   Open-Meteo REST Service     │   │      Physics & ML Engine          │
│   (MMCT, BRC, RTM, KOTA, NZM) │   │  - Kinematic Speed Profiler       │
│   - Temperature & Rain Code   │   │  - Track Adhesion Index           │
│   - Wind Speed & Visibility   │   │  - Dynamic ETA Re-computation     │
│   - In-memory 5-minute cache  │   │  - Live Telemetry Log Generator   │
└───────────────────────────────┘   └───────────────────────────────────┘
```

### Component Hierarchy & Module Breakdown
1. `src/utils/weather.ts`: Multi-station coordinates dictionary and batch Open-Meteo fetcher with weather-to-friction translation.
2. `src/utils/telemetryEngine.ts`: Kinematic progress engine calculating position, speed between stations, caution zones, and ETA variance.
3. `src/components/telemetry/SpeedProfileGraph.tsx`: SVG/Canvas visualizer showing speed curve against MPS ceiling and TSR restrictions.
4. `src/components/telemetry/RouteWeatherCorridor.tsx`: High-density live weather matrix comparing temperatures, precipitation, and track adhesion across route stops.
5. `src/components/telemetry/GpsPlaybackController.tsx`: Control deck for scrub, play/pause, simulation speed, and manual coordinate injection.
6. `src/components/CockpitDashboard.tsx`: Integrated layout housing the speed graph, corridor weather, predicted arrival hero, and recalculation logs.

### Verification & Validation Plan
- **Multi-Station Open-Meteo Verification**: Confirm live network requests succeed for Mumbai, Vadodara, Ratlam, Kota, and Delhi stations with valid temperature and weather descriptions.
- **Simulation Playback Verification**: Test Play, Pause, Scrubber, and 1×/2×/5× playback rate transitions, ensuring smooth progress bar advancement.
- **Responsive & Design Review**: Verify WCAG contrast, tabular numeral alignments, zero clipped elements on 1440px and mobile viewports.
- **Build Verification**: Run `compile_applet` and check zero TypeScript errors.
