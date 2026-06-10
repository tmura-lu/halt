import { Dumbbell, Flame, Users, TrendingUp } from 'lucide-react';
import { formatVolume } from '../utils/helpers.js';

function StatCell({ icon: Icon, value, label, borderRight, borderBottom }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '16px 8px',
      borderRight:  borderRight  ? '1px solid var(--color-border-subtle)' : 'none',
      borderBottom: borderBottom ? '1px solid var(--color-border-subtle)' : 'none',
    }}>
      <Icon size={20} style={{ color: 'var(--color-accent)', marginBottom: 6 }} strokeWidth={1.8} />
      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>
        {value ?? '--'}
      </span>
      <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
        {label}
      </span>
    </div>
  );
}

export default function StatsGrid({ workouts, best_streak, followers, volume_total_kg }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border-subtle)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
    }}>
      <StatCell icon={Dumbbell}    value={workouts}          label="Workouts"      borderRight borderBottom />
      <StatCell icon={Flame}       value={best_streak ? `${best_streak}d` : '--'} label="Best Streak"  borderBottom />
      <StatCell icon={Users}       value={followers}         label="Followers"     borderRight />
      <StatCell icon={TrendingUp}  value={formatVolume(volume_total_kg)} label="Total Volume" />
    </div>
  );
}
