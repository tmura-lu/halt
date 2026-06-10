import { Flame } from 'lucide-react';

export default function StreakCard({ streak_atual, maior_streak }) {
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 16px',
      borderRadius: 'var(--radius-xl)',
      background: 'var(--color-streak-bg)',
      border: '1px solid var(--color-streak-border)',
    }}>
      {/* Flame icon */}
      <Flame
        size={28}
        style={{ color: 'var(--color-streak-icon)', flexShrink: 0 }}
        strokeWidth={1.8}
      />

      {/* Text */}
      <div style={{ flex: 1 }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          lineHeight: 1.25,
        }}>
          {streak_atual} Day Streak 🔥
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
          Melhor: {maior_streak} dias · Continue assim!
        </p>
      </div>

      {/* Active badge */}
      <span style={{
        position: 'absolute',
        top: 10,
        right: 12,
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 9px',
        borderRadius: 'var(--radius-pill)',
        background: 'rgba(249,115,22,0.18)',
        border: '1px solid rgba(249,115,22,0.35)',
        color: '#fb923c',
        letterSpacing: '0.04em',
      }}>
        Active
      </span>
    </div>
  );
}
