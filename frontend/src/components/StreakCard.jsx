import { Flame } from 'lucide-react';
import { avatarUrl } from '../utils/helpers.js';

export default function StreakCard({ streak_atual, maior_streak, user }) {
  return (
    <div className="bg-streak-bg border border-streak-border rounded-xl p-4 flex items-center relative">
      <Flame className="text-streak-icon w-8 h-8 mr-3" />
      <div className="flex-1">
        <h3 className="text-xl font-bold text-white">{streak_atual} Day Streak 🔥</h3>
        <p className="text-sm text-text-secondary">Best: {maior_streak} days · Keep it going!</p>
      </div>
      {/* Optional active badge */}
      <span className="bg-orange-500/20 text-orange-400 text-xs rounded-full px-2 py-0.5 absolute top-2 right-2">
        Active
      </span>
    </div>
  );
}
