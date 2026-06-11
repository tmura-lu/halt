import { useEffect, useState } from 'react';
import { getComments, createComment } from '../services/api.js';
import { avatarUrl, formatDistanceToNow } from '../utils/helpers.js';
import { useAuth } from '../context/AuthContext.jsx';
import { X, Send, Loader2 } from 'lucide-react';

export default function CommentsPanel({ postId, isOpen, onClose, onCommentAdded }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newText, setNewText]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [sending, setSending]   = useState(false);
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getComments(postId)
      .then(({ data }) => {
        // Backend returns: { results: [...], count }
        setComments(data.results || []);
      })
      .catch((e) => console.error('Failed to load comments', e))
      .finally(() => setLoading(false));
  }, [isOpen, postId]);

  const handleSend = async () => {
    const text = newText.trim();
    if (!text || sending) return;
    setSending(true);
    setSendError('');

    const optimistic = {
      id: `opt-${Date.now()}`,
      usuario: user,
      mensagem: text,
      criado_em: new Date().toISOString(),
    };
    setComments((c) => [...c, optimistic]);
    setNewText('');

    try {
      const { data } = await createComment(postId, text);
      // Replace optimistic with real
      setComments((c) => c.map((cmt) => (cmt.id === optimistic.id ? data : cmt)));
      onCommentAdded?.();
    } catch (e) {
      setComments((c) => c.filter((cmt) => cmt.id !== optimistic.id));
      setNewText(text); // restore text so user can retry
      setSendError('Não foi possível enviar o comentário. Tente novamente.');
      console.error('Failed to post comment', e);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-lg flex flex-col animate-slide-up sm:animate-fade-in-up rounded-t-3xl sm:rounded-2xl"
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          maxHeight: '80dvh',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
        >
          <h3 className="text-base font-semibold text-text-primary">Comentários</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center btn-press"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <X size={16} className="text-text-secondary" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin w-6 h-6 text-accent" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <span className="text-3xl mb-3">💬</span>
              <p className="text-text-secondary text-sm">Nenhum comentário ainda. Seja o primeiro!</p>
            </div>
          ) : (
            comments.map((c) => {
              const autor = c.usuario || {};
              return (
                <div key={c.id} className="flex items-start gap-3">
                  <img
                    src={avatarUrl(autor)}
                    alt={autor.username || ''}
                    className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                    style={{ border: '1.5px solid rgba(124,58,237,0.4)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-text-primary">
                        {autor.nome || autor.username}
                      </span>
                      <span className="text-xs text-text-muted">
                        {formatDistanceToNow(c.criado_em)}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
                      {c.mensagem}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Error feedback */}
        {sendError && (
          <div
            style={{
              margin: '0 16px 8px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239,68,68,0.10)',
              border: '1px solid rgba(239,68,68,0.25)',
              fontSize: '0.78rem',
              color: '#f87171',
            }}
          >
            {sendError}
          </div>
        )}

        {/* Input */}
        <div
          className="px-4 py-3 flex items-center gap-3"
          style={{ borderTop: '1px solid var(--color-border-subtle)' }}
        >
          {user && (
            <img
              src={avatarUrl(user)}
              alt={user.username || ''}
              className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
              style={{ border: '1.5px solid rgba(124,58,237,0.4)' }}
            />
          )}
          <input
            type="text"
            placeholder="Adicione um comentário…"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={handleKey}
            className="flex-1 text-sm text-text-primary placeholder:text-text-muted rounded-full px-4 py-2 outline-none"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-subtle)',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!newText.trim() || sending}
            className="w-9 h-9 rounded-full flex items-center justify-center btn-press flex-shrink-0 transition-all"
            style={{
              background: newText.trim() ? 'var(--color-accent)' : 'rgba(124,58,237,0.2)',
            }}
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin text-white" />
            ) : (
              <Send size={15} className="text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
