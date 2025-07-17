import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SupportTicketsApp = React.lazy(() => import('supportTicketsApp/App'));

function Dashboard() {
  const [screens, setScreens] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchScreens();
  }, []);

  const fetchScreens = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/me/screens`);
      setScreens(response.data.screens);
    } catch (error) {
      console.error('Failed to fetch screens:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h3>Flowbit</h3>
        <p>Welcome, {user?.email}</p>
        <p>Tenant: {user?.customerId}</p>
        <p>Role: {user?.role}</p>
        
        <nav style={{ marginTop: '2rem' }}>
          <h4>Available Screens:</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {screens.map(screen => (
              <li key={screen.id} style={{ marginBottom: '0.5rem' }}>
                <Link
                  to={screen.path}
                  style={{
                    display: 'block',
                    padding: '0.5rem',
                    textDecoration: 'none',
                    color: '#333',
                    backgroundColor: '#fff',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px'
                  }}
                >
                  {screen.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <button 
          onClick={handleLogout}
          style={{
            marginTop: '2rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
      
      <div className="main-content">
        <Routes>
          <Route path="/" element={<div><h1>Dashboard</h1><p>Welcome to your tenant dashboard!</p></div>} />
          <Route path="/dashboard" element={<div><h1>Dashboard</h1><p>Dashboard content here.</p></div>} />
          <Route path="/tickets/*" element={
            <Suspense fallback={<div>Loading Support Tickets...</div>}>
              <SupportTicketsApp />
            </Suspense>
          } />
          <Route path="/logistics" element={<div><h1>Logistics Management</h1><p>Logistics features for LogisticsCo.</p></div>} />
          <Route path="/retail" element={<div><h1>Retail Analytics</h1><p>Retail features for RetailGmbH.</p></div>} />
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;
