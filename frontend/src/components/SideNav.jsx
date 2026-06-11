import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, Bell, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function SideNav() {
  const { user } = useAuth();
  const unread = user?.unread_count ?? 0; // placeholder, actual count fetched elsewhere

  const navItems = [
    { to: '/', icon: Home, label: 'Feed' },
    { to: '/workout', icon: Dumbbell, label: 'Workout' },
    { to: '/alerts', icon: Bell, label: 'Alerts', badge: unread },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[220px] bg-bg-surface border-r border-border-subtle">
      <div className="flex items-center justify-center py-4 text-2xl font-bold text-white">
        halt.
        <span className="text-accent">.</span>
      </div>
      <ul className="flex-1 space-y-2 px-2">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <li key={to} className="relative">
            <NavLink
              to={to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 py-2 px-3 rounded-md ${
                  isActive ? 'bg-accent-muted text-accent' : 'text-text-secondary hover:bg-bg-elevated'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
              {badge > 0 && (
                <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-accent text-white">
                  {badge}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
