import React from 'react';
import '../ui/GlassCard.css';
import './AnalyticsComponents.css';

interface DrawHistoryChartProps {
  history: Array<{ 
    date: string; 
    label: string; 
    count: number; 
    percentage: number; 
  }>;
  totalTickets: number;
  days: number;
}

const DrawHistoryChart: React.FC<DrawHistoryChartProps> = ({ history, totalTickets, days }) => {
  return (
    <div className="glass-card full-width-card">
      <h2 className="card-title">📈 Draw History</h2>
      <p className="card-subtitle">Last {days} days</p>
      
      <div className="chart-container">
        {history.map((day) => (
          <div className="chart-bar-wrapper" key={day.date}>
            <div 
              className="chart-bar" 
              style={{ height: `${day.percentage}%` }}
              title={`${day.count} tickets`}
            >
              <span className="chart-bar-value">{day.count}</span>
            </div>
            <span className="chart-label">{day.label}</span>
          </div>
        ))}
      </div>
      
      <p className="chart-summary">
        {totalTickets} tickets sold in the last {days} days
      </p>
    </div>
  );
};

export default DrawHistoryChart;
