import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import i18n from '../i18n';
import { Globe, Sun, Moon } from 'lucide-react';

const schema = z.object({
  email: z.string().min(1, 'validation.required').email('validation.email'),
  password: z.string().min(1, 'validation.required'),
});

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
];

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [showPassword, setShowPassword] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email, password }) => {
    try {
      const { data } = await authService.login(email, password);
      const { user, accessToken, refreshToken } = data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(t('auth.login'));
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || t('auth.loginError');
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 items-center justify-center p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border-2 border-white"
              style={{
                width: `${(i + 1) * 120}px`,
                height: `${(i + 1) * 120}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        <div className="relative text-white text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur mb-6">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">News Portal</h1>
          <p className="text-primary-100 text-lg mb-8">Admin Management Panel</p>
          <div className="flex flex-col gap-3 text-sm text-primary-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-300" />
              News Management
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-300" />
              Categories & Hashtags
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-300" />
              Comments & Users
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-300" />
              Analytics & Statistics
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-end gap-2 p-4">
          {/* Language */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((o) => !o)}
              className="btn-ghost px-3 py-2 gap-1.5 text-xs"
            >
              <Globe className="w-4 h-4" />
              {i18n.language === 'en' ? 'EN' : 'HI'}
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-1 w-44 card shadow-lg py-1 z-10 animate-fade-in">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      i18n.changeLanguage(lang.code);
                      localStorage.setItem('lang', lang.code);
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
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

          {/* Theme */}
          <button onClick={toggleTheme} className="btn-ghost p-2">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">News Admin</p>
                <p className="text-xs text-gray-400">Management Panel</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1.5">
              {t('auth.loginTitle')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              {t('auth.loginSubtitle')}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div>
                <label className="label">{t('auth.email')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    className={`input-field pl-9 ${errors.email ? 'error' : ''}`}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{t(errors.email.message)}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="label">{t('auth.password')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.passwordPlaceholder')}
                    className={`input-field pl-9 pr-10 ${errors.password ? 'error' : ''}`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{t(errors.password.message)}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full justify-center py-2.5"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    {t('auth.loggingIn')}
                  </>
                ) : (
                  t('auth.loginButton')
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
