import { useState, useEffect } from 'react';
import './AdminLotteriesPage.css';

interface Lottery {
  id: string;
  name: string;
  slug: string;
  description: string;
  ticketPrice: number;
  maxTickets: number;
  drawDate: string;
  isActive: boolean;
  ticketCount: number;
  prizePool: number;
}

export default function AdminLotteriesPage() {
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLottery, setEditingLottery] = useState<Lottery | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    ticketPrice: '',
    maxTickets: '',
    drawDate: '',
  });

  useEffect(() => {
    loadLotteries();
  }, []);

  async function loadLotteries() {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/lotteries', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setLotteries(data.lotteries || []);
    } catch (error) {
      console.error('Failed to load lotteries:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    const payload = {
      ...formData,
      ticketPrice: parseFloat(formData.ticketPrice),
      maxTickets: parseInt(formData.maxTickets),
    };

    try {
      if (editingLottery) {
        await fetch(`/api/admin/lotteries/${editingLottery.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/admin/lotteries', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }
      
      setShowForm(false);
      setEditingLottery(null);
      setFormData({ name: '', slug: '', description: '', ticketPrice: '', maxTickets: '', drawDate: '' });
      loadLotteries();
    } catch (error) {
      console.error('Failed to save lottery:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this lottery?')) return;
    
    const token = localStorage.getItem('adminToken');
    try {
      await fetch(`/api/admin/lotteries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      loadLotteries();
    } catch (error) {
      console.error('Failed to delete lottery:', error);
    }
  }

  function handleEdit(lottery: Lottery) {
    setEditingLottery(lottery);
    setFormData({
      name: lottery.name,
      slug: lottery.slug,
      description: lottery.description,
      ticketPrice: lottery.ticketPrice.toString(),
      maxTickets: lottery.maxTickets.toString(),
      drawDate: lottery.drawDate,
    });
    setShowForm(true);
  }

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-lotteries-page">
      <div className="page-header">
        <h2>Lottery Management</h2>
        <button 
          className="create-btn"
          onClick={() => {
            setShowForm(true);
            setEditingLottery(null);
            setFormData({ name: '', slug: '', description: '', ticketPrice: '', maxTickets: '', drawDate: '' });
          }}
        >
          + Create Lottery
        </button>
      </div>

      {showForm && (
        <div className="lottery-form-overlay">
          <div className="lottery-form">
            <h3>{editingLottery ? 'Edit Lottery' : 'Create New Lottery'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ticket Price (TON)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({...formData, ticketPrice: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Max Tickets</label>
                  <input
                    type="number"
                    value={formData.maxTickets}
                    onChange={(e) => setFormData({...formData, maxTickets: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Draw Date</label>
                <input
                  type="datetime-local"
                  value={formData.drawDate}
                  onChange={(e) => setFormData({...formData, drawDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit">{editingLottery ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="lotteries-list">
        {lotteries.length === 0 ? (
          <p className="empty-message">No lotteries found</p>
        ) : (
          lotteries.map(lottery => (
            <div key={lottery.id} className="lottery-card">
              <div className="lottery-info">
                <h3>{lottery.name}</h3>
                <p className="lottery-slug">{lottery.slug}</p>
                <p className="lottery-description">{lottery.description}</p>
                <div className="lottery-stats">
                  <span>💰 {lottery.ticketPrice} TON/ticket</span>
                  <span>🎫 {lottery.ticketCount}/{lottery.maxTickets} sold</span>
                  <span>🏆 {lottery.prizePool.toFixed(2)} TON pool</span>
                </div>
                <div className="lottery-meta">
                  <span className={`status ${lottery.isActive ? 'active' : 'inactive'}`}>
                    {lottery.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="draw-date">
                    Draw: {new Date(lottery.drawDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="lottery-actions">
                <button onClick={() => handleEdit(lottery)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(lottery.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
