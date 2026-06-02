import React from 'react';
import { Zap, HelpCircle } from 'lucide-react';

const InsightsPanel = ({ insights }) => {
  // Simple parser to render markdown style **bold** text in React safely
  const parseBoldText = (text) => {
    if (!text) return "";
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      return i % 2 === 1 ? <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{part}</strong> : part;
    });
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'rgba(139, 92, 246, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)'
        }}>
          <Zap size={18} />
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Analytics Insights</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
            AI-generated portfolio observations & risk evaluations
          </p>
        </div>
      </div>

      <div className="insights-container">
        {insights && insights.map((insight, idx) => (
          <div key={idx} className="insight-card" id={`insight-item-${idx}`}>
            {parseBoldText(insight)}
          </div>
        ))}
        {(!insights || insights.length === 0) && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <HelpCircle size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
            <p>No insights generated. Ensure backend data is active.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsPanel;
