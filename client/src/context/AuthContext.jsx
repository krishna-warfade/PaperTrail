import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setTokenState] = useState(localStorage.getItem('token') || '');

  const setToken = useCallback((newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setTokenState(newToken);
      setLoading(true);
    } else {
      localStorage.removeItem('token');
      setTokenState('');
      setUser(null);
      setLoading(false);
    }
  }, []);

  const apiFetch = useCallback(async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      setToken('');
    }

    return response;
  }, [token, setToken]);

  const fetchProfile = useCallback(async (currentToken) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setToken('');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setToken('');
    } finally {
      setLoading(false);
    }
  }, [setToken]);

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, [token, fetchProfile]);

  const login = async (email, password) => {
    setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      throw new Error(data.message || 'Login failed');
    }

    setToken(data.token);

    try {
      const meRes = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${data.token}` },
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }

    return data;
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      throw new Error(data.message || 'Registration failed');
    }

    setToken(data.token);

    try {
      const meRes = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${data.token}` },
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }

    return data;
  };

  const logout = () => {
    setToken('');
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
