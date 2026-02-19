'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palmtree, TreeDeciduous, ShieldCheck, Settings, 
  LogOut, User, ChevronRight, Wifi, WifiOff,
  Sun, Leaf, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore, useUIStore, useOfflineStore } from '@/lib/store';
import { GroundCheckPanel } from './GroundCheckPanel';
import { AgronomyPanel } from './AgronomyPanel';
import { QAPanel } from './QAPanel';
import { AdminPanel } from './AdminPanel';

export function Dashboard() {
  const { user, logout } = useAuthStore();
  const { activePanel, setActivePanel } = useUIStore();
  const { isOnline, setOnline } = useOfflineStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Check online status
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setOnline(navigator.onLine);

    // Update time
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timer);
    };
  }, [setOnline]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      logout();
      setActivePanel(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    {
      id: 'groundcheck' as const,
      label: 'Ground Check',
      icon: TreeDeciduous,
      description: 'QC Buah',
      gradient: 'from-orange-500 to-amber-600',
      available: true,
    },
    {
      id: 'agronomy' as const,
      label: 'Agronomy',
      icon: Leaf,
      description: 'Panel Agronomi',
      gradient: 'from-green-500 to-emerald-600',
      available: true,
    },
    {
      id: 'qa' as const,
      label: 'Quality Assurance',
      icon: ShieldCheck,
      description: 'Panel QA',
      gradient: 'from-blue-500 to-indigo-600',
      available: true,
    },
    ...(user?.role === 'admin' ? [{
      id: 'admin' as const,
      label: 'Admin Panel',
      icon: Settings,
      description: 'Manajemen Sistem',
      gradient: 'from-purple-500 to-violet-600',
      available: true,
    }] : []),
  ];

  const renderPanel = () => {
    switch (activePanel) {
      case 'groundcheck':
        return <GroundCheckPanel />;
      case 'agronomy':
        return <AgronomyPanel />;
      case 'qa':
        return <QAPanel />;
      case 'admin':
        return <AdminPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 palm-pattern">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 right-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        >
          <Sun className="w-32 h-32 text-orange-200/30" />
        </motion.div>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: '100vh', opacity: [0, 0.2, 0.2, 0] }}
            transition={{ duration: 15 + i * 5, repeat: Infinity, delay: i * 3 }}
            style={{ left: `${30 + i * 20}%` }}
          >
            <Leaf className="w-6 h-6 text-green-300/40" />
          </motion.div>
        ))}
      </div>

      <div className="flex min-h-screen relative z-10">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-white/80 backdrop-blur-xl border-r border-orange-100 shadow-xl transition-all duration-300 flex flex-col`}
        >
          {/* Logo */}
          <div className="p-6 border-b border-orange-100">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 10 }}
                className="w-12 h-12 sgs-gradient-main rounded-xl flex items-center justify-center shadow-lg"
              >
                <Palmtree className="w-6 h-6 text-white" />
              </motion.div>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h1 className="font-bold text-xl text-gray-800">SGS</h1>
                  <p className="text-xs text-gray-500">Groundcheck System</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActivePanel(activePanel === item.id ? null : item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  activePanel === item.id
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                    : 'hover:bg-orange-50 text-gray-700'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activePanel === item.id ? 'bg-white/20' : `bg-gradient-to-r ${item.gradient} bg-opacity-10`
                }`}>
                  <item.icon className={`w-5 h-5 ${activePanel === item.id ? 'text-white' : ''}`} />
                </div>
                {isSidebarOpen && (
                  <div className="flex-1 text-left">
                    <p className="font-medium">{item.label}</p>
                    <p className={`text-xs ${activePanel === item.id ? 'text-white/70' : 'text-gray-400'}`}>
                      {item.description}
                    </p>
                  </div>
                )}
                {isSidebarOpen && activePanel !== item.id && (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </motion.button>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-orange-100 space-y-3">
            {/* Online Status */}
            <div className={`flex items-center gap-2 p-2 rounded-lg ${
              isOnline ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              {isSidebarOpen && (
                <span className="text-sm font-medium">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              )}
            </div>

            {/* User */}
            <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
              <div className="w-10 h-10 sgs-gradient-main rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{user?.nama}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              )}
            </div>

            {/* Toggle Sidebar */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full text-gray-600 hover:bg-orange-100"
            >
              <Menu className="w-4 h-4" />
            </Button>

            {/* Logout */}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isSidebarOpen && 'Keluar'}
            </Button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-xl border-b border-orange-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {activePanel ? menuItems.find(m => m.id === activePanel)?.label : 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500">
                  {currentTime.toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  {currentTime.toLocaleTimeString('id-ID')}
                </p>
                <p className="text-xs text-gray-400">Waktu Lokal</p>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-auto">
            <AnimatePresence mode="wait">
              {activePanel ? (
                <motion.div
                  key={activePanel}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderPanel()}
                </motion.div>
              ) : (
                <motion.div
                  key="home"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="text-center"
                  >
                    <div className="w-32 h-32 mx-auto mb-6 sgs-gradient-main rounded-3xl flex items-center justify-center shadow-2xl">
                      <Palmtree className="w-16 h-16 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      Selamat Datang di SGS
                    </h1>
                    <p className="text-gray-500 mb-8 max-w-md">
                      SPGE Groundcheck System - Sistem pengelolaan quality control buah kelapa sawit
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      {menuItems.map((item, index) => (
                        <motion.button
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          onClick={() => setActivePanel(item.id)}
                          className={`p-6 rounded-2xl bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all w-48`}
                        >
                          <div className={`w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-r ${item.gradient} flex items-center justify-center`}>
                            <item.icon className="w-7 h-7 text-white" />
                          </div>
                          <p className="font-semibold text-gray-800">{item.label}</p>
                          <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
