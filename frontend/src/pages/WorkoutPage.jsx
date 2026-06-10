import { useEffect, useState } from 'react';
import { getWorkoutTemplates, getExercicios, createWorkoutTemplate } from '../services/api.js';
import TemplateCard from '../components/TemplateCard.jsx';
import { Plus, X, Loader2, Dumbbell, Users } from 'lucide-react';

export default function WorkoutPage() {
  const [templates, setTemplates] = useState({ my_templates: [], community_templates: [] });
  const [exercises, setExercises] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating]   = useState(false);
  const [newTemplate, setNewTemplate] = useState({ nome: '', descricao: '', is_publico: false, exercicios: [] });

  useEffect(() => {
    getWorkoutTemplates()
      .then(({ data }) => setTemplates(data))
      .catch((e) => console.error('Failed to load templates', e));

    getExercicios()
      .then(({ data }) => setExercises(data.results || []))
      .catch((e) => console.error('Failed to load exercises', e));
  }, []);

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
    <div className="p-4 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-text-primary">Workout</h1>
        <p className="text-text-secondary text-sm mt-0.5">Pronto para treinar?</p>
      </header>

      {/* Start empty workout CTA */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 rounded-2xl btn-press transition-all"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(109,40,217,0.15) 100%)',
          border: '1px solid rgba(124,58,237,0.35)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(124,58,237,0.25)' }}
          >
            <Plus size={22} className="text-accent" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-text-primary text-sm">Iniciar Treino em Branco</p>
            <p className="text-text-secondary text-xs">Adicione exercícios enquanto treina</p>
          </div>
        </div>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(124,58,237,0.2)' }}
        >
          <span className="text-accent text-lg font-light">›</span>
        </div>
      </button>

      {/* My Templates */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Dumbbell size={18} className="text-accent" />
            <h2 className="text-lg font-semibold text-text-primary">Meus Templates</h2>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg btn-press transition-all"
            style={{
              background: 'rgba(124,58,237,0.15)',
              color: '#a78bfa',
              border: '1px solid rgba(124,58,237,0.25)',
            }}
          >
            <Plus size={14} /> Novo
          </button>
        </div>

        {templates.my_templates.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)' }}
          >
            <Dumbbell size={32} className="text-text-muted mx-auto mb-2" />
            <p className="text-text-secondary text-sm">Nenhum template ainda.</p>
            <p className="text-text-muted text-xs mt-1">Crie seu primeiro template de treino!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.my_templates.map((t) => (
              <TemplateCard
                key={t.id}
                {...t}
                onStart={() => console.log('Start workout with template', t.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Community Templates */}
      {templates.community_templates.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} className="text-accent" />
            <h2 className="text-lg font-semibold text-text-primary">Comunidade</h2>
          </div>
          <div className="space-y-3">
            {templates.community_templates.map((t) => (
              <TemplateCard key={t.id} {...t} />
            ))}
          </div>
        </section>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            className="w-full sm:max-w-md rounded-2xl p-5 space-y-4 animate-fade-in-up"
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Novo Template</h3>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full flex items-center justify-center btn-press"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <X size={16} className="text-text-secondary" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome do treino *"
                value={newTemplate.nome}
                onChange={(e) => setNewTemplate((p) => ({ ...p, nome: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-text-primary placeholder:text-text-muted text-sm outline-none"
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              />
              <textarea
                placeholder="Descrição (opcional)"
                rows={2}
                value={newTemplate.descricao}
                onChange={(e) => setNewTemplate((p) => ({ ...p, descricao: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-text-primary placeholder:text-text-muted text-sm outline-none resize-none"
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              />

              {exercises.length > 0 && (
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Exercícios</p>
                  <div
                    className="max-h-44 overflow-y-auto rounded-xl divide-y"
                    style={{
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border-subtle)',
                      '--tw-divide-opacity': 1,
                      borderColor: 'var(--color-border-subtle)',
                    }}
                  >
                    {exercises.map((ex) => {
                      const selected = newTemplate.exercicios.some((e) => e.exercicio_id === ex.id);
                      return (
                        <label
                          key={ex.id}
                          className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                          style={{ background: selected ? 'rgba(124,58,237,0.1)' : 'transparent' }}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleExercise(ex.id)}
                            className="accent-accent"
                          />
                          <span className="text-sm text-text-primary">{ex.nome}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newTemplate.is_publico}
                  onChange={(e) => setNewTemplate((p) => ({ ...p, is_publico: e.target.checked }))}
                  className="accent-accent"
                />
                <span className="text-sm text-text-secondary">Tornar público para a comunidade</span>
              </label>
            </div>

            <button
              onClick={handleCreate}
              disabled={!newTemplate.nome.trim() || creating}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm btn-press transition-all"
              style={{
                background: newTemplate.nome.trim()
                  ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                  : 'rgba(124,58,237,0.3)',
                boxShadow: newTemplate.nome.trim() ? '0 0 20px rgba(124,58,237,0.35)' : 'none',
              }}
            >
              {creating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Criando…
                </span>
              ) : (
                'Criar Template'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
