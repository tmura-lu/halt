import { ChevronRight, Dumbbell, Clock } from 'lucide-react';
import MusclePill from './MusclePill.jsx';

export default function TemplateCard({ nome, descricao, musculos = [], num_exercicios, duracao_estimada_min, onStart }) {
  return (
    <div style={{
      padding: '16px',
      borderBottom: '1px solid var(--color-border-subtle)',
      background: 'var(--color-bg-surface)',
    }}>
      {/* Row: info + start button */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontWeight: 700,
            fontSize: '0.95rem',
            color: 'var(--color-text-primary)',
            lineHeight: 1.25,
            marginBottom: descricao ? 3 : 0,
          }}>
            {nome}
          </h3>
          {descricao && (
            <p style={{
              fontSize: '0.78rem',
              color: 'var(--color-text-secondary)',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              marginBottom: 8,
            }}>
              {descricao}
            </p>
          )}

          {/* Muscle pills */}
          {musculos.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
              {musculos.slice(0, 3).map((m) => (
                <MusclePill key={m} label={m} />
              ))}
            </div>
          )}

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {num_exercicios != null && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-text-muted)' }}>
                <Dumbbell size={11} style={{ color: 'var(--color-accent)', opacity: 0.75 }} />
                {num_exercicios} exercícios
              </span>
            )}
            {duracao_estimada_min != null && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-text-muted)' }}>
                <Clock size={11} style={{ color: 'var(--color-accent)', opacity: 0.75 }} />
                ~{duracao_estimada_min}min
              </span>
            )}
          </div>
        </div>

        {/* Start button */}
        {onStart && (
          <button
            onClick={onStart}
            className="btn-press tap-highlight"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              fontSize: '0.82rem',
              fontWeight: 700,
              padding: '7px 14px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              color: '#fff',
              boxShadow: '0 0 14px rgba(124,58,237,0.35)',
              flexShrink: 0,
              alignSelf: 'center',
            }}
          >
            Start <ChevronRight size={13} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}
