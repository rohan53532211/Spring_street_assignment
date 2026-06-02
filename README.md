# 📊 Market Insights & Portfolio Analytics Dashboard

Welcome to the **Spring Street - Full Stack Internship Assignment**! This repository hosts a premium, production-grade Market Insights & Portfolio Analytics Dashboard built with a **Python FastAPI backend** and a **React + Vite frontend**.

It visualizes and analyzes a 5-year equal-weighted portfolio consisting of 4 high-growth technology and corporate assets:
- 🍏 **AAPL** (Apple Inc.)
- 💻 **MSFT** (Microsoft Corporation)
- 🔍 **GOOGL** (Alphabet Inc.)
- 📦 **AMZN** (Amazon.com Inc.)

---

## 🚀 Key Features

1. **High-Fidelity Visual Interface**: Curated dark theme using HSL colors, premium typography (Outfit & JetBrains Mono), glassmorphism cards (`backdrop-filter`), subtle glowing neon shadows, and smooth micro-animations.
2. **Comprehensive Portfolio Metrics**: Instantly computes Portfolio Value, Cumulative Total Return (ROI), Compound Annual Growth Rate (CAGR), Annualized Risk (Volatility), and the Sharpe Ratio.
3. **Interactive Visualizations**:
   - **Portfolio Growth Chart**: A glowing, detailed Recharts area chart showing the compounding growth of a hypothetical $10,000 investment over 5 years.
   - **Returns Comparer**: Multi-line chart tracking and comparing individual cumulative daily asset returns.
   - **Timeframe Toggles**: Support for `1Y`, `3Y`, and `5Y` historical performance slicing.
4. **Interactive Asset Deep-Dives**:
   - Double-donut distribution chart representing the **initial 25% equal weighting** vs. the **current drifted weights** due to varying market growth.
   - Clickable stock allocation rows with custom progress bars representing each stock's absolute gain contribution.
   - **Deep-Dive Analyst Panel**: Smooth scrolling individual stock area price charts and detailed metrics grids (ROI, CAGR, Volatility, Sharpe Ratio, absolute dollar gain).
5. **AI-Powered Portfolio Insights**: Generates dynamically calculated financial insights, risk mitigation benefits, and critical rebalancing alerts.
6. **Performance & Reliability**: Features an intelligent **in-memory data caching system** that prevents API rate limits and loads the dashboard in milliseconds.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Recharts (Vector SVG Charting), Lucide React (Sleek vector icons), Vanilla CSS (Custom styling system with modern custom properties).
- **Backend**: Python 3.14+, FastAPI (Async REST API framework), Uvicorn (ASGI server), Pandas, NumPy, yfinance (Yahoo Finance market data client).

---

## ⚙️ Local Setup & Run Instructions

This application is split into two cleanly structured folders: `backend` and `frontend`.

### 1. Run the FastAPI Backend Server
The Python backend manages downloading the daily market data, computing matrix indices, calculating portfolios, and exposing the REST endpoints.

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install required dependencies
pip install -r requirements.txt

# Start the development server using Uvicorn
uvicorn main:app --reload --port 8000
```
*The backend API will be live at `http://127.0.0.1:8000`. You can visit `http://127.0.0.1:8000/docs` to view the interactive Swagger REST documentation.*

### 2. Run the React Frontend Development Server
The React frontend handles user actions, responsive grids, animations, and premium rendering of analytics.

```bash
# Navigate to the frontend directory
cd ../frontend

# Install package dependencies
npm install

# Start the Vite development server
npm run dev
```
*The frontend application will be active at `http://localhost:5173/`.*

---

## 📐 Portfolio Analytics Math & Calculations

- **Portfolio Growth**: Standardizes start prices to $1.0$ at the initial period. The growth of a stock $i$ with initial weight $0.25$ is calculated as:
  $$V_{i, t} = 2500 \times \frac{Price_{i, t}}{Price_{i, 0}}$$
  The overall portfolio value is the sum of individual asset holdings:
  $$P_t = \sum_{i=1}^{4} V_{i, t}$$
- **Total ROI (Return on Investment)**:
  $$ROI = \left(\frac{P_{ending}}{P_{initial}} - 1\right) \times 100$$
- **Annualized Return (CAGR)**:
  $$CAGR = \left[\left(\frac{P_{ending}}{P_{initial}}\right)^{\frac{1}{Years}} - 1\right] \times 100$$
  *Where $Years = \frac{\text{Trading Days}}{252}$ to ensure exact historical time representation.*
- **Annualized Volatility (Risk)**:
  $$\text{Volatility} = \sigma_{daily} \times \sqrt{252} \times 100$$
- **Sharpe Ratio**: Represents the excess return earned per unit of risk, assuming a risk-free rate ($R_f$) of 2%:
  $$\text{Sharpe Ratio} = \frac{CAGR - R_f}{\text{Volatility}}$$
- **Asset Weight Drift & Absolute Contribution**:
  $$\text{Ending Weight } W_{i, T} = \frac{V_{i, T}}{P_T} \times 100$$
  $$\text{Dollar Gain } C_{i} = V_{i, T} - 2500$$
  $$\text{Contribution Share \%} = \frac{C_i}{P_T - P_0} \times 100$$

---

## 💡 Key Market Insights & Observations

- **Asset Weight Drift**: Over a 5-year period, holding stocks without rebalancing leads to substantial weight drift. Outperforming stocks become disproportionately large, increasing overall portfolio concentration risk.
- **Volatility Reduction**: The portfolio's volatility is consistently lower than the volatility of its highest-risk components (e.g., AMZN or AAPL), highlighting the powerful diversification benefit of holding non-perfectly correlated assets.
- **Risk-Adjusted Performance**: The Sharpe Ratio provides a clear standard of whether risk-taking was appropriately compensated. A diversified equal-weight portfolio of megacap tech giants historically yields robust risk-adjusted gains.
