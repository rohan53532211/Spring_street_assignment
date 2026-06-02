import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const AssetBreakdown = ({ tickersSummary, selectedTicker, onSelectTicker }) => {
  if (!tickersSummary || tickersSummary.length === 0) return null;

  // Colors mapping for the charts and badges
  const COLORS = {
    AAPL: '#a3a3a3', // Slate
    MSFT: '#3b82f6', // Blue
    GOOGL: '#eab308', // Gold
    AMZN: '#f97316', // Orange
    NVDA: '#10b981'  // Emerald Green
  };

  // Outer pie: Ending allocations
  const endingData = tickersSummary.map(t => ({
    name: t.ticker,
    value: t.weight_end,
    color: COLORS[t.ticker]
  }));

  // Inner pie: Starting allocations (divided equally)
  const startingData = tickersSummary.map(t => ({
    name: t.ticker,
    value: 100 / tickersSummary.length,
    color: COLORS[t.ticker]
  }));

  // Custom Pie Tooltip
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isEnding = payload[0].name === 'Ending Weight';
      return (
        <div className="custom-tooltip">
          <div className="tooltip-date" style={{ color: data.color, fontWeight: '700' }}>
            {data.name} Allocation
          </div>
          <div className="tooltip-item">
            <span className="tooltip-item-label">Weight:</span>
            <span className="tooltip-item-value" style={{ color: '#fff' }}>
              {payload[0].value.toFixed(1)}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Asset Allocation & Performance</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          Compare initial equal-weights (inner ring) vs current drift weights (outer ring). Click an asset for detail analysis.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', alignItems: 'center' }}>
        {/* Left: Donut Chart */}
        <div style={{ height: '240px', width: '100%', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* Inner ring: Initial Weight (25% each) */}
              <Pie
                data={startingData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                name="Initial Weight"
              >
                {startingData.map((entry, index) => (
                  <Cell key={`cell-inner-${index}`} fill={entry.color} opacity={0.4} />
                ))}
              </Pie>
              {/* Outer ring: Current Weight (Drifted) */}
              <Pie
                data={endingData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={76}
                outerRadius={96}
                paddingAngle={2}
                name="Ending Weight"
              >
                {endingData.map((entry, index) => (
                  <Cell key={`cell-outer-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Portfolio</span>
            <br />
            <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Drift</span>
          </div>
        </div>

        {/* Right: Stocks List */}
        <div className="tickers-list">
          {tickersSummary.map((t) => {
            const badgeClass = `ticker-badge ${t.ticker.toLowerCase()}`;
            const isSelected = selectedTicker && selectedTicker.ticker === t.ticker;
            
            return (
              <div 
                key={t.ticker}
                className={`ticker-row ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectTicker(t)}
                id={`ticker-row-${t.ticker.toLowerCase()}`}
              >
                <div className={badgeClass}>{t.ticker}</div>
                <div className="ticker-info">
                  <span className="ticker-name">{t.name.split(' ')[0]}</span>
                  <span className="ticker-fullname">Weight: {t.weight_end.toFixed(1)}%</span>
                  {/* Performance horizontal bar */}
                  <div className="ticker-weight-bar">
                    <div 
                      className="ticker-weight-fill" 
                      style={{ 
                        width: `${t.contribution_pct}%`,
                        background: COLORS[t.ticker]
                      }} 
                    />
                  </div>
                </div>
                <div className="ticker-performance">
                  <div className={t.total_return >= 0 ? "trend-up" : "trend-down"}>
                    {t.total_return >= 0 ? '+' : ''}{t.total_return.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right' }}>
                    ROI (5Y)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AssetBreakdown;
