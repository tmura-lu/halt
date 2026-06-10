import { useEffect, useState } from 'react';
import { getNotifications, markAllNotificationsRead } from '../services/api.js';
import { formatDistanceToNow } from '../utils/helpers.js';
import { avatarUrl } from '../utils/helpers.js';
import { Bell, CheckCheck, Heart, MessageCircle, UserPlus, Trophy, Flame } from 'lucide-react';

function notifIcon(tipo) {
  const t = (tipo || '').toLowerCase();
  if (t.includes('curtida') || t.includes('like'))   return <Heart       size={12} color="#f87171" />;
  if (t.includes('coment'))                           return <MessageCircle size={12} color="#60a5fa" />;
  if (t.includes('follow') || t.includes('segui'))   return <UserPlus     size={12} color="#34d399" />;
  if (t.includes('recorde') || t.includes('pr'))     return <Trophy       size={12} color="#fbbf24" />;
  if (t.includes('streak'))                          return <Flame        size={12} color="#fb923c" />;
  return <Bell size={12} color="#a78bfa" />;
}

function NotifRow({ n }) {
  const autor  = n.usuario_origem || {};
  const isRead = n.is_lida;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '13px 16px',
      borderBottom: '1px solid var(--color-border-subtle)',
      background: isRead ? 'transparent' : 'rgba(124,58,237,0.05)',
      transition: 'background 0.2s',
    }}>
      {/* Avatar + icon badge */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <img
          src={avatarUrl(autor)}
          alt={autor.username || ''}
          style={{
            width: 42, height: 42, borderRadius: '50%', objectFit: 'cover',
            border: '1.5px solid rgba(124,58,237,0.30)',
          }}
        />
        <span style={{
          position: 'absolute', bottom: -2, right: -2,
          width: 20, height: 20, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--color-bg-elevated)',
          border: '1.5px solid var(--color-bg-base)',
        }}>
          {notifIcon(n.tipo)}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.84rem', color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
          {autor.username && (
            <span style={{ fontWeight: 700 }}>@{autor.username} </span>
          )}
          <span style={{ color: 'var(--color-text-secondary)' }}>{n.mensagem}</span>
        </p>
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
          {formatDistanceToNow(n.criado_em)}
        </p>
      </div>

      {/* Unread dot */}
      {!isRead && (
        <span style={{
          width: 9, height: 9, borderRadius: '50%',
          background: 'var(--color-accent)',
          flexShrink: 0,
          boxShadow: '0 0 6px rgba(124,58,237,0.60)',
        }} />
      )}
    </div>
  );
}

export default function AlertsPage() {
  const [today, setToday]        = useState([]);
  const [earlier, setEarlier]    = useState([]);
  const [unreadCount, setUnread] = useState(0);
  const [loading, setLoading]    = useState(true);

  useEffect(() => {
    getNotifications()
      .then(({ data }) => {
        setToday(data.today || []);
        setEarlier(data.earlier || []);
        setUnread(data.unread_count || 0);
      })
      .catch((e) => console.error('Failed to fetch notifications', e))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      const markRead = (list) => list.map((n) => ({ ...n, is_lida: true }));
      setToday(markRead);
      setEarlier(markRead);
      setUnread(0);
    } catch (e) {
      console.error('Failed to mark all read', e);
    }
  };

  return (
    <div>
      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: '20px 16px 14px',
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
            Notificações
          </h1>
          {unreadCount > 0 && (
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: 3 }}>
              {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="btn-press tap-highlight"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: '0.78rem', fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(124,58,237,0.28)',
              color: '#a78bfa',
              marginTop: 4,
            }}
          >
            <CheckCheck size={13} strokeWidth={2.2} />
            Marcar lidas
          </button>
        )}
      </header>

      {/* ── List ── */}
      {loading ? (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 64, borderRadius: 'var(--radius-xl)' }} />
          ))}
        </div>
      ) : (
        <div style={{ background: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-border-subtle)' }}>
          {/* Today */}
          {today.length > 0 && (
            <>
              <p className="section-label">Hoje</p>
              {today.map((n) => <NotifRow key={n.id} n={n} />)}
            </>
          )}

          {/* Earlier */}
          {earlier.length > 0 && (
            <>
              <p className="section-label" style={{ paddingTop: today.length > 0 ? 10 : 8 }}>
                Anteriores
              </p>
              {earlier.map((n) => <NotifRow key={n.id} n={n} />)}
            </>
          )}

          {/* Empty state */}
          {today.length === 0 && earlier.length === 0 && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '60px 24px', textAlign: 'center',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 'var(--radius-xl)',
                background: 'rgba(124,58,237,0.10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 14,
              }}>
                <Bell size={26} style={{ color: 'var(--color-accent)' }} />
              </div>
              <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>
                Nenhuma notificação
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginTop: 4 }}>
                Você está em dia!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
