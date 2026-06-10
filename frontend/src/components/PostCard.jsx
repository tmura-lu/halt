import React, { useState, forwardRef } from 'react';
import { Heart, HeartOff, MessageCircle, Share2, Dumbbell, Clock, Weight } from 'lucide-react';
import { formatDistanceToNow, formatDuration, formatVolume } from '../utils/helpers.js';
import { likePost } from '../services/api.js';
import CommentsPanel from './CommentsPanel.jsx';

const PostCard = forwardRef(function PostCard({ post }, ref) {
  const [liked, setLiked]               = useState(post.liked_by_me);
  const [likeCount, setLikeCount]       = useState(post.total_curtidas);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showComments, setShowComments]  = useState(false);
  const [commentCount, setCommentCount]  = useState(post.total_comentarios);

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

  const renderStatsBanner = () => {
    const stats = post.sessao_stats;
    if (!stats) return null;

    const dur = formatDuration(stats.duracao_min);
    const vol = formatVolume(stats.volume_total_kg);
    const exCount = stats.num_exercicios;

    // Don't show if there's nothing useful
    if (!exCount && dur === '--' && vol === '--') return null;

    return (
      <div
        className="flex items-center gap-4 rounded-xl px-4 py-2.5 my-3 text-sm"
        style={{
          background: 'rgba(124,58,237,0.12)',
          border: '1px solid rgba(124,58,237,0.25)',
        }}
      >
        {exCount != null && (
          <span className="flex items-center gap-1.5 text-text-secondary">
            <Dumbbell size={14} className="text-accent" />
            <span>{exCount} exercícios</span>
          </span>
        )}
        {dur !== '--' && (
          <span className="flex items-center gap-1.5 text-text-secondary">
            <Clock size={14} className="text-accent" />
            <span>{dur}</span>
          </span>
        )}
        {vol !== '--' && (
          <span className="flex items-center gap-1.5 text-text-secondary">
            <Weight size={14} className="text-accent" />
            <span>{vol}</span>
          </span>
        )}
      </div>
    );
  };

  const renderImages = () => {
    if (!post.imagens || post.imagens.length === 0) return null;
    if (post.imagens.length === 1) {
      return (
        <img
          src={post.imagens[0]}
          alt="post"
          className="w-full rounded-xl mb-3 object-cover max-h-80"
        />
      );
    }
    const next = () => setCarouselIndex((i) => (i + 1) % post.imagens.length);
    const prev = () => setCarouselIndex((i) => (i - 1 + post.imagens.length) % post.imagens.length);
    return (
      <div className="relative mb-3">
        <img
          src={post.imagens[carouselIndex]}
          alt={`slide-${carouselIndex}`}
          className="w-full rounded-xl object-cover max-h-80"
        />
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-white"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        >
          ‹
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-white"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        >
          ›
        </button>
        <div className="flex justify-center gap-1 mt-2">
          {post.imagens.map((_, i) => (
            <span key={i} className={`carousel-dot ${i === carouselIndex ? 'active' : ''}`} />
          ))}
        </div>
      </div>
    );
  };

  const autor = post.usuario || {};

  return (
    <>
      <div
        ref={ref}
        className="rounded-2xl p-4 mb-3 animate-fade-in-up"
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        {/* Header */}
        <div className="flex items-center mb-2">
          <div className="story-ring p-0.5 mr-3 flex-shrink-0">
            <img
              src={
                autor.imagem_perfil_url ||
                `https://api.dicebear.com/8.x/avataaars/svg?seed=${autor.username || 'user'}`
              }
              alt={autor.username || ''}
              className="w-9 h-9 rounded-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-text-primary leading-tight truncate">
              {autor.nome || autor.username}
            </p>
            <p className="text-xs text-text-secondary">
              @{autor.username} · {formatDistanceToNow(post.data_post)}
            </p>
          </div>
          {post.sessao_treino_id && (
            <span
              className="ml-2 text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
              style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}
            >
              Workout
            </span>
          )}
        </div>

        {/* Stats banner */}
        {renderStatsBanner()}

        {/* Images */}
        {renderImages()}

        {/* Title */}
        {post.titulo && (
          <p className="font-semibold text-text-primary mb-1">{post.titulo}</p>
        )}

        {/* Content */}
        {post.conteudo && (
          <p className="text-text-secondary text-sm whitespace-pre-wrap mb-3 leading-relaxed">
            {post.conteudo}
          </p>
        )}

        {/* Footer */}
        <div
          className="flex items-center gap-5 pt-2.5"
          style={{ borderTop: '1px solid var(--color-border-subtle)' }}
        >
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 btn-press tap-highlight transition-colors"
            style={{ color: liked ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
          >
            {liked ? (
              <Heart className="w-[18px] h-[18px]" fill="currentColor" />
            ) : (
              <Heart className="w-[18px] h-[18px]" />
            )}
            <span className="text-sm font-medium">{likeCount}</span>
          </button>

          <button
            onClick={() => setShowComments(true)}
            className="flex items-center gap-1.5 btn-press tap-highlight transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <MessageCircle className="w-[18px] h-[18px]" />
            <span className="text-sm font-medium">{commentCount}</span>
          </button>

          <button
            className="ml-auto btn-press tap-highlight"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Share2 className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>

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
