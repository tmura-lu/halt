import { useEffect, useState } from 'react';
import { getStories } from '../services/api.js';
import { avatarUrl } from '../utils/helpers.js';
import { useAuth } from '../context/AuthContext.jsx';

const StoryItem = ({ src, label }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 60, flexShrink: 0 }}>
    <div className="story-ring" style={{ padding: 2.5, borderRadius: '50%' }}>
      <img
        src={src}
        alt={label}
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          objectFit: 'cover',
          display: 'block',
          background: 'var(--color-bg-elevated)',
        }}
      />
    </div>
    <span
      style={{
        fontSize: 11,
        color: 'var(--color-text-secondary)',
        marginTop: 5,
        textAlign: 'center',
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  </div>
);

export default function StoriesRow() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getStories()
      .then((resp) => {
        if (mounted) setStories(resp.data.results || []);
      })
      .catch((e) => console.error('Failed to load stories', e))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <div
      style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6 }}
      className="no-scrollbar"
    >
      {user && (
        <StoryItem src={avatarUrl(user)} label="Você" />
      )}

      {loading
        ? Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0 }}
            />
          ))
        : stories.map((story) => (
            <StoryItem
              key={story.id}
              src={avatarUrl(story)}
              label={story.username}
            />
          ))}
    </div>
  );
}
