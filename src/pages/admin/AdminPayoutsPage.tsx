import { useState, useEffect } from 'react';
import './AdminPayoutsPage.css';

interface Payout {
  id: string;
  status: string;
  amount: number;
  createdAt: string;
  processedAt?: string;
  Winner?: {
    Ticket?: {
      Lottery?: { name: string };
    };
  };
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPayouts();
  }, [filter]);

  async function loadPayouts() {
    try {
      const token = localStorage.getItem('adminToken');
      const url = filter === 'all' 
        ? '/api/admin/payouts' 
        : `/api/admin/payouts?status=${filter}`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setPayouts(data.payouts || []);
    } catch (error) {
      console.error('Failed to load payouts:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleProcessPayout(id: string) {
    if (!confirm('Are you sure you want to process this payout?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      await fetch(`/api/admin/payouts/${id}/process`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      loadPayouts();
    } catch (error) {
      console.error('Failed to process payout:', error);
      alert('Failed to process payout');
    }
  }

  async function handleCancelPayout(id: string) {
    if (!confirm('Are you sure you want to cancel this payout?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      await fetch(`/api/admin/payouts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      loadPayouts();
    } catch (error) {
      console.error('Failed to cancel payout:', error);
      alert('Failed to cancel payout');
    }
  }

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-payouts-page">
      <div className="page-header">
        <h2>Payout Management</h2>
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''} 
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={filter === 'processing' ? 'active' : ''} 
            onClick={() => setFilter('processing')}
          >
            Processing
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''} 
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="payouts-list">
        {payouts.length === 0 ? (
          <p className="empty-message">No payouts found</p>
        ) : (
          payouts.map(payout => (
            <div key={payout.id} className="payout-card">
              <div className="payout-info">
                <h4>{payout.Winner?.Ticket?.Lottery?.name || 'Unknown Lottery'}</h4>
                <p className="payout-amount">💰 {payout.amount} TON</p>
                <p className="payout-time">
                  Created: {new Date(payout.createdAt).toLocaleString()}
                </p>
                {payout.processedAt && (
                  <p className="payout-time">
                    Processed: {new Date(payout.processedAt).toLocaleString()}
                  </p>
                )}
                <span className={`status-badge ${payout.status}`}>
                  {payout.status}
                </span>
              </div>
              <div className="payout-actions">
                {payout.status === 'pending' && (
                  <>
                    <button 
                      className="process-btn"
                      onClick={() => handleProcessPayout(payout.id)}
                    >
                      Process
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={() => handleCancelPayout(payout.id)}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
