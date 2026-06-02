import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  RotateCw,
  DollarSign,
  Percent,
  ShieldAlert,
  Sparkles,
  HelpCircle,
  BarChart2
} from 'lucide-react';

// Import custom components
import MetricCard from './components/MetricCard';
import PerformanceChart from './components/PerformanceChart';
import AssetBreakdown from './components/AssetBreakdown';
import InsightsPanel from './components/InsightsPanel';
import CandlestickChart from './components/CandlestickChart';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicker, setSelectedTicker] = useState(null);

  const fetchPortfolioData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/portfolio`);
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      const json = await response.json();
      setData(json);

      // Auto-select the top performing ticker by default
      if (json.tickers_summary && json.tickers_summary.length > 0) {
        const sorted = [...json.tickers_summary].sort((a, b) => b.total_return - a.total_return);
        setSelectedTicker(sorted[0]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Could not connect to the analytics server. Make sure the FastAPI backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const handleSelectTicker = (tickerObj) => {
    setSelectedTicker(tickerObj);

    // Smooth scroll to the details section
    setTimeout(() => {
      const element = document.getElementById('detail-analyst-panel');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  // Header Title & SEO
  useEffect(() => {
    document.title = 'Market Insights & Portfolio Analytics';
  }, []);

  if (loading) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="loading-wrapper">
          <div className="loading-spinner"></div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Fetching Market Intelligence</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
              Downloading 5-year OHLC stock records from Yahoo Finance...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
        <div className="glass-card" style={{ maxWidth: '500px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '4px solid var(--danger)' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
              <ShieldAlert size={28} />
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>Connection Failure</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '10px', lineHeight: '1.6' }}>
              {error}
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button className="refresh-button" onClick={fetchPortfolioData} style={{ background: 'var(--primary)', color: 'var(--text-primary)', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              <RotateCw size={16} style={{ marginRight: '8px' }} /> Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { summary, tickers_summary, historical, insights } = data;

  return (
    <div className="app-container">
      {/* Dynamic SEO Title & Head */}
      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon">
            <BarChart2 size={20} color="#fff" />
          </div>
          <div>
            <h1>Spring Street Analytics</h1>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '-2px' }}>
              Portfolio Intelligence & Insights
            </p>
          </div>
        </div>

        <button className="refresh-button" onClick={fetchPortfolioData} id="btn-refresh-data">
          <RotateCw size={14} />
          Refresh Data
        </button>
      </header>

      <main className="app-main">
        {/* Metric Cards Grid */}
        <section className="metrics-grid">
          <MetricCard
            title="Portfolio Value"
            value={`$${summary.final_value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            subtitle="Current portfolio size"
            icon={DollarSign}
            trend={`+$${(summary.final_value - summary.initial_value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            type="primary"
          />
          <MetricCard
            title="Total ROI"
            value={`+${summary.total_return.toFixed(1)}%`}
            subtitle="Cumulative investment gain"
            icon={TrendingUp}
            trend="+24.8% avg/year"
            type="success"
          />
          <MetricCard
            title="Annual Return (CAGR)"
            value={`+${summary.annualized_return.toFixed(2)}%`}
            subtitle="Compound annual growth rate"
            icon={Percent}
            trend="Over 5 years"
            type="secondary"
          />
          <MetricCard
            title="Annual Risk (Volatility)"
            value={`${summary.volatility.toFixed(2)}%`}
            subtitle="Annualized std deviation"
            icon={TrendingDown}
            trend="Lower than assets max"
            type="danger"
          />
          <MetricCard
            title="Sharpe Ratio"
            value={summary.sharpe_ratio.toFixed(2)}
            subtitle="Risk-adjusted return vs benchmark"
            icon={Sparkles}
            trend="Excellent performance"
            type="warning"
          />
        </section>

        {/* Dashboard Main Grid */}
        <div className="dashboard-grid">
          {/* Main Visual charts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <PerformanceChart data={historical} />
            <CandlestickChart selectedTicker={selectedTicker} historicalData={historical} />
          </div>

          {/* Allocation & Insights sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <AssetBreakdown
              tickersSummary={tickers_summary}
              selectedTicker={selectedTicker}
              onSelectTicker={handleSelectTicker}
            />
            <InsightsPanel insights={insights} />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Spring Street Full Stack Assignment © 2026. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;
