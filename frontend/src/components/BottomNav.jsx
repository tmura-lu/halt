import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, Bell, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getNotifications } from '../services/api.js';

export default function BottomNav() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await getNotifications();
        setUnread(data.unread_count || 0);
      } catch (e) {
        // silently fail — not critical
      }
    };
    fetchUnread();
  }, []);

  const linkClass = (isActive) =>
    isActive
      ? 'flex-1 text-center border-t-2 border-accent text-white py-2'
      : 'flex-1 text-center text-text-secondary py-2';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-surface border-t border-border-subtle flex">
      <NavLink to="/" className={({ isActive }) => linkClass(isActive)}>
        <Home size={20} className="mx-auto" />
        <span className="block text-xs">Feed</span>
      </NavLink>
      <NavLink to="/workout" className={({ isActive }) => linkClass(isActive)}>
        <Dumbbell size={20} className="mx-auto" />
        <span className="block text-xs">Workout</span>
      </NavLink>
      <NavLink to="/alerts" className={({ isActive }) => linkClass(isActive)}>
        <div className="relative inline-block">
          <Bell size={20} className="mx-auto" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-2 bg-accent text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {unread}
            </span>
          )}
        </div>
        <span className="block text-xs">Alerts</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => linkClass(isActive)}>
        <User size={20} className="mx-auto" />
        <span className="block text-xs">Profile</span>
      </NavLink>
    </nav>
  );
}
