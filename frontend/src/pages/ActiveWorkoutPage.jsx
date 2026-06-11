import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { finishWorkoutSession } from '../services/api.js';
import { Dumbbell, Clock, CheckCircle2, X, Loader2 } from 'lucide-react';

function useTimer(startTime) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = startTime ? new Date(startTime).getTime() : Date.now();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export default function ActiveWorkoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = location.state?.session;

  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState('');
  const timer = useTimer(session?.iniciado_em);

  // If arrived without session state, go back to workout
  useEffect(() => {
    if (!session) navigate('/workout', { replace: true });
  }, [session, navigate]);

  if (!session) return null;

  const exercises = session.exercicios || [];

  const handleFinish = async () => {
    setError('');
    setFinishing(true);
    try {
      await finishWorkoutSession(session.id);
      navigate('/workout', { replace: true, state: { finished: true } });
    } catch (e) {
      setError('Não foi possível finalizar o treino. Tente novamente.');
      console.error('Failed to finish workout', e);
    } finally {
      setFinishing(false);
    }
  };

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* ── Header ── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 16px 14px',
          borderBottom: '1px solid var(--color-border-subtle)',
          position: 'sticky',
          top: 0,
          background: 'var(--color-bg-base)',
          zIndex: 10,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              lineHeight: 1.2,
            }}
          >
            {session.template_nome || 'Treino em Andamento'}
          </h1>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 3,
            }}
          >
            <Clock size={13} style={{ color: 'var(--color-accent)' }} />
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--color-accent)',
              }}
            >
              {timer}
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/workout')}
          className="btn-press"
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={16} style={{ color: 'var(--color-text-secondary)' }} />
        </button>
      </header>

      {/* ── Exercises list ── */}
      <div style={{ padding: '16px' }}>
        {exercises.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '48px 24px',
              textAlign: 'center',
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <Dumbbell
              size={36}
              style={{ color: 'var(--color-text-muted)', marginBottom: 14 }}
            />
            <p
              style={{
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                fontSize: '0.92rem',
                marginBottom: 6,
              }}
            >
              Treino em branco
            </p>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.82rem',
                lineHeight: 1.5,
              }}
            >
              Nenhum exercício pré-definido.{'\n'}Treine o que quiser e finalize quando terminar.
            </p>
          </div>
        ) : (
          <div
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
            }}
          >
            {exercises.map((ex, i) => (
              <div
                key={ex.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  borderBottom:
                    i < exercises.length - 1
                      ? '1px solid var(--color-border-subtle)'
                      : 'none',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(124,58,237,0.12)',
                    border: '1px solid rgba(124,58,237,0.22)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Dumbbell size={16} style={{ color: 'var(--color-accent)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: 'var(--color-text-primary)',
                      lineHeight: 1.25,
                    }}
                  >
                    {ex.exercicio_nome}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: 'var(--color-text-muted)',
                      marginTop: 2,
                    }}
                  >
                    Exercício {i + 1}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div
          style={{
            margin: '0 16px 12px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239,68,68,0.10)',
            border: '1px solid rgba(239,68,68,0.25)',
            fontSize: '0.82rem',
            color: '#f87171',
          }}
        >
          {error}
        </div>
      )}

      {/* ── Finish button — sticky bottom ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 72, // above bottom nav
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: 480,
          zIndex: 20,
        }}
      >
        <button
          onClick={handleFinish}
          disabled={finishing}
          className="btn-press"
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: 'var(--radius-2xl)',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: '#fff',
            background: finishing
              ? 'rgba(34,197,94,0.4)'
              : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            boxShadow: finishing ? 'none' : '0 4px 20px rgba(34,197,94,0.40)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: finishing ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {finishing ? (
            <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />
          ) : (
            <CheckCircle2 size={18} />
          )}
          {finishing ? 'Finalizando…' : 'Finalizar Treino'}
        </button>
      </div>
    </div>
  );
}
