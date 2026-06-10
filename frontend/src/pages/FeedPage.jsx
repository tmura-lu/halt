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
  const initialLoad = useState(false);

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
    <div className="p-4 pb-6">
      {/* Compact header */}
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1
            className="text-2xl font-bold text-text-primary leading-none"
            style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}
          >
            halt.
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Your fitness community</p>
        </div>
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          {user && (
            <img
              src={avatarUrl(user)}
              alt={user.username}
              className="w-9 h-9 rounded-full object-cover"
              style={{ border: '2px solid rgba(124,58,237,0.6)' }}
            />
          )}
        </div>
      </header>

      {/* Stories */}
      <StoriesRow />

      {/* Posts */}
      <div className="mt-4 space-y-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin w-6 h-6 text-accent" />
          </div>
        )}

        {!loading && hasMore && posts.length > 0 && (
          <button
            onClick={() => fetchPosts(nextCursor)}
            className="w-full py-3 text-sm text-accent font-medium btn-press"
          >
            Carregar mais
          </button>
        )}

        {!loading && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}
            >
              <span className="text-3xl">🏋️</span>
            </div>
            <p className="text-text-primary font-semibold mb-1">Nenhum post ainda</p>
            <p className="text-text-secondary text-sm">
              Registre seu primeiro treino e compartilhe com a comunidade!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
