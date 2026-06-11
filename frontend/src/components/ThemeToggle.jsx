import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      className="btn-press tap-highlight"
      style={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(124,58,237,0.12)',
        border: '1px solid rgba(124,58,237,0.22)',
        transition: 'background 0.2s, border-color 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(124,58,237,0.22)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(124,58,237,0.12)';
      }}
    >
      {isDark
        ? <Moon size={15} style={{ color: '#a78bfa' }} strokeWidth={1.8} />
        : <Sun  size={15} style={{ color: '#7C3AED' }} strokeWidth={1.8} />
      }
    </button>
  );
}
