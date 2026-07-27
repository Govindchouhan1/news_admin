import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/layout/Layout';
import useAuthStore from './store/authStore';

const Login      = lazy(() => import('./pages/Login'));
const Dashboard  = lazy(() => import('./pages/Dashboard'));
const Analytics  = lazy(() => import('./pages/Analytics'));
const NewsList   = lazy(() => import('./pages/News/NewsList'));
const NewsCreate = lazy(() => import('./pages/News/NewsCreate'));
const NewsEdit   = lazy(() => import('./pages/News/NewsEdit'));
const Categories = lazy(() => import('./pages/Categories'));
const Hashtags   = lazy(() => import('./pages/Hashtags'));
const Comments   = lazy(() => import('./pages/Comments'));
const Users      = lazy(() => import('./pages/Users'));
const Settings   = lazy(() => import('./pages/Settings'));
const AdsManager     = lazy(() => import('./pages/AdsManager'));
const SectionManager = lazy(() => import('./pages/SectionManager'));
const DbManage       = lazy(() => import('./pages/DbManage'));
const Websites       = lazy(() => import('./pages/Websites'));
const Admins         = lazy(() => import('./pages/Admins'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
  </div>
);

// Restricted route for Non-Boss pages (If BOSS role tries to access, redirect to /dashboard)
const NonBossRoute = ({ element }) => {
  const user = useAuthStore((s) => s.user);
  if (user?.role?.toUpperCase() === 'BOSS') {
    return <Navigate to="/dashboard" replace />;
  }
  return element;
};

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"       element={<Dashboard />} />
              <Route path="/users"           element={<Users />} />
              <Route path="/websites"        element={<Websites />} />
              <Route path="/admins"          element={<Admins />} />
              <Route path="/db-manage"       element={<DbManage />} />

              {/* Pages restricted for BOSS role */}
              <Route path="/analytics"       element={<NonBossRoute element={<Analytics />} />} />
              <Route path="/news"            element={<NonBossRoute element={<NewsList />} />} />
              <Route path="/news/create"     element={<NonBossRoute element={<NewsCreate />} />} />
              <Route path="/news/:id/edit"   element={<NonBossRoute element={<NewsEdit />} />} />
              <Route path="/categories"      element={<NonBossRoute element={<Categories />} />} />
              <Route path="/hashtags"        element={<NonBossRoute element={<Hashtags />} />} />
              <Route path="/comments"        element={<NonBossRoute element={<Comments />} />} />
              <Route path="/ads"             element={<NonBossRoute element={<AdsManager />} />} />
              <Route path="/sections"        element={<NonBossRoute element={<SectionManager />} />} />
              <Route path="/settings"       element={<NonBossRoute element={<Settings />} />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>

      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: {
            fontSize: '13px',
            fontWeight: '500',
            borderRadius: '10px',
            padding: '12px 16px',
          },
          success: {
            style: {
              background: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
            },
            iconTheme: { primary: '#16a34a', secondary: '#f0fdf4' },
          },
          error: {
            style: {
              background: '#fff1f2',
              color: '#991b1b',
              border: '1px solid #fecdd3',
            },
            iconTheme: { primary: '#dc2626', secondary: '#fff1f2' },
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
