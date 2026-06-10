import { useEffect, useState } from 'react';
import { getMyProfile } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { avatarUrl, formatVolume } from '../utils/helpers.js';
import StreakCard from '../components/StreakCard.jsx';
import StatsGrid from '../components/StatsGrid.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { Edit2, Settings, Trophy, TrendingUp } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile]          = useState(null);
  const [loading, setLoading]          = useState(true);
  const [activeTab, setActiveTab]      = useState('pr');

  useEffect(() => {
    if (!user) return;
    getMyProfile()
      .then(({ data }) => setProfile(data))
      .catch((e) => console.error('Failed to load profile', e))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading) {
    return (
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="skeleton" style={{ height: 28, width: 96, borderRadius: 'var(--radius-md)' }} />
        <div className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-xl)' }} />
        <div className="skeleton" style={{ height: 72, borderRadius: 'var(--radius-xl)' }} />
        <div className="skeleton" style={{ height: 140, borderRadius: 'var(--radius-xl)' }} />
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
    achievements      = [],
  } = profile;

  return (
    <div style={{ paddingBottom: 24 }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 16px 12px',
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
          Perfil
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ThemeToggle />
          <button
            className="btn-press"
            style={{
              width: 34, height: 34, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <Edit2 size={14} style={{ color: 'var(--color-text-secondary)' }} />
          </button>
          <button
            className="btn-press"
            style={{
              width: 34, height: 34, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <Settings size={14} style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>
      </header>

      {/* ── Profile card ───────────────────────────────────── */}
      <div style={{ padding: '0 16px', marginBottom: 14 }}>
        <div style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-2xl)',
          overflow: 'hidden',
        }}>
          {/* Avatar + info */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '18px 16px 14px' }}>
            {/* Avatar with streak badge */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div className="story-ring" style={{ padding: 2.5, borderRadius: '50%' }}>
                <img
                  src={avatarUrl({ imagem_perfil_url, username })}
                  alt={username}
                  style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              {streak_atual > 0 && (
                <span style={{
                  position: 'absolute', bottom: -2, right: -2,
                  fontSize: 10, fontWeight: 800,
                  padding: '2px 5px',
                  borderRadius: 'var(--radius-pill)',
                  background: '#F97316',
                  color: '#fff',
                  border: '1.5px solid var(--color-bg-surface)',
                  lineHeight: 1.3,
                }}>
                  {streak_atual}d
                </span>
              )}
            </div>

            {/* User info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                {nome || username}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: bio ? 6 : 0 }}>
                @{username}
              </p>
              {bio && (
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.45, marginBottom: 8 }}>
                  {bio}
                </p>
              )}
              {(peso_atual != null || altura_cm != null) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                  {peso_atual != null && (
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 9px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'rgba(124,58,237,0.12)',
                      border: '1px solid rgba(124,58,237,0.25)',
                      color: '#a78bfa',
                    }}>
                      {peso_atual}kg
                    </span>
                  )}
                  {altura_cm != null && (
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 9px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'rgba(124,58,237,0.12)',
                      border: '1px solid rgba(124,58,237,0.25)',
                      color: '#a78bfa',
                    }}>
                      {altura_cm}cm
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stats row: Followers | Following | Workouts */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            borderTop: '1px solid var(--color-border-subtle)',
          }}>
            {[
              { label: 'Seguidores', value: followers },
              { label: 'Seguindo',   value: following },
              { label: 'Treinos',    value: workouts  },
            ].map(({ label, value }, i) => (
              <div key={label} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '12px 6px',
                borderRight: i < 2 ? '1px solid var(--color-border-subtle)' : 'none',
              }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>
                  {value ?? '--'}
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Streak card ────────────────────────────────────── */}
      {streak_atual > 0 && (
        <div style={{ padding: '0 16px', marginBottom: 14 }}>
          <StreakCard streak_atual={streak_atual} maior_streak={maior_streak} />
        </div>
      )}

      {/* ── 2×2 Stats grid ─────────────────────────────────── */}
      <div style={{ padding: '0 16px', marginBottom: 14 }}>
        <StatsGrid
          workouts={workouts}
          best_streak={maior_streak}
          followers={followers}
          volume_total_kg={total_volume_kg}
        />
      </div>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div style={{ padding: '0 16px', marginBottom: 2 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: 4,
          gap: 4,
        }}>
          {[
            { key: 'pr',           label: 'Records Pessoais' },
            { key: 'achievements', label: '⚡ Conquistas'    },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="btn-press"
              style={{
                padding: '9px 4px',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.82rem',
                fontWeight: 700,
                transition: 'all 0.18s ease',
                background: activeTab === key
                  ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                  : 'transparent',
                color: activeTab === key ? '#fff' : 'var(--color-text-secondary)',
                boxShadow: activeTab === key ? '0 0 12px rgba(124,58,237,0.30)' : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ────────────────────────────────────── */}
      <div style={{ padding: '8px 16px 0' }}>
        {activeTab === 'pr' ? (
          <div style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
          }}>
            {personal_records.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px', textAlign: 'center' }}>
                <Trophy size={30} style={{ color: 'var(--color-text-muted)', marginBottom: 10 }} />
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                  Nenhum recorde pessoal ainda.
                </p>
              </div>
            ) : (
              personal_records.map((pr, i) => (
                <div
                  key={pr.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 16px',
                    borderBottom: i < personal_records.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(124,58,237,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <TrendingUp size={14} style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
                      {pr.exercicio_nome}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>
                      {pr.data_conquista
                        ? new Date(pr.data_conquista).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
                        : ''}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {pr.maior_peso_kg != null && (
                      <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-accent)' }}>
                        {pr.maior_peso_kg}kg
                      </p>
                    )}
                    {pr.valor_1rm_estimado != null && (
                      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>
                        1RM ~{pr.valor_1rm_estimado}kg
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
          }}>
            {achievements.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px', textAlign: 'center' }}>
                <Trophy size={30} style={{ color: 'var(--color-text-muted)', marginBottom: 10 }} />
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                  Nenhuma conquista ainda.
                </p>
              </div>
            ) : (
              achievements.map((a, i) => (
                <div
                  key={a.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 16px',
                    borderBottom: i < achievements.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-lg)', flexShrink: 0,
                    background: 'rgba(234,179,8,0.12)',
                    border: '1px solid rgba(234,179,8,0.22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Trophy size={18} style={{ color: '#fbbf24' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
                      {a.nome}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>
                      {a.descricao}
                    </p>
                  </div>
                  {a.xp_recompensa && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'rgba(234,179,8,0.12)',
                      color: '#fbbf24',
                      flexShrink: 0,
                    }}>
                      +{a.xp_recompensa}xp
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
