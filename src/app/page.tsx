// SGS - SPGE Groundcheck System
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palmtree, Sun, Leaf } from 'lucide-react';
import { LoginModal } from '@/components/sgs/LoginModal';
import { Dashboard } from '@/components/sgs/Dashboard';
import { useAuthStore } from '@/lib/store';
import { Toaster } from '@/components/ui/sonner';

export default function HomePage() {
  const { isAuthenticated, login } = useAuthStore();
  const [showLogin, setShowLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        
        if (data.success && data.user) {
          login(data.user);
        } else {
          setShowLogin(true);
        }
      } catch {
        setShowLogin(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, [login]);

  // Seed database on first load
  useEffect(() => {
    const seedDatabase = async () => {
      try {
        await fetch('/api/seed', { method: 'POST' });
      } catch {
        // Ignore seed errors
      }
    };
    seedDatabase();
  }, []);

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 mx-auto mb-6 sgs-gradient-main rounded-2xl flex items-center justify-center shadow-xl"
          >
            <Palmtree className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">SGS</h1>
          <p className="text-gray-500">Memuat sistem...</p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5 }}
            className="h-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full mt-4 max-w-xs mx-auto"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      
      <AnimatePresence mode="wait">
        {isAuthenticated ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard />
          </motion.div>
        ) : (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 palm-pattern"
          >
            {/* Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <motion.div
                className="absolute top-20 right-20"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              >
                <Sun className="w-48 h-48 text-orange-200/20" />
              </motion.div>
              
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: '100vh', opacity: [0, 0.3, 0.3, 0] }}
                  transition={{ duration: 10 + i * 3, repeat: Infinity, delay: i * 2 }}
                  style={{ left: `${15 + i * 15}%` }}
                >
                  <Leaf className="w-8 h-8 text-green-300/50" />
                </motion.div>
              ))}
            </div>

            {/* Landing Content */}
            <div className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
              <motion.div
                initial={{ scale: 0, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 15, delay: 0.2 }}
                className="text-center max-w-lg"
              >
                {/* Logo */}
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-32 h-32 mx-auto mb-8 sgs-gradient-main rounded-3xl flex items-center justify-center shadow-2xl"
                >
                  <Palmtree className="w-16 h-16 text-white" />
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl font-bold text-gray-800 mb-2"
                >
                  SGS
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg text-orange-600 font-medium mb-2"
                >
                  SPGE Groundcheck System
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-gray-500 mb-8"
                >
                  Sistem pengelolaan quality control buah kelapa sawit untuk mendukung operasional perkebunan
                </motion.p>

                {/* Features */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="grid grid-cols-2 gap-4 mb-8"
                >
                  {[
                    { icon: '🌴', label: 'QC Buah' },
                    { icon: '📍', label: 'GPS Tracking' },
                    { icon: '📸', label: 'Camera Capture' },
                    { icon: '📄', label: 'PDF Report' },
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      className="bg-white/80 backdrop-blur-sm border border-orange-100 rounded-xl p-4 text-center"
                    >
                      <span className="text-2xl mb-2 block">{feature.icon}</span>
                      <span className="text-sm text-gray-600">{feature.label}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Login Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLogin(true)}
                  className="w-full py-4 sgs-btn-primary rounded-xl text-lg font-semibold shadow-lg"
                >
                  Masuk ke Sistem
                </motion.button>

                {/* Footer */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-xs text-gray-400 mt-8"
                >
                  © 2024 SPGE Groundcheck System. All rights reserved.
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
