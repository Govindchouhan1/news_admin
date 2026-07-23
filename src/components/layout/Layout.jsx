import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ConfirmModal from '../ui/ConfirmModal';
import useUiStore from '../../store/uiStore';

const Layout = () => {
  const { sidebarOpen } = useUiStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <Navbar />

      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? 'pl-60' : 'pl-16'
        }`}
      >
        <div className="p-6 animate-fade-in">
          <Outlet />
        </div>
      </main>

      <ConfirmModal />
    </div>
  );
};

export default Layout;
