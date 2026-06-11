import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkoutTemplates, getExercicios, createWorkoutTemplate, startWorkoutSession } from '../services/api.js';
import TemplateCard from '../components/TemplateCard.jsx';
import { Plus, X, Loader2, AlertCircle } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

export default function WorkoutPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState({ my_templates: [], community_templates: [] });
  const [exercises, setExercises] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating]   = useState(false);
  const [starting, setStarting]   = useState(false);
  const [startError, setStartError] = useState('');
  const [newTemplate, setNewTemplate] = useState({ nome: '', descricao: '', is_publico: false, exercicios: [] });

  useEffect(() => {
    getWorkoutTemplates()
      .then(({ data }) => setTemplates(data))
      .catch((e) => console.error('Failed to load templates', e));

    getExercicios()
      .then(({ data }) => setExercises(data.results || []))
      .catch((e) => console.error('Failed to load exercises', e));
  }, []);

  const handleStartWorkout = async (templateId = null) => {
    if (starting) return;
    setStarting(true);
    setStartError('');
    try {
      const { data: session } = await startWorkoutSession(templateId);
      navigate('/workout/active', { state: { session } });
    } catch (e) {
      console.error('Failed to start workout', e);
      setStartError('Não foi possível iniciar o treino. Tente novamente.');
    } finally {
      setStarting(false);
    }
  };

  const toggleExercise = (id) => {
    setNewTemplate((prev) => {
      const already = prev.exercicios.find((e) => e.exercicio_id === id);
      const updated = already
        ? prev.exercicios.filter((e) => e.exercicio_id !== id)
        : [...prev.exercicios, { exercicio_id: id, series_sugeridas: 3 }];
      return { ...prev, exercicios: updated };
    });
  };

  const handleCreate = async () => {
    if (!newTemplate.nome.trim()) return;
    setCreating(true);
    try {
      await createWorkoutTemplate(newTemplate);
      const { data } = await getWorkoutTemplates();
      setTemplates(data);
      setShowModal(false);
      setNewTemplate({ nome: '', descricao: '', is_publico: false, exercicios: [] });
    } catch (e) {
      console.error('Create template error', e);
    } finally {
      setCreating(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setNewTemplate({ nome: '', descricao: '', is_publico: false, exercicios: [] });
  };

  return (
    <div style={{ paddingTop: 0 }}>
      {/* ── Header ─────────────────────────────────────── */}
      <header style={{ padding: '20px 16px 12px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
          Workout
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
          Pronto para treinar?
        </p>
      </header>

      {/* ── Start Error ─────────────────────────────────── */}
      {startError && (
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239,68,68,0.10)',
            border: '1px solid rgba(239,68,68,0.25)',
            fontSize: '0.82rem', color: '#f87171',
          }}>
            <AlertCircle size={14} />
            {startError}
          </div>
        </div>
      )}

      {/* ── Start Empty Workout CTA ─────────────────────── */}
      <div style={{ padding: '0 16px 20px' }}>
        <button
          onClick={() => handleStartWorkout(null)}
          disabled={starting}
          className="btn-press tap-highlight"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderRadius: 'var(--radius-2xl)',
            background: starting
              ? 'rgba(124,58,237,0.5)'
              : 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
            boxShadow: starting ? 'none' : '0 4px 24px rgba(124,58,237,0.40)',
            cursor: starting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 'var(--radius-lg)',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {starting
                ? <Loader2 size={20} color="#fff" style={{ animation: 'spin 0.8s linear infinite' }} />
                : <Plus size={20} color="#fff" strokeWidth={2.5} />
              }
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', lineHeight: 1.2 }}>
                Iniciar Treino em Branco
              </p>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.70)', marginTop: 2 }}>
                Adicione exercícios enquanto treina
              </p>
            </div>
          </div>
          <ChevronRight size={20} color="rgba(255,255,255,0.80)" strokeWidth={2} />
        </button>
      </div>

      {/* ── My Templates ───────────────────────────────── */}
      <section>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px 10px',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Meus Templates
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="btn-press tap-highlight"
            style={{
              fontSize: '0.82rem', fontWeight: 600,
              color: '#a78bfa',
              background: 'transparent',
              display: 'flex', alignItems: 'center', gap: 3,
            }}
          >
            <Plus size={14} strokeWidth={2.5} /> Novo
          </button>
        </div>

        <div style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderLeft: 'none', borderRight: 'none',
        }}>
          {templates.my_templates.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center' }}>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                Nenhum template ainda.
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', marginTop: 4 }}>
                Crie seu primeiro template de treino!
              </p>
            </div>
          ) : (
            templates.my_templates.map((t, idx) => (
              <TemplateCard
                key={t.id}
                {...t}
                isLast={idx === templates.my_templates.length - 1}
                onStart={() => handleStartWorkout(t.id)}
              />
            ))
          )}
        </div>
      </section>

      {/* ── Community Templates ─────────────────────────── */}
      {templates.community_templates.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <div style={{ padding: '0 16px 10px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Comunidade
            </h2>
          </div>
          <div style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderLeft: 'none', borderRight: 'none',
          }}>
            {templates.community_templates.map((t) => (
              <TemplateCard
                key={t.id}
                {...t}
                onStart={() => handleStartWorkout(t.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Modal: Novo Template ────────────────────────── */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
          }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            className="animate-slide-up"
            style={{
              width: '100%',
              maxWidth: 480,
              maxHeight: '90dvh',
              borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0',
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              borderBottom: 'none',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header — não rola */}
            <div style={{
              padding: '20px 16px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
              borderBottom: '1px solid var(--color-border-subtle)',
            }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Novo Template
              </h3>
              <button
                onClick={closeModal}
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

            {/* Conteúdo scrollável */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              <input
                type="text"
                placeholder="Nome do treino *"
                value={newTemplate.nome}
                onChange={(e) => setNewTemplate((p) => ({ ...p, nome: e.target.value }))}
                className="input-base"
              />
              <textarea
                placeholder="Descrição (opcional)"
                rows={2}
                value={newTemplate.descricao}
                onChange={(e) => setNewTemplate((p) => ({ ...p, descricao: e.target.value }))}
                className="input-base"
                style={{ resize: 'none' }}
              />

              {exercises.length > 0 && (
                <div>
                  <p className="section-label" style={{ padding: '0 0 6px' }}>Exercícios</p>
                  <div style={{
                    maxHeight: 220, overflowY: 'auto',
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-md)',
                  }}>
                    {exercises.map((ex) => {
                      const selected = newTemplate.exercicios.some((e) => e.exercicio_id === ex.id);
                      return (
                        <label
                          key={ex.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 14px',
                            borderBottom: '1px solid var(--color-border-subtle)',
                            cursor: 'pointer',
                            background: selected ? 'rgba(124,58,237,0.10)' : 'transparent',
                            transition: 'background 0.15s',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleExercise(ex.id)}
                            style={{ accentColor: '#7C3AED', width: 15, height: 15 }}
                          />
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                            {ex.nome}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newTemplate.is_publico}
                  onChange={(e) => setNewTemplate((p) => ({ ...p, is_publico: e.target.checked }))}
                  style={{ accentColor: '#7C3AED', width: 15, height: 15 }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Tornar público para a comunidade
                </span>
              </label>
            </div>

            {/* Footer — não rola */}
            <div style={{
              padding: '12px 16px 28px', flexShrink: 0,
              borderTop: '1px solid var(--color-border-subtle)',
            }}>
              <button
                onClick={handleCreate}
                disabled={!newTemplate.nome.trim() || creating}
                className="btn-press"
                style={{
                  width: '100%', padding: '13px',
                  borderRadius: 'var(--radius-xl)',
                  fontWeight: 700, fontSize: '0.9rem', color: '#fff',
                  background: newTemplate.nome.trim()
                    ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                    : 'rgba(124,58,237,0.30)',
                  boxShadow: newTemplate.nome.trim() ? '0 0 20px rgba(124,58,237,0.35)' : 'none',
                  cursor: !newTemplate.nome.trim() || creating ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {creating ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Criando…
                  </span>
                ) : (
                  'Criar Template'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
