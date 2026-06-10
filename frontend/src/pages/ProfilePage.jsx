import { useEffect, useState } from 'react';
import { getMyProfile } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { avatarUrl, formatVolume } from '../utils/helpers.js';
import StreakCard from '../components/StreakCard.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { Edit2, Settings, Trophy, Dumbbell, TrendingUp, Users } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile]  = useState(null);
  const [loading, setLoading]  = useState(true);
  const [activeTab, setActiveTab] = useState('pr');

  useEffect(() => {
    if (!user) return;
    getMyProfile()
      .then(({ data }) => setProfile(data))
      .catch((e) => console.error('Failed to load profile', e))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="skeleton h-8 w-24 rounded-lg" />
        <div className="skeleton h-28 rounded-2xl" />
        <div className="skeleton h-20 rounded-2xl" />
      </div>
    );
  }

  if (!profile) return null;

  const {
    imagem_perfil_url,
    nome,
    username,
    bio,
    peso_atual,
    altura_cm,
    streak_atual,
    maior_streak,
    workouts,
    followers,
    following,
    total_volume_kg,
    personal_records = [],
    achievements = [],
  } = profile;

  const stats = [
    { label: 'Followers', value: followers ?? '--', icon: Users },
    { label: 'Following', value: following ?? '--', icon: Users },
    { label: 'Workouts',  value: workouts ?? '--', icon: Dumbbell },
  ];

  return (
    <div className="p-4 space-y-4 pb-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Profile</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button className="w-8 h-8 rounded-full flex items-center justify-center btn-press" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <Edit2 size={15} className="text-text-secondary" />
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center btn-press" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <Settings size={15} className="text-text-secondary" />
          </button>
        </div>
      </header>

      {/* Profile Card */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)' }}
      >
        <div className="flex items-start gap-4">
          {/* Avatar with streak badge */}
          <div className="relative flex-shrink-0">
            <div className="story-ring p-0.5 rounded-full">
              <img
                src={avatarUrl({ imagem_perfil_url, username })}
                alt={username}
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
            {streak_atual > 0 && (
              <span
                className="absolute -bottom-1 -right-1 text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: '#F97316', color: '#fff', fontSize: '10px' }}
              >
                {streak_atual}d
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-text-primary text-lg leading-tight">{nome || username}</h2>
            <p className="text-text-secondary text-sm">@{username}</p>
            {bio && (
              <p className="text-text-secondary text-sm mt-1.5 leading-relaxed">{bio}</p>
            )}
            {(peso_atual != null || altura_cm != null) && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {peso_atual != null && (
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }}
                  >
                    {peso_atual}kg
                  </span>
                )}
                {altura_cm != null && (
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }}
                  >
                    {altura_cm}cm
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div
          className="grid grid-cols-3 mt-5 pt-4"
          style={{ borderTop: '1px solid var(--color-border-subtle)' }}
        >
          {stats.map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-xl font-bold text-text-primary">{value}</span>
              <span className="text-xs text-text-muted mt-0.5">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Streak Card */}
      {streak_atual > 0 && (
        <StreakCard streak_atual={streak_atual} maior_streak={maior_streak} />
      )}

      {/* Volume + Workouts stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-2xl p-4 flex flex-col items-center gap-1"
          style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)' }}
        >
          <Dumbbell size={20} className="text-accent mb-1" />
          <span className="text-xl font-bold text-text-primary">{workouts ?? '--'}</span>
          <span className="text-xs text-text-muted">Workouts</span>
        </div>
        <div
          className="rounded-2xl p-4 flex flex-col items-center gap-1"
          style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)' }}
        >
          <TrendingUp size={20} className="text-accent mb-1" />
          <span className="text-xl font-bold text-text-primary">
            {total_volume_kg != null ? formatVolume(total_volume_kg) : '--'}
          </span>
          <span className="text-xs text-text-muted">Volume Total</span>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="grid grid-cols-2 rounded-xl p-1"
        style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)' }}
      >
        {[
          { key: 'pr',           label: 'Personal Records' },
          { key: 'achievements', label: 'Achievements' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="py-2.5 rounded-lg text-sm font-medium transition-all btn-press"
            style={{
              background: activeTab === key ? 'var(--color-accent)' : 'transparent',
              color: activeTab === key ? '#fff' : 'var(--color-text-secondary)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'pr' ? (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--color-border-subtle)' }}
        >
          {personal_records.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Trophy size={32} className="text-text-muted mb-2" />
              <p className="text-text-secondary text-sm">Nenhum recorde pessoal ainda.</p>
            </div>
          ) : (
            personal_records.map((pr, i) => (
              <div
                key={pr.id}
                className="flex items-center justify-between px-4 py-3.5"
                style={{
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                  borderBottom: i < personal_records.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(124,58,237,0.15)' }}
                  >
                    <TrendingUp size={14} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-text-primary font-medium text-sm">{pr.exercicio_nome}</p>
                    <p className="text-text-muted text-xs">
                      {pr.data_conquista ? new Date(pr.data_conquista).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {pr.maior_peso_kg != null && (
                    <p className="text-accent font-bold text-sm">{pr.maior_peso_kg}kg</p>
                  )}
                  {pr.valor_1rm_estimado != null && (
                    <p className="text-text-muted text-xs">1RM ~{pr.valor_1rm_estimado}kg</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--color-border-subtle)' }}
        >
          {achievements.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Trophy size={32} className="text-text-muted mb-2" />
              <p className="text-text-secondary text-sm">Nenhuma conquista ainda.</p>
            </div>
          ) : (
            achievements.map((a, i) => (
              <div
                key={a.id}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{
                  borderBottom: i < achievements.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.25)' }}
                >
                  <Trophy size={18} className="text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary font-medium text-sm">{a.nome}</p>
                  <p className="text-text-muted text-xs">{a.descricao}</p>
                </div>
                {a.xp_recompensa && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                    style={{ background: 'rgba(234,179,8,0.15)', color: '#FBBF24' }}
                  >
                    +{a.xp_recompensa}xp
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
