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
      } catch {
        // silently fail — not critical
      }
    };
    fetchUnread();
  }, []);

  const navItems = [
    { to: '/',        icon: Home,     label: 'Feed',    end: true },
    { to: '/workout', icon: Dumbbell, label: 'Workout', end: false },
    { to: '/alerts',  icon: Bell,     label: 'Alertas', end: false, badge: unread },
    { to: '/profile', icon: User,     label: 'Perfil',  end: false },
  ];

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Navegação principal">
      {navItems.map(({ to, icon: Icon, label, end, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `bottom-nav__item tap-highlight${isActive ? ' bottom-nav__item--active' : ''}`
          }
        >
          {({ isActive }) => (
            <>
              {badge > 0 && (
                <span className="bottom-nav__badge">{badge > 9 ? '9+' : badge}</span>
              )}
              <span className="bottom-nav__icon-wrap">
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              </span>
              <span className="bottom-nav__label">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
