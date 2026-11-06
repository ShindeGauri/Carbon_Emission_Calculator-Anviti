# Anviti — Carbon Footprint Monitoring

> **From Carbon Calculation to Carbon Intelligence**  
> An editorial climate-analytics web application that empowers individuals and households to measure, understand, and reduce their lifestyle greenhouse gas emissions.

---

## 1. Project Workflow

```
   MEASURE                     UNDERSTAND                       ACT                       REDUCE
[ Activity Input ]  ───►  [ Carbon Dashboard ]  ───►  [ Action Recommendations ]  ───►  [ What-If Simulator ]
 Transport, Energy,       Total kg CO₂e, Donut,       Quantified, rule-based             Test scenarios and
 Diet & Consumption       Category Hotspot            mitigation pathways                track trend changes
```

---

## 2. Core Features

1. **Public Landing Page & Welcoming Experience:**
   - Thoughtfully crafted homepage for visitors: *"Small changes. A lighter footprint."*
   - Explains the four-step process (Measure, Understand, Improve, Track) in clear everyday language.
   - Highlights core features, why Anviti is different, and transparent methodology.
   - Provides smooth access to registration, sign-in, and interactive preview modes.

2. **Functional Carbon Calculator:**
   - Input forms for Transportation (mode & distance in km), Electricity (kWh usage with billing frequency), Food (dietary patterns), and Goods & Consumption.
   - Transparent emission factor calculations based on official DEFRA, Indian Central Electricity Authority (CEA: 0.71 kg CO₂e/kWh), and Poore & Nemecek lifecycle datasets.
   - Comprehensive input validation and inline error messaging.

2. **Carbon Dashboard:**
   - Total estimated emissions in kg CO₂e with annualized pacing.
   - Interactive custom SVG Donut breakdown with percentage share legend.
   - 4 Category summary cards with visual progress bars.
   - 80 kg weekly target benchmark aligned with global 1.5°C lifestyle pathways.
   - Primary **Emission Hotspot** card with qualitative intensity evaluation.

3. **Hotspot Detection & Targeted Action Plan:**
   - Automatically identifies the dominant emission driver.
   - Generates practical, evidence-based recommendations with quantified weekly CO₂e reduction estimates.
   - Completely transparent and deterministic (no fake AI claims).

4. **Saved History & Progress Tracking:**
   - Chronological check-in log and visual emissions trajectory chart.
   - Period-over-period comparison card calculating net change in kg and percentage trajectory.
   - Strict data honesty: displays an informational prompt when only 1 record exists instead of fabricating trends.

5. **Interactive What-If Scenario Simulator:**
   - Real-time sandbox allowing users to model changes (e.g., swapping car commutes for transit or shifting diets).
   - Side-by-side comparison scorecards and dual-bar category comparisons.

6. **Natural Sustainability Visual Identity:**
   - Warm off-white / light cream background (`#F9F8F5`), deep forest green primary (`#1A3A2A`), muted sage accents, and charcoal typography.
   - Clean, purposeful icons powered by Lucide React.
   - Fully responsive on mobile, tablet, and desktop devices.

---

## 3. Quick Start & Running the Project

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### 1. Install Dependencies
```powershell
npm.cmd install
```

### 2. Start the Development Server
```powershell
npm.cmd run dev
```
Open your browser at `http://localhost:5173`.

### 3. Build for Production & Lint Check
```powershell
npm.cmd run lint    # Runs Oxlint (0 errors, 0 warnings)
npm.cmd run build   # Generates optimized production build in /dist
```

---

## 4. Supabase Setup Guide

Anviti includes a complete cloud persistence layer using the official `@supabase/supabase-js` client.

> **Note:** If Supabase credentials are not configured, Anviti automatically and gracefully falls back to `localStorage` and clearly identified sample demo data so the app remains fully functional.

### Steps to Connect Your Supabase Database:

1. **Create a Supabase Project:**
   - Go to [https://supabase.com](https://supabase.com) and create a free project.

2. **Configure Environment Variables:**
   - Copy `.env.example` to a new file named `.env`:
     ```powershell
     Copy-Item .env.example .env
     ```
   - In `.env`, add your Supabase URL and Anon Key:
     ```env
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_ANON_KEY=your-actual-anon-key
     ```

3. **Execute Database Schema:**
   - Open your project on [supabase.com](https://supabase.com).
   - Navigate to the **SQL Editor** tab.
   - Copy the entire contents of [`supabase/schema.sql`](file:///C:/Users/Admin/OneDrive/Desktop/pccoe/supabase/schema.sql) and click **Run**.
   - This creates:
     - `profiles` table with automatic user signup trigger.
     - `footprint_records` table with relationships, constraints, and timestamps.
     - Row Level Security (RLS) policies ensuring users can only read and write their own records.

4. **Restart Vite Server:**
   ```powershell
   npm.cmd run dev
   ```
   The navbar badge will switch to a green dot reading **"Supabase Live"**. You can now sign up, log in, and sync records across devices!

---

## 5. Methodology & Transparent Emission Factors

| Category | Parameter | Sample Emission Factor | Reference Source |
| :--- | :--- | :--- | :--- |
| **Petrol Car** | Per km driven | `0.192 kg CO₂e / km` | UK DEFRA Average Passenger Car |
| **Diesel Car** | Per km driven | `0.171 kg CO₂e / km` | UK DEFRA Passenger Diesel |
| **Electric Car** | Per km driven | `0.053 kg CO₂e / km` | Grid battery lifecycle charging |
| **Bus Transit** | Per passenger-km | `0.105 kg CO₂e / km` | Average occupancy public transit |
| **Train / Metro** | Per passenger-km | `0.041 kg CO₂e / km` | Electric commuter rail transit |
| **Bicycle / Walk**| Per km | `0.000 kg CO₂e / km` | Active transport baseline |
| **Grid Power** | Per kWh electricity | `0.710 kg CO₂e / kWh` | Central Electricity Authority (India) |
| **Meat-Heavy Diet**| Per meal (14/wk) | `2.500 kg CO₂e / meal`| Poore & Nemecek (2018) |
| **Mixed Omnivore** | Per meal (14/wk) | `1.700 kg CO₂e / meal`| Poore & Nemecek (2018) |
| **Vegetarian Diet**| Per meal (14/wk) | `1.000 kg CO₂e / meal`| Poore & Nemecek (2018) |
| **Vegan Diet** | Per meal (14/wk) | `0.700 kg CO₂e / meal`| Poore & Nemecek (2018) |
| **Clothing** | Per garment | `10.00 kg CO₂e` | Cradle-to-gate embodied textile |
| **Electronics**| Small / Large items | `50 to 300 kg CO₂e` | Lifecycle manufacturing factor |

---

## 6. Audit & Status

For a full technical audit and status of all features, see [`IMPLEMENTATION_STATUS.md`](file:///C:/Users/Admin/OneDrive/Desktop/pccoe/IMPLEMENTATION_STATUS.md).
