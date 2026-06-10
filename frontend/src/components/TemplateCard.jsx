import { ChevronRight, Dumbbell, Clock } from 'lucide-react';
import MusclePill from './MusclePill.jsx';

export default function TemplateCard({ nome, descricao, musculos = [], num_exercicios, duracao_estimada_min, usuario, onStart }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-2.5"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
      }}
    >
      {/* Name + Start btn */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary text-base leading-tight">{nome}</h3>
          {descricao && (
            <p className="text-text-secondary text-xs mt-0.5 line-clamp-1">{descricao}</p>
          )}
        </div>
        {onStart && (
          <button
            onClick={onStart}
            className="flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-xl btn-press flex-shrink-0 transition-all"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              color: '#fff',
              boxShadow: '0 0 16px rgba(124,58,237,0.35)',
            }}
          >
            Start <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Muscle pills */}
      {musculos.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {musculos.slice(0, 3).map((m) => (
            <MusclePill key={m} label={m} />
          ))}
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-text-muted">
        {num_exercicios != null && (
          <span className="flex items-center gap-1">
            <Dumbbell size={12} className="text-accent opacity-70" />
            {num_exercicios} exercícios
          </span>
        )}
        {duracao_estimada_min != null && (
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-accent opacity-70" />
            ~{duracao_estimada_min}min
          </span>
        )}
      </div>
    </div>
  );
}
