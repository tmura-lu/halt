export default function MusclePill({ label }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 9px',
      borderRadius: 'var(--radius-pill)',
      fontSize: 11,
      fontWeight: 500,
      whiteSpace: 'nowrap',
      background: 'rgba(124,58,237,0.12)',
      border: '1px solid rgba(124,58,237,0.30)',
      color: '#a78bfa',
    }}>
      {label}
    </span>
  );
}
