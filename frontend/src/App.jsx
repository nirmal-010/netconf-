import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import NOCWorkspace from './layouts/NOCWorkspace';
import Login from './components/auth/Login';
import { hydrateState } from './store/configSlice';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async (user) => {
    setIsAuthenticated(true);
    // Fetch saved progress
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_BASE}/api/progress`, {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          dispatch(hydrateState(data));
        }
      }
    } catch (err) {
      console.error('Failed to load progress', err);
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return <NOCWorkspace />;
}

export default App;
