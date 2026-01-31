import { useState, useEffect } from 'react';
import './AdminDrawsPage.css';

interface Draw {
  id: string;
  lotteryId: string;
  status: string;
  scheduledAt: string;
  executedAt?: string;
  Lottery?: { name: string };
}

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDraws();
  }, []);

  async function loadDraws() {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/draws', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setDraws(data.draws || []);
    } catch (error) {
      console.error('Failed to load draws:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleExecuteDraw(lotteryId: string) {
    if (!confirm('Are you sure you want to execute this draw?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      await fetch(`/api/admin/draws/${lotteryId}/execute`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      loadDraws();
    } catch (error) {
      console.error('Failed to execute draw:', error);
      alert('Failed to execute draw');
    }
  }

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-draws-page">
      <h2>Draw Management</h2>

      <div className="draws-section">
        <h3>Scheduled Draws</h3>
        <div className="draws-list">
          {draws.filter(d => d.status === 'scheduled').length === 0 ? (
            <p className="empty-message">No scheduled draws</p>
          ) : (
            draws.filter(d => d.status === 'scheduled').map(draw => (
              <div key={draw.id} className="draw-card">
                <div className="draw-info">
                  <h4>{draw.Lottery?.name || 'Unknown Lottery'}</h4>
                  <p className="draw-time">
                    Scheduled: {new Date(draw.scheduledAt).toLocaleString()}
                  </p>
                  <span className="status-badge scheduled">Scheduled</span>
                </div>
                <button
                  className="execute-btn"
                  onClick={() => handleExecuteDraw(draw.lotteryId)}
                >
                  Execute Draw
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="draws-section">
        <h3>Recent Draws</h3>
        <div className="draws-list">
          {draws.filter(d => d.status === 'completed').length === 0 ? (
            <p className="empty-message">No completed draws</p>
          ) : (
            draws.filter(d => d.status === 'completed').slice(0, 10).map(draw => (
              <div key={draw.id} className="draw-card">
                <div className="draw-info">
                  <h4>{draw.Lottery?.name || 'Unknown Lottery'}</h4>
                  <p className="draw-time">
                    Executed: {draw.executedAt ? new Date(draw.executedAt).toLocaleString() : 'N/A'}
                  </p>
                  <span className="status-badge completed">Completed</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
