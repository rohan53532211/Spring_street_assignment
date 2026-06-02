import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const PerformanceChart = ({ data }) => {
  const [chartType, setChartType] = useState('portfolio'); // 'portfolio' or 'comparison'
  const [timeframe, setTimeframe] = useState('5Y'); // '1Y', '3Y', '5Y'

  // Filter data based on timeframe
  const filteredData = useMemo(() => {
    if (!data) return [];
    
    // Total days in the step-resampled dataset is about 630 points
    const totalPoints = data.length;
    let slicePoints = totalPoints;
    
    if (timeframe === '1Y') {
      slicePoints = Math.min(totalPoints, 126); // roughly 252 trading days / step 2
    } else if (timeframe === '3Y') {
      slicePoints = Math.min(totalPoints, 378); // roughly 3 * 252 / 2
    }
    
    return data.slice(totalPoints - slicePoints);
  }, [data, timeframe]);

  // Format dates for X axis (e.g., "Jun 2021")
  const formatDate = (tickItem) => {
    try {
      const date = new Date(tickItem);
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    } catch (e) {
      return tickItem;
    }
  };

  // Custom Tooltip component
  const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const date = new Date(label).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      return (
        <div className="custom-tooltip">
          <div className="tooltip-date">{date}</div>
          {payload.map((item, idx) => {
            const isPortfolio = item.name === 'Portfolio Value';
            const valueFormatted = isPortfolio 
              ? `$${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : `${item.value.toFixed(2)}%`;
              
            return (
              <div key={idx} className="tooltip-item">
                <span className="tooltip-item-label" style={{ color: item.stroke || item.fill }}>
                  {item.name}:
                </span>
                <span className="tooltip-item-value" style={{ color: '#fff' }}>
                  {valueFormatted}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card chart-container" id="performance-chart-container">
      <div className="chart-header">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Historical Performance</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            {chartType === 'portfolio' 
              ? 'Growth of a hypothetical $10,000 equal-weighted portfolio' 
              : 'Cumulative returns comparison against individual tickers (%)'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Chart Mode Selector */}
          <div className="chart-tabs">
            <button 
              className={`chart-tab-btn ${chartType === 'portfolio' ? 'active' : ''}`}
              onClick={() => setChartType('portfolio')}
              id="btn-chart-portfolio"
            >
              Portfolio Value
            </button>
            <button 
              className={`chart-tab-btn ${chartType === 'comparison' ? 'active' : ''}`}
              onClick={() => setChartType('comparison')}
              id="btn-chart-comparison"
            >
              Asset Returns
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="chart-tabs">
            {['1Y', '3Y', '5Y'].map((tf) => (
              <button 
                key={tf}
                className={`chart-tab-btn ${timeframe === tf ? 'active' : ''}`}
                onClick={() => setTimeframe(tf)}
                id={`btn-timeframe-${tf.toLowerCase()}`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ width: '100%', flex: 1, minHeight: 0 }}>
        {chartType === 'portfolio' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate} 
                stroke="var(--text-muted)" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="var(--text-muted)" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v.toLocaleString()}`}
                domain={['dataMin - 1000', 'dataMax + 1000']}
                dx={-10}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Area 
                type="monotone" 
                dataKey="portfolio_val" 
                name="Portfolio Value" 
                stroke="var(--primary)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorPortfolio)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate} 
                stroke="var(--text-muted)" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="var(--text-muted)" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v.toFixed(0)}%`}
                dx={-10}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle" 
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }}
              />
              <Line 
                type="monotone" 
                dataKey="AAPL_return" 
                name="AAPL" 
                stroke="#a3a3a3" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="MSFT_return" 
                name="MSFT" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="GOOGL_return" 
                name="GOOGL" 
                stroke="#eab308" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="AMZN_return" 
                name="AMZN" 
                stroke="#f97316" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default PerformanceChart;
