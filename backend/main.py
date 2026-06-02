from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Market Insights & Portfolio Analytics API",
    description="Backend API to fetch historical market data and compute portfolio performance",
    version="1.0.0"
)

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Portfolio configuration
TICKERS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"]
TICKER_NAMES = {
    "AAPL": "Apple Inc.",
    "MSFT": "Microsoft Corporation.",
    "GOOGL": "Alphabet Inc.",
    "AMZN": "Amazon.com Inc.",
    "NVDA": "NVIDIA Corporation"
}
INITIAL_PORTFOLIO_VALUE = 10000.0
RISK_FREE_RATE = 0.02  # 2% Risk-free rate for Sharpe Ratio

# Simple in-memory cache to speed up requests
cache = {
    "data": None,
    "last_fetched": None
}
CACHE_EXPIRY = timedelta(hours=6)

def fetch_and_process_data():
    global cache
    now = datetime.now()
    
    # Check cache validity
    if cache["data"] is not None and cache["last_fetched"] is not None:
        if now - cache["last_fetched"] < CACHE_EXPIRY:
            logger.info("Serving data from cache")
            return cache["data"]

    logger.info("Fetching 5 years of historical data from Yahoo Finance...")
    end_date = now.strftime("%Y-%m-%d")
    # Fetch 5 years of daily data
    start_date = (now - timedelta(days=5*365 + 10)).strftime("%Y-%m-%d")
    
    try:
        # Download data
        df_raw = yf.download(TICKERS, start=start_date, end=end_date)
        if df_raw.empty:
            raise HTTPException(status_code=500, detail="No data received from Yahoo Finance.")
        
        # Handle multi-level columns if necessary
        # yfinance returns multi-index columns: (Metric, Ticker)
        # We need the 'Adj Close' or 'Close'
        price_col = 'Adj Close' if 'Adj Close' in df_raw.columns.levels[0] else 'Close'
        prices_df = df_raw[price_col].copy()
        
        # Drop rows where any ticker has NaN (or forward fill to handle trading halts/different IPOs)
        prices_df = prices_df.ffill().bfill().dropna()
        
        if prices_df.empty:
            raise HTTPException(status_code=500, detail="Data cleaning resulted in an empty dataset.")

        # Ensure we have exactly 5 years of data (or take the last 5 years from what's available)
        # A 5-year trading period is roughly 1260 trading days
        prices_df = prices_df.sort_index()
        
        # Calculate daily returns
        daily_returns = prices_df.pct_change().dropna()
        
        # Normalize prices to start at 1.0 (to calculate cumulative returns)
        normalized_prices = prices_df / prices_df.iloc[0]
        
        # Equal-weighted portfolio logic
        num_assets = len(TICKERS)
        single_weight = 1.0 / num_assets
        weights = np.array([single_weight] * num_assets)
        
        # Growth of individual investments
        asset_values = normalized_prices * (INITIAL_PORTFOLIO_VALUE * single_weight)
        
        # Total portfolio value over time
        portfolio_values = asset_values.sum(axis=1)
        
        # Portfolio daily returns
        portfolio_daily_returns = portfolio_values.pct_change().dropna()
        
        # Process and compile metrics
        processed_data = {
            "prices_df": prices_df,
            "daily_returns": daily_returns,
            "normalized_prices": normalized_prices,
            "asset_values": asset_values,
            "portfolio_values": portfolio_values,
            "portfolio_daily_returns": portfolio_daily_returns
        }
        
        cache["data"] = processed_data
        cache["last_fetched"] = now
        logger.info("Successfully fetched and cached fresh market data.")
        return processed_data
        
    except Exception as e:
        logger.error(f"Error fetching data: {str(e)}")
        # If cache is available, fallback to it even if expired rather than failing
        if cache["data"] is not None:
            logger.warning("Error fetching data, using expired cache as fallback")
            return cache["data"]
        raise HTTPException(status_code=500, detail=f"Failed to fetch data from Yahoo Finance: {str(e)}")

def calculate_analytics(data):
    prices_df = data["prices_df"]
    asset_values = data["asset_values"]
    portfolio_values = data["portfolio_values"]
    portfolio_daily_returns = data["portfolio_daily_returns"]
    daily_returns = data["daily_returns"]
    
    # 1. Timeline details
    num_days = len(prices_df)
    years = num_days / 252.0  # standard trading days in a year
    
    # 2. Portfolio cumulative metrics
    initial_val = float(portfolio_values.iloc[0])
    final_val = float(portfolio_values.iloc[-1])
    total_return = (final_val / initial_val - 1) * 100
    
    # Annualized Return (CAGR)
    cagr = ((final_val / initial_val) ** (1 / years) - 1) * 100
    
    # Annualized Volatility
    volatility = float(portfolio_daily_returns.std() * np.sqrt(252)) * 100
    
    # Sharpe Ratio
    sharpe_ratio = float((cagr / 100 - RISK_FREE_RATE) / (volatility / 100))
    
    # Max Drawdown
    peaks = portfolio_values.cummax()
    drawdowns = (portfolio_values - peaks) / peaks
    max_drawdown = float(drawdowns.min()) * 100
    
    # 3. Individual Tickers metrics
    tickers_summary = []
    total_portfolio_gain = final_val - INITIAL_PORTFOLIO_VALUE
    
    for ticker in TICKERS:
        ticker_prices = prices_df[ticker]
        t_init = float(ticker_prices.iloc[0])
        t_final = float(ticker_prices.iloc[-1])
        t_total_return = (t_final / t_init - 1) * 100
        t_cagr = ((t_final / t_init) ** (1 / years) - 1) * 100
        
        t_daily = daily_returns[ticker]
        t_vol = float(t_daily.std() * np.sqrt(252)) * 100
        t_sharpe = float((t_cagr / 100 - RISK_FREE_RATE) / (t_vol / 100))
        
        # Contribution
        num_assets = len(TICKERS)
        single_weight = 1.0 / num_assets
        t_start_val = INITIAL_PORTFOLIO_VALUE * single_weight
        t_end_val = float(asset_values[ticker].iloc[-1])
        t_gain = t_end_val - t_start_val
        t_contrib_pct = (t_gain / total_portfolio_gain) * 100 if total_portfolio_gain > 0 else 0
        t_weight_end = (t_end_val / final_val) * 100
        
        tickers_summary.append({
            "ticker": ticker,
            "name": TICKER_NAMES[ticker],
            "initial_price": float(t_init),
            "final_price": float(t_final),
            "total_return": t_total_return,
            "annualized_return": t_cagr,
            "volatility": t_vol,
            "sharpe_ratio": t_sharpe,
            "weight_start": single_weight * 100,
            "weight_end": t_weight_end,
            "contribution_value": t_gain,
            "contribution_pct": t_contrib_pct
        })
        
    # 4. Chart historical compilation
    historical_chart = []
    # Resample daily data to weekly or pick every N days to keep chart loading super fast
    # but still high quality (e.g. step of 3 days, or all if we want high resolution)
    # 5 years of daily is ~1260 points. A step of 2 gives ~630 points, perfect for web rendering!
    step = 2
    indices = list(range(0, len(prices_df), step))
    if indices[-1] != len(prices_df) - 1:
        indices.append(len(prices_df) - 1)
        
    for idx in indices:
        date_str = prices_df.index[idx].strftime("%Y-%m-%d")
        item = {
            "date": date_str,
            "portfolio_val": float(portfolio_values.iloc[idx]),
            "portfolio_return": float((portfolio_values.iloc[idx] / initial_val - 1) * 100)
        }
        for ticker in TICKERS:
            item[f"{ticker}_price"] = float(prices_df[ticker].iloc[idx])
            item[f"{ticker}_return"] = float((data["normalized_prices"][ticker].iloc[idx] - 1) * 100)
            
        historical_chart.append(item)
        
    # 5. Dynamic portfolio insights
    best_asset = max(tickers_summary, key=lambda x: x["total_return"])
    worst_asset = min(tickers_summary, key=lambda x: x["total_return"])
    lowest_vol_asset = min(tickers_summary, key=lambda x: x["volatility"])
    
    insights = [
        f"🚀 **Top Performer**: **{best_asset['name']} ({best_asset['ticker']})** outperformed other assets with an outstanding total return of **{best_asset['total_return']:.1f}%**, contributing **{best_asset['contribution_pct']:.1f}%** to your total portfolio growth.",
        f"📉 **Laggard**: **{worst_asset['name']} ({worst_asset['ticker']})** had the slowest growth in the portfolio, finishing with a total return of **{worst_asset['total_return']:.1f}%**.",
        f"🛡️ **Diversification Benefit**: The portfolio's overall volatility (**{volatility:.1f}%**) was lower than its highest volatility component (**{max(t['volatility'] for t in tickers_summary):.1f}%**), demonstrating the risk-mitigation benefits of holding a diversified equal-weighted basket.",
        f"📈 **Risk-Adjusted Return**: Your equal-weighted portfolio achieved a **Sharpe Ratio of {sharpe_ratio:.2f}**, which represents a **{'strong' if sharpe_ratio >= 1.0 else 'moderate' if sharpe_ratio >= 0.5 else 'suboptimal'}** risk-adjusted return relative to the risk-free benchmark.",
        f"📊 **Asset Rebalancing Alert**: Due to varying growth rates, your portfolio has drifted from its original {100/len(TICKERS):.0f}% equal weighting. **{best_asset['ticker']}** is now the largest holding at **{best_asset['weight_end']:.1f}%**, while **{worst_asset['ticker']}** is the smallest at **{worst_asset['weight_end']:.1f}%**. Rebalancing back to {100/len(TICKERS):.0f}% weights would lock in profits and reduce concentration risk.",
        f"📉 **Maximum Drawdown**: The portfolio experienced a maximum peak-to-trough drawdown of **{max_drawdown:.1f}%** over the 5-year period, representing the historical tail risk during market corrections."
    ]

    return {
        "summary": {
            "initial_value": INITIAL_PORTFOLIO_VALUE,
            "final_value": final_val,
            "total_return": total_return,
            "annualized_return": cagr,
            "volatility": volatility,
            "sharpe_ratio": sharpe_ratio,
            "max_drawdown": max_drawdown
        },
        "tickers_summary": tickers_summary,
        "historical": historical_chart,
        "insights": insights
    }

@app.get("/api/portfolio")
def get_portfolio_analytics():
    try:
        data = fetch_and_process_data()
        analytics = calculate_analytics(data)
        return analytics
    except Exception as e:
        logger.error(f"Error serving portfolio analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
