import { useEffect, useState } from 'react';
import { getNotifications, markAllNotificationsRead } from '../services/api.js';
import { formatDistanceToNow } from '../utils/helpers.js';
import { avatarUrl } from '../utils/helpers.js';
import { Bell, CheckCheck, Heart, MessageCircle, UserPlus, Trophy, Flame } from 'lucide-react';

function notifIcon(tipo) {
  const t = (tipo || '').toLowerCase();
  if (t.includes('curtida') || t.includes('like')) return <Heart size={14} className="text-rose-400" />;
  if (t.includes('coment')) return <MessageCircle size={14} className="text-blue-400" />;
  if (t.includes('follow') || t.includes('segui')) return <UserPlus size={14} className="text-emerald-400" />;
  if (t.includes('recorde') || t.includes('pr')) return <Trophy size={14} className="text-yellow-400" />;
  if (t.includes('streak')) return <Flame size={14} className="text-orange-400" />;
  return <Bell size={14} className="text-accent" />;
}

function NotifRow({ n }) {
  const autor = n.usuario_origem || {};
  const isRead = n.is_lida;
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 transition-colors"
      style={{
        borderBottom: '1px solid var(--color-border-subtle)',
        background: isRead ? 'transparent' : 'rgba(124,58,237,0.06)',
      }}
    >
      {/* Avatar with icon overlay */}
      <div className="relative flex-shrink-0">
        <img
          src={avatarUrl(autor)}
          alt={autor.username || ''}
          className="w-10 h-10 rounded-full object-cover"
          style={{ border: '1.5px solid rgba(124,58,237,0.3)' }}
        />
        <span
          className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: 'var(--color-bg-elevated)', border: '1.5px solid var(--color-bg-surface)' }}
        >
          {notifIcon(n.tipo)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary leading-snug">
          {autor.username && (
            <span className="font-semibold">@{autor.username} </span>
          )}
          <span className="text-text-secondary">{n.mensagem}</span>
        </p>
        <p className="text-xs text-text-muted mt-0.5">{formatDistanceToNow(n.criado_em)}</p>
      </div>

      {/* Unread dot */}
      {!isRead && (
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: 'var(--color-accent)' }}
        />
      )}
    </div>
  );
}

export default function AlertsPage() {
  const [today, setToday]         = useState([]);
  const [earlier, setEarlier]     = useState([]);
  const [unreadCount, setUnread]  = useState(0);
  const [loading, setLoading]     = useState(true);

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
    <div className="p-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Notificações</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-text-secondary mt-0.5">{unreadCount} não lidas</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-sm font-medium btn-press transition-colors px-3 py-1.5 rounded-lg"
            style={{
              background: 'rgba(124,58,237,0.15)',
              color: '#a78bfa',
              border: '1px solid rgba(124,58,237,0.25)',
            }}
          >
            <CheckCheck size={15} />
            Marcar lidas
          </button>
        )}
      </header>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--color-border-subtle)' }}
        >
          {today.length > 0 && (
            <>
              <div
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-text-muted"
                style={{ background: 'var(--color-bg-elevated)' }}
              >
                Hoje
              </div>
              {today.map((n) => <NotifRow key={n.id} n={n} />)}
            </>
          )}
          {earlier.length > 0 && (
            <>
              <div
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-text-muted"
                style={{ background: 'var(--color-bg-elevated)' }}
              >
                Anteriores
              </div>
              {earlier.map((n) => <NotifRow key={n.id} n={n} />)}
            </>
          )}
          {today.length === 0 && earlier.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <Bell size={40} className="text-text-muted mb-3" />
              <p className="text-text-secondary font-medium">Nenhuma notificação</p>
              <p className="text-text-muted text-sm mt-1">Você está em dia!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
