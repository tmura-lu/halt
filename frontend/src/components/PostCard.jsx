import React, { useState, forwardRef } from 'react';
import { Heart, MessageCircle, Share2, Dumbbell, Clock, Weight } from 'lucide-react';
import { formatDistanceToNow, formatDuration, formatVolume } from '../utils/helpers.js';
import { likePost } from '../services/api.js';
import CommentsPanel from './CommentsPanel.jsx';

/* ── Stats banner ───────────────────────────────────────────── */
function StatsBanner({ stats }) {
  if (!stats) return null;
  const dur = formatDuration(stats.duracao_min);
  const vol = formatVolume(stats.volume_total_kg);
  const exCount = stats.num_exercicios;
  if (!exCount && dur === '--' && vol === '--') return null;

  return (
    <div className="stats-banner" style={{ margin: '10px 0' }}>
      {exCount != null && (
        <span className="stats-banner__item">
          <Dumbbell size={13} style={{ color: 'var(--color-accent)' }} />
          {exCount} exercícios
        </span>
      )}
      {dur !== '--' && (
        <span className="stats-banner__item">
          <Clock size={13} style={{ color: 'var(--color-accent)' }} />
          {dur}
        </span>
      )}
      {vol !== '--' && (
        <span className="stats-banner__item">
          <Weight size={13} style={{ color: 'var(--color-accent)' }} />
          {vol}
        </span>
      )}
    </div>
  );
}

/* ── Image carousel ─────────────────────────────────────────── */
function ImageCarousel({ images }) {
  const [idx, setIdx] = useState(0);
  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt="post"
        style={{
          width: '100%',
          maxHeight: 300,
          objectFit: 'cover',
          borderRadius: 'var(--radius-xl)',
          marginBottom: 10,
          display: 'block',
        }}
      />
    );
  }

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  return (
    <div style={{ position: 'relative', marginBottom: 10 }}>
      <img
        src={images[idx]}
        alt={`slide-${idx}`}
        style={{
          width: '100%',
          maxHeight: 300,
          objectFit: 'cover',
          borderRadius: 'var(--radius-xl)',
          display: 'block',
        }}
      />
      <button
        onClick={prev}
        className="btn-press"
        style={{
          position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
          color: '#fff', border: 'none', borderRadius: '50%',
          width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, lineHeight: 1,
        }}
      >‹</button>
      <button
        onClick={next}
        className="btn-press"
        style={{
          position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
          color: '#fff', border: 'none', borderRadius: '50%',
          width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, lineHeight: 1,
        }}
      >›</button>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 8 }}>
        {images.map((_, i) => (
          <span key={i} className={`carousel-dot${i === idx ? ' active' : ''}`} />
        ))}
      </div>
    </div>
  );
}

/* ── PostCard ───────────────────────────────────────────────── */
const PostCard = forwardRef(function PostCard({ post }, ref) {
  const [liked, setLiked]             = useState(post.liked_by_me);
  const [likeCount, setLikeCount]     = useState(post.total_curtidas);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.total_comentarios);

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => (newLiked ? c + 1 : c - 1));
    try {
      await likePost(post.id);
    } catch {
      setLiked(liked);
      setLikeCount((c) => (newLiked ? c - 1 : c + 1));
    }
  };

  const autor = post.usuario || {};

  return (
    <>
      <article
        ref={ref}
        className="animate-fade-in-up"
        style={{
          background: 'var(--color-bg-surface)',
          borderBottom: '1px solid var(--color-border-subtle)',
          padding: '14px 16px',
        }}
      >
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div className="story-ring" style={{ padding: 2, borderRadius: '50%', flexShrink: 0 }}>
            <img
              src={autor.imagem_perfil_url || `https://api.dicebear.com/8.x/avataaars/svg?seed=${autor.username || 'user'}`}
              alt={autor.username || ''}
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
              {autor.nome || autor.username}
            </p>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              @{autor.username} · {formatDistanceToNow(post.data_post)}
            </p>
          </div>
          {post.sessao_treino_id && (
            <span className="pill--workout">Workout</span>
          )}
        </div>

        {/* ── Stats banner ── */}
        <StatsBanner stats={post.sessao_stats} />

        {/* ── Images ── */}
        <ImageCarousel images={post.imagens} />

        {/* ── Title ── */}
        {post.titulo && (
          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)', marginBottom: 4 }}>
            {post.titulo}
          </p>
        )}

        {/* ── Content ── */}
        {post.conteudo && (
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.55,
            whiteSpace: 'pre-wrap',
            marginBottom: 12,
          }}>
            {post.conteudo}
          </p>
        )}

        {/* ── Footer ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          paddingTop: 10,
          borderTop: '1px solid var(--color-border-subtle)',
        }}>
          <button
            onClick={handleLike}
            className="btn-press tap-highlight"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              color: liked ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              fontSize: '0.85rem', fontWeight: 500,
            }}
          >
            <Heart
              size={18}
              fill={liked ? 'currentColor' : 'none'}
              strokeWidth={liked ? 0 : 1.8}
            />
            {likeCount}
          </button>

          <button
            onClick={() => setShowComments(true)}
            className="btn-press tap-highlight"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              color: 'var(--color-text-secondary)',
              fontSize: '0.85rem', fontWeight: 500,
            }}
          >
            <MessageCircle size={18} strokeWidth={1.8} />
            {commentCount}
          </button>

          <button
            className="btn-press tap-highlight"
            style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }}
          >
            <Share2 size={17} strokeWidth={1.8} />
          </button>
        </div>
      </article>

      <CommentsPanel
        postId={post.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        onCommentAdded={() => setCommentCount((c) => c + 1)}
      />
    </>
  );
});

export default PostCard;
