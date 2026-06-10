import { Dumbbell, Users, Flame, TrendingUp } from 'lucide-react';

export default function StatsGrid({ workouts, best_streak, followers, volume_total_kg }) {
  const formatVolume = (kg) => {
    if (kg == null || kg < 0) return '--';
    return kg >= 1000 ? `${(kg / 1000).toFixed(1)}t` : `${kg}kg`;
  };
  const items = [
    { icon: Dumbbell, value: workouts, label: 'Workouts' },
    { icon: Flame, value: best_streak, label: 'Best Streak' },
    { icon: Users, value: followers, label: 'Followers' },
    { icon: TrendingUp, value: formatVolume(volume_total_kg), label: 'Volume' },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item, idx) => (
        <div key={idx} className="bg-bg-surface rounded-xl p-4 flex flex-col items-center">
          <item.icon className="text-accent w-6 h-6 mb-2" />
          <span className="text-2xl font-bold text-white">{item.value}</span>
          <span className="text-xs text-text-secondary">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
