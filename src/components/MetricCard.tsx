import React from 'react';

interface MetricCardProps {
  title: string;
  value: number;
  type: 'total' | 'open' | 'closed' | 'high-priority' | 'incoming' | 'outgoing';
  icon?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, type, icon }) => {
  return (
    <div className={`metric-card ${type}`}>
      <div className="metric-value">
        {value.toLocaleString()}
      </div>
      <div className="metric-label">
        {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
        {title}
      </div>
    </div>
  );
};

export default MetricCard;