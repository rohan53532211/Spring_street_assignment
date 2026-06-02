import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Percent, Shield, Award, HelpCircle } from 'lucide-react';

const CandlestickChart = ({ selectedTicker, historicalData }) => {
  if (!selectedTicker) {
    return (
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '430px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <HelpCircle size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
        <h3 style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>No Asset Selected</h3>
        <p style={{ fontSize: '13px', maxWidth: '300px', marginTop: '6px' }}>
          Select any stock in the allocation panel above to load deep-dive historical price insights.
        </p>
      </div>
    );
  }

  // Ticker styling
  const COLORS = {
    AAPL: '#a3a3a3',
    MSFT: '#3b82f6',
    GOOGL: '#eab308',
    AMZN: '#f97316'
  };
  const tickerColor = COLORS[selectedTicker.ticker] || 'var(--primary)';

  // Prepare chart data for this specific ticker
  const chartData = useMemo(() => {
    if (!historicalData) return [];
    return historicalData.map(h => ({
      date: h.date,
      price: h[`${selectedTicker.ticker}_price`],
      returns: h[`${selectedTicker.ticker}_return`]
    }));
  }, [historicalData, selectedTicker]);

  // Format date
  const formatDate = (tickItem) => {
    try {
      const date = new Date(tickItem);
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    } catch (e) {
      return tickItem;
    }
  };

  // Custom tooltips
  const CustomPriceTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <div className="tooltip-date">
            {new Date(payload[0].payload.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <div className="tooltip-item">
            <span className="tooltip-item-label">Price:</span>
            <span className="tooltip-item-value" style={{ color: tickerColor }}>
              ${payload[0].value.toFixed(2)}
            </span>
          </div>
          <div className="tooltip-item">
            <span className="tooltip-item-label">Growth:</span>
            <span className="tooltip-item-value" style={{ color: payload[0].payload.returns >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {payload[0].payload.returns >= 0 ? '+' : ''}{payload[0].payload.returns.toFixed(1)}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card" id="detail-analyst-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: `rgba(${tickerColor === '#a3a3a3' ? '163,163,163' : tickerColor === '#3b82f6' ? '59,130,246' : tickerColor === '#eab308' ? '234,179,8' : '249,115,22'}, 0.15)`,
              color: tickerColor,
              padding: '4px 8px',
              borderRadius: '6px',
              fontWeight: '700',
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              border: `1px solid rgba(${tickerColor === '#a3a3a3' ? '163,163,163' : tickerColor === '#3b82f6' ? '59,130,246' : tickerColor === '#eab308' ? '234,179,8' : '249,115,22'}, 0.3)`
            }}>
              {selectedTicker.ticker}
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: '600' }}>{selectedTicker.name}</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            5-Year historical price performance and growth metrics
          </p>
        </div>
      </div>

      {/* Main body */}
      <div className="detail-panel">
        {/* Left: Mini Area Chart */}
        <div style={{ height: '280px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${selectedTicker.ticker}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={tickerColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={tickerColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.02)" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate} 
                stroke="var(--text-muted)" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              <YAxis 
                stroke="var(--text-muted)" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomPriceTooltip />} />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke={tickerColor} 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill={`url(#gradient-${selectedTicker.ticker})`} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Right: Key Stats */}
        <div className="stat-grid">
          <div className="stat-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '4px' }}>
              <span className="stat-box-label">5Y CAGR (Compound Growth)</span>
              <TrendingUp size={14} style={{ color: 'var(--primary)' }} />
            </div>
            <span className="stat-box-value trend-up">
              +{selectedTicker.annualized_return.toFixed(2)}%
            </span>
          </div>

          <div className="stat-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '4px' }}>
              <span className="stat-box-label">Total Return (ROI)</span>
              <Percent size={14} style={{ color: 'var(--secondary)' }} />
            </div>
            <span className="stat-box-value trend-up">
              +{selectedTicker.total_return.toFixed(1)}%
            </span>
          </div>

          <div className="stat-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '4px' }}>
              <span className="stat-box-label">Annualized Risk (Volatility)</span>
              <Shield size={14} style={{ color: 'var(--danger)' }} />
            </div>
            <span className="stat-box-value" style={{ color: 'var(--text-primary)' }}>
              {selectedTicker.volatility.toFixed(2)}%
            </span>
          </div>

          <div className="stat-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '4px' }}>
              <span className="stat-box-label">Sharpe Ratio</span>
              <Award size={14} style={{ color: 'var(--warning)' }} />
            </div>
            <span className="stat-box-value" style={{ color: selectedTicker.sharpe_ratio >= 1.0 ? 'var(--success)' : selectedTicker.sharpe_ratio >= 0.5 ? 'var(--warning)' : 'var(--text-primary)' }}>
              {selectedTicker.sharpe_ratio.toFixed(2)}
            </span>
          </div>

          <div className="stat-box" style={{ gridColumn: 'span 2' }}>
            <span className="stat-box-label">Absolute Value Contribution</span>
            <span className="stat-box-value" style={{ color: 'var(--success)', fontSize: '20px', marginTop: '4px' }}>
              +${selectedTicker.contribution_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px', fontWeight: '400' }}>
                ({selectedTicker.contribution_pct.toFixed(1)}% of portfolio gains)
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandlestickChart;
