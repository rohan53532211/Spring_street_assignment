import React from 'react';

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, type = "primary" }) => {
  // Determine trend color and sign
  let trendClass = "";
  if (trend) {
    if (trend.startsWith('+') || parseFloat(trend) > 0) {
      trendClass = "trend-up";
    } else if (trend.startsWith('-') || parseFloat(trend) < 0) {
      trendClass = "trend-down";
    }
  }

  // Get glow and border styles based on card type
  const typeClasses = {
    primary: "border-left: 4px solid var(--primary);",
    secondary: "border-left: 4px solid var(--secondary);",
    success: "border-left: 4px solid var(--success);",
    warning: "border-left: 4px solid var(--warning);",
    danger: "border-left: 4px solid var(--danger);"
  };

  const borderStyle = {
    borderLeft: `4px solid var(--${type})`,
    boxShadow: `0 4px 20px -2px rgba(var(--${type}-glow), 0.05)`
  };

  return (
    <div className="glass-card metric-card" style={borderStyle} id={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="metric-header">
        <span>{title}</span>
        {Icon && <Icon size={20} className={`color-${type}`} style={{ color: `var(--${type})` }} />}
      </div>
      <div className="metric-value mono">
        {value}
      </div>
      <div className="metric-footer">
        {trend && (
          <span className={`trend-tag ${trendClass}`}>
            {trend}
          </span>
        )}
        <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>{subtitle}</span>
      </div>
    </div>
  );
};

export default MetricCard;
