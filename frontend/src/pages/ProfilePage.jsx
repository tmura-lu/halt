import { useEffect, useState } from 'react';
import { getMyProfile, updateProfile } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { avatarUrl, formatVolume } from '../utils/helpers.js';
import StreakCard from '../components/StreakCard.jsx';
import StatsGrid from '../components/StatsGrid.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { Edit2, Settings, Trophy, TrendingUp, X, Loader2, LogOut, Lock } from 'lucide-react';
import api from '../services/api.js';
import { useNavigate } from 'react-router-dom';

/* ── Edit Profile Modal ─────────────────────────────────────── */
function EditProfileModal({ profile, onClose, onSaved }) {
  const [form, setForm] = useState({
    nome: profile.nome || '',
    bio: profile.bio || '',
    peso_atual: profile.peso_atual != null ? String(profile.peso_atual) : '',
    altura_cm: profile.altura_cm != null ? String(profile.altura_cm) : '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        nome: form.nome.trim() || undefined,
        bio: form.bio.trim() || undefined,
        peso_atual: form.peso_atual ? parseFloat(form.peso_atual) : null,
        altura_cm: form.altura_cm ? parseFloat(form.altura_cm) : null,
      };
      await updateProfile(payload);
      onSaved();
      onClose();
    } catch (e) {
      setError('Não foi possível salvar. Tente novamente.');
      console.error('Failed to update profile', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="animate-slide-up"
        style={{
          width: '100%', maxWidth: 480, maxHeight: 'calc(90dvh - 65px)',
          borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0',
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderBottom: 'none',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 16px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, borderBottom: '1px solid var(--color-border-subtle)',
        }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Editar Perfil
          </h3>
          <button
            onClick={onClose}
            className="btn-press"
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={15} style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>

        {/* Fields */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Nome
            </label>
            <input
              type="text"
              className="input-base"
              value={form.nome}
              onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Bio
            </label>
            <textarea
              className="input-base"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Fale um pouco sobre você..."
              style={{ resize: 'none' }}
              maxLength={160}
            />
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4, textAlign: 'right' }}>
              {form.bio.length}/160
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                className="input-base"
                value={form.peso_atual}
                onChange={(e) => setForm((p) => ({ ...p, peso_atual: e.target.value }))}
                placeholder="70.0"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Altura (cm)
              </label>
              <input
                type="number"
                step="0.1"
                className="input-base"
                value={form.altura_cm}
                onChange={(e) => setForm((p) => ({ ...p, altura_cm: e.target.value }))}
                placeholder="175"
              />
            </div>
          </div>

          {error && (
            <div style={{
              padding: '8px 12px', borderRadius: 'var(--radius-md)',
              background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)',
              fontSize: '0.78rem', color: '#f87171',
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px 28px', flexShrink: 0, borderTop: '1px solid var(--color-border-subtle)' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-press"
            style={{
              width: '100%', padding: '13px',
              borderRadius: 'var(--radius-xl)',
              fontWeight: 700, fontSize: '0.9rem', color: '#fff',
              background: saving ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              boxShadow: saving ? 'none' : '0 0 20px rgba(124,58,237,0.35)',
              cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {saving ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Salvando…</> : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Settings Modal ─────────────────────────────────────────── */
function SettingsModal({ onClose }) {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post('/auth/logout/');
    } catch {
      // ignore — session may already be invalid
    } finally {
      await refresh();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="animate-slide-up"
        style={{
          width: '100%', maxWidth: 480,
          borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0',
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderBottom: 'none',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 16px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Configurações
          </h3>
          <button
            onClick={onClose}
            className="btn-press"
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={15} style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>

        {/* Options */}
        <div style={{ padding: '8px 0 28px' }}>
          {/* Theme toggle row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>
              Tema
            </span>
            <ThemeToggle />
          </div>

          {/* Privacy row (display only) */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 16px',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}>
            <Lock size={15} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
              Privacidade da conta — gerenciar no perfil
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="btn-press tap-highlight"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 16px',
              color: '#f87171', fontSize: '0.88rem', fontWeight: 600,
              cursor: loggingOut ? 'not-allowed' : 'pointer',
            }}
          >
            {loggingOut
              ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
              : <LogOut size={16} />
            }
            {loggingOut ? 'Saindo…' : 'Sair da conta'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── ProfilePage ────────────────────────────────────────────── */
export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile]          = useState(null);
  const [loading, setLoading]          = useState(true);
  const [activeTab, setActiveTab]      = useState('pr');
  const [showEdit, setShowEdit]        = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const loadProfile = () => {
    if (!user) return;
    setLoading(true);
    getMyProfile()
      .then(({ data }) => setProfile(data))
      .catch((e) => console.error('Failed to load profile', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            onClick={() => setShowEdit(true)}
            className="btn-press"
            style={{
              width: 34, height: 34, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--color-border-subtle)',
            }}
            title="Editar perfil"
          >
            <Edit2 size={14} style={{ color: 'var(--color-text-secondary)' }} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="btn-press"
            style={{
              width: 34, height: 34, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--color-border-subtle)',
            }}
            title="Configurações"
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

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid var(--color-border-subtle)' }}>
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
          padding: 4, gap: 4,
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
                      color: '#fbbf24', flexShrink: 0,
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

      {/* ── Modals ─────────────────────────────────────────── */}
      {showEdit && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEdit(false)}
          onSaved={loadProfile}
        />
      )}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
