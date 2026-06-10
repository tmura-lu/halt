import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('haltTheme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    }
    // Apply class to body
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${saved || 'dark'}`);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('haltTheme', next);
      document.body.classList.remove('theme-light', 'theme-dark');
      document.body.classList.add(`theme-${next}`);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
