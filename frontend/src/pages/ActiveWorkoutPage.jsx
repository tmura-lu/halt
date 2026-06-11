import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { finishWorkoutSession, getExercicios, addExerciseToSession, logSerieToSession } from '../services/api.js';
import { Dumbbell, Clock, CheckCircle2, X, Loader2, Plus, PlusCircle, Check } from 'lucide-react';

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
  const initialSession = location.state?.session;

  const [session, setSession] = useState(initialSession);
  const [exercises, setExercises] = useState(initialSession?.exercicios || []);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState('');
  const timer = useTimer(session?.iniciado_em);

  const [allExercises, setAllExercises] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingEx, setAddingEx] = useState(false);

  // States for logging sets: keyed by sessao_exercicio_id
  const [setForms, setSetForms] = useState({});
  const [savingSet, setSavingSet] = useState({});

  useEffect(() => {
    if (!initialSession) navigate('/workout', { replace: true });
    
    // Fetch available exercises for adding new ones
    getExercicios()
      .then(({ data }) => setAllExercises(data.results || []))
      .catch((e) => console.error('Failed to load exercises', e));
  }, [initialSession, navigate]);

  if (!session) return null;

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

  const handleAddExercise = async (exId) => {
    if (addingEx) return;
    setAddingEx(true);
    try {
      const { data } = await addExerciseToSession(session.id, exId);
      setExercises((prev) => [...prev, data]);
      setShowAddModal(false);
    } catch (e) {
      console.error('Failed to add exercise', e);
      setError('Erro ao adicionar exercício.');
    } finally {
      setAddingEx(false);
    }
  };

  const handleSetFormChange = (seId, field, value) => {
    setSetForms((prev) => ({
      ...prev,
      [seId]: {
        ...prev[seId],
        [field]: value
      }
    }));
  };

  const handleSaveSet = async (seId) => {
    const form = setSetForms[seId] || {};
    const peso = form.peso_kg;
    const reps = form.repeticoes;
    if (!peso || !reps) return; // Must have weight and reps

    setSavingSet((prev) => ({ ...prev, [seId]: true }));
    try {
      const { data } = await logSerieToSession(session.id, seId, {
        peso_kg: peso,
        repeticoes: reps
      });
      
      // Update exercise with new set
      setExercises((prev) => prev.map((ex) => {
        if (ex.id === seId) {
          return { ...ex, series: [...(ex.series || []), data] };
        }
        return ex;
      }));
      
      // Clear form
      setSetForms((prev) => ({ ...prev, [seId]: { peso_kg: '', repeticoes: '' } }));
    } catch (e) {
      console.error('Failed to save set', e);
    } finally {
      setSavingSet((prev) => ({ ...prev, [seId]: false }));
    }
  };

  return (
    <div style={{ paddingBottom: 140 }}>
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
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              Nenhum exercício pré-definido.{'\n'}Adicione exercícios para começar.
            </p>
          </div>
        ) : (
          exercises.map((ex, i) => (
            <div
              key={ex.id}
              style={{
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
              }}
            >
              {/* Exercise Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  background: 'rgba(255,255,255,0.02)',
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
                      fontSize: '0.95rem',
                      color: 'var(--color-text-primary)',
                      lineHeight: 1.25,
                    }}
                  >
                    {ex.exercicio_nome}
                  </p>
                </div>
              </div>

              {/* Sets List */}
              <div style={{ padding: '8px 16px' }}>
                {/* Headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 50px', gap: 8, padding: '4px 0 8px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textAlign: 'center' }}>Série</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textAlign: 'center' }}>kg</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textAlign: 'center' }}>Reps</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textAlign: 'center' }}></span>
                </div>

                {/* Logged Sets */}
                {(ex.series || []).map((set, idx) => (
                  <div key={set.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 50px', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                      {idx + 1}
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '4px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                      {set.peso_kg}
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '4px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                      {set.repeticoes}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                ))}

                {/* New Set Input Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 50px', gap: 8, alignItems: 'center', marginTop: 8 }}>
                  <div style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    {(ex.series?.length || 0) + 1}
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="kg"
                      value={setForms[ex.id]?.peso_kg || ''}
                      onChange={(e) => handleSetFormChange(ex.id, 'peso_kg', e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', padding: '6px', color: '#fff', textAlign: 'center', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="reps"
                      value={setForms[ex.id]?.repeticoes || ''}
                      onChange={(e) => handleSetFormChange(ex.id, 'repeticoes', e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', padding: '6px', color: '#fff', textAlign: 'center', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleSaveSet(ex.id)}
                      disabled={savingSet[ex.id] || !setForms[ex.id]?.peso_kg || !setForms[ex.id]?.repeticoes}
                      className="btn-press"
                      style={{
                        width: 30, height: 30, borderRadius: '8px',
                        background: (!setForms[ex.id]?.peso_kg || !setForms[ex.id]?.repeticoes) ? 'rgba(124,58,237,0.3)' : 'var(--color-accent)',
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: 'none', cursor: (!setForms[ex.id]?.peso_kg || !setForms[ex.id]?.repeticoes) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {savingSet[ex.id] ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={16} strokeWidth={3} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Add Exercise Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-press tap-highlight"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px', borderRadius: 'var(--radius-xl)',
            background: 'rgba(124,58,237,0.1)', border: '1px dashed rgba(124,58,237,0.4)',
            color: 'var(--color-accent)', fontWeight: 600, fontSize: '0.95rem',
            marginTop: exercises.length > 0 ? 8 : 0
          }}
        >
          <PlusCircle size={20} />
          Adicionar Exercício
        </button>
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

      {/* ── Add Exercise Modal ── */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
            paddingBottom: '65px',
          }}
          onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
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
            <div style={{
              padding: '20px 16px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0, borderBottom: '1px solid var(--color-border-subtle)',
            }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Selecione um Exercício
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
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
            
            <div style={{
              flex: 1, overflowY: 'auto', padding: '8px 16px',
            }}>
              {allExercises.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-text-muted)' }}>
                  Carregando exercícios...
                </div>
              ) : (
                allExercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => handleAddExercise(ex.id)}
                    disabled={addingEx}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 0', borderBottom: '1px solid var(--color-border-subtle)',
                      background: 'transparent', textAlign: 'left', cursor: 'pointer',
                      opacity: addingEx ? 0.5 : 1,
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: '8px',
                      background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--color-accent)'
                    }}>
                      <Plus size={16} />
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {ex.nome}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
