import { useEffect, useState } from 'react';
import { getStories } from '../services/api.js';
import { avatarUrl } from '../utils/helpers.js';
import { useAuth } from '../context/AuthContext.jsx';
import { User } from 'lucide-react';

export default function StoriesRow() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchStories = async () => {
      try {
        const resp = await getStories();
        // Backend returns: { results: [...users], me: {...} }
        if (mounted) setStories(resp.data.results || []);
      } catch (e) {
        console.error('Failed to load stories', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchStories();
    return () => {
      mounted = false;
    };
  }, []);

  const renderCurrentUser = () => (
    <div key="you" className="flex flex-col items-center w-16">
      <div className="story-ring p-0.5">
        <img
          src={avatarUrl(user)}
          alt="You"
          className="w-12 h-12 rounded-full object-cover"
        />
      </div>
      <span className="text-xs text-text-secondary text-center mt-1 truncate w-full">
        Você
      </span>
    </div>
  );

  const renderItem = (story) => (
    <div key={story.id} className="flex flex-col items-center w-16">
      <div className="story-ring p-0.5">
        <img
          src={avatarUrl(story)}
          alt={story.username}
          className="w-12 h-12 rounded-full object-cover"
        />
      </div>
      <span className="text-xs text-text-secondary text-center mt-1 truncate w-full">
        {story.username}
      </span>
    </div>
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
      {renderCurrentUser()}
      {loading
        ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-16 h-16 bg-bg-surface rounded-full animate-pulse" />
          ))
        : stories.map(story => renderItem(story))}
    </div>
  );
}
