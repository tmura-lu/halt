import { useEffect, useState } from 'react';
import { getFeed } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { avatarUrl } from '../utils/helpers.js';
import PostCard from '../components/PostCard.jsx';
import StoriesRow from '../components/StoriesRow.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { Loader2 } from 'lucide-react';

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts]           = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [hasMore, setHasMore]       = useState(true);

  const fetchPosts = async (cursor = null) => {
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await getFeed(cursor);
      setPosts((prev) => (cursor ? [...prev, ...(data.results || [])] : (data.results || [])));
      setNextCursor(data.next_cursor || null);
      setHasMore(!!data.has_more);
    } catch (e) {
      console.error('Failed to load feed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 16px 12px',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}>
        <div>
          <h1 style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-display)',
            lineHeight: 1,
          }}>
            halt.
          </h1>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
            Your fitness community
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ThemeToggle />
          {user && (
            <img
              src={avatarUrl(user)}
              alt={user.username}
              style={{
                width: 34, height: 34, borderRadius: '50%', objectFit: 'cover',
                border: '2px solid rgba(124,58,237,0.55)',
              }}
            />
          )}
        </div>
      </header>

      {/* ── Stories ── */}
      <div style={{ padding: '12px 16px 10px' }}>
        <StoriesRow />
      </div>

      {/* ── Feed posts — full-bleed list ── */}
      <div style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
            <Loader2 size={22} style={{ color: 'var(--color-accent)', animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}

        {!loading && hasMore && posts.length > 0 && (
          <button
            onClick={() => fetchPosts(nextCursor)}
            className="btn-press tap-highlight"
            style={{
              width: '100%', padding: '14px',
              fontSize: '0.85rem', fontWeight: 600,
              color: 'var(--color-accent)',
              borderTop: '1px solid var(--color-border-subtle)',
            }}
          >
            Carregar mais
          </button>
        )}

        {!loading && posts.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '64px 24px', textAlign: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 'var(--radius-xl)',
              background: 'rgba(124,58,237,0.10)',
              border: '1px solid rgba(124,58,237,0.20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 28 }}>🏋️</span>
            </div>
            <p style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '0.9rem', marginBottom: 4 }}>
              Nenhum post ainda
            </p>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem' }}>
              Registre seu primeiro treino e compartilhe com a comunidade!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
