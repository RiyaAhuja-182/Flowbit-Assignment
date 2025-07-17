import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(response.data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/tickets`, {
        title,
        description
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTitle('');
      setDescription('');
      fetchTickets();
    } catch (error) {
      console.error('Failed to create ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#ffc107';
      case 'in-progress': return '#17a2b8';
      case 'done': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Support Tickets</h1>
      
      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #dee2e6', borderRadius: '8px' }}>
        <h3>Create New Ticket</h3>
        <form onSubmit={createTicket}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              placeholder="Brief description of the issue"
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', minHeight: '100px' }}
              placeholder="Detailed description of the issue"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating...' : 'Create Ticket'}
          </button>
        </form>
      </div>

      <div>
        <h3>Your Tickets</h3>
        {tickets.length === 0 ? (
          <p>No tickets found. Create your first ticket above!</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {tickets.map(ticket => (
              <div
                key={ticket._id}
                style={{
                  padding: '1rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>{ticket.title}</h4>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>{ticket.description}</p>
                    <small style={{ color: '#999' }}>
                      Created: {new Date(ticket.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <span
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: getStatusColor(ticket.status),
                      color: 'white',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}
                  >
                    {ticket.status.replace('-', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
