import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import i18n from '../../i18n';
import {
  Menu,
  Sun,
  Moon,
  Globe,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिन्दी', short: 'HI' },
];

const Navbar = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUiStore();

  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const langRef = useRef(null);
  const profileRef = useRef(null);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLangChange = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('lang', code);
    setLangOpen(false);
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) await authService.logout(refreshToken);
    } catch (_) {}
    logout();
    toast.success(t('auth.logout'));
  };

  return (
    <header className="fixed top-0 right-0 left-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-3 z-20 transition-all duration-300">
      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="btn-ghost p-2"
        title="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn-ghost p-2"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* Language switcher */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLangOpen((o) => !o)}
            className="btn-ghost px-3 py-2 gap-1.5"
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-medium hidden sm:block">
              {currentLang.short}
            </span>
            <ChevronDown className="w-3 h-3 hidden sm:block" />
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-2 w-44 card shadow-lg py-1 animate-fade-in z-50">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLangChange(lang.code)}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    lang.code === i18n.language
                      ? 'text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
              <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                {user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                {user?.name || user?.username || 'Admin'}
              </p>
              <p className="text-xs text-gray-400 leading-tight">{user?.role || 'ADMIN'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 card shadow-lg py-1 animate-fade-in z-50">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {user?.name} {user?.surname}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <Link
                to="/users"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <User className="w-4 h-4" />
                {t('users.title')}
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('auth.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
