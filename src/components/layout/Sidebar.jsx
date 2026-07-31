import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  BarChart3,
  Newspaper,
  Tag,
  Hash,
  MessageSquare,
  Users,
  Settings2,
  Zap,
  Layers,
} from 'lucide-react';
import useUiStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';

const Sidebar = () => {
  const { t } = useTranslation();
  const { sidebarOpen } = useUiStore();
  const user = useAuthStore((s) => s.user);

  const isBoss = user?.role?.toUpperCase() === 'BOSS';

  const ALL_NAV_ITEMS = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'nav.dashboard' },
    { to: '/analytics', icon: BarChart3, label: 'nav.analytics' },
    { to: '/news', icon: Newspaper, label: 'nav.news' },
    { to: '/categories', icon: Tag, label: 'nav.categories' },
    { to: '/sections', icon: Layers, label: 'सेक्शन & लाइव प्रबंधक' },
    { to: '/hashtags', icon: Hash, label: 'nav.hashtags' },
    { to: '/comments', icon: MessageSquare, label: 'nav.comments' },
    { to: '/users', icon: Users, label: 'nav.users' },
    { to: '/ads', icon: Zap, label: 'Ads Manager' },
    { to: '/settings', icon: Settings2, label: 'nav.settings' },
  ];

  const BOSS_NAV_ITEMS = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'nav.dashboard' },
    { to: '/users', icon: Users, label: 'nav.users' },
  ];

  const NAV_ITEMS = isBoss ? BOSS_NAV_ITEMS : ALL_NAV_ITEMS;

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 z-30 ${
        sidebarOpen ? 'w-60' : 'w-16'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 dark:border-gray-800 h-16 shrink-0">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
              News Admin
            </p>
            <p className="text-xs text-gray-400 whitespace-nowrap">Panel</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
            title={!sidebarOpen ? (label.startsWith('nav.') ? t(label) : label) : undefined}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {sidebarOpen && (
              <span className="truncate animate-fade-in">
                {label.startsWith('nav.') ? t(label) : label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer brand */}
      {sidebarOpen && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-400 text-center">
            © 2026 News Portal
          </p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
