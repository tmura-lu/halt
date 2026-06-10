import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/api.js';

const AuthContext = createContext({ user: null, loading: true, authenticated: false });

export const AuthProvider = ({ children }) => {
  const [user, setUser]                 = useState(null);
  const [loading, setLoading]           = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const response = await getMe();
      setUser(response.data);
      setAuthenticated(true);
    } catch {
      setUser(null);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setAuthenticated(true);
  };

  return (
    <AuthContext.Provider value={{ user, loading, authenticated, refresh, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
