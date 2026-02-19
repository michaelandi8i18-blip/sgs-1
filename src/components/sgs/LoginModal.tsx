'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, EyeOff, LogIn, User, Lock, Loader2, 
  Palmtree, Leaf, Sun, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/store';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        login(data.user);
        onClose();
      } else {
        setError(data.error || 'Login gagal');
      }
    } catch {
      setError('Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-orange-900/90 via-orange-800/80 to-amber-900/90 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ y: -100, rotate: 0, opacity: 0 }}
                animate={{ 
                  y: '100vh', 
                  rotate: 360, 
                  opacity: [0, 0.3, 0.3, 0] 
                }}
                transition={{ 
                  duration: 10 + i * 2, 
                  repeat: Infinity, 
                  delay: i * 2 
                }}
                style={{ left: `${20 + i * 15}%` }}
              >
                <Leaf className="w-8 h-8 text-green-300" />
              </motion.div>
            ))}
          </div>

          {/* Login Card */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-orange-200">
              {/* Header */}
              <div className="sgs-gradient-main p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 left-4">
                    <Palmtree className="w-16 h-16 text-white animate-float" />
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <Palmtree className="w-12 h-12 text-white animate-float delay-500" />
                  </div>
                </div>
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="relative z-10"
                >
                  <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Sun className="w-10 h-10 text-yellow-200 animate-pulse" />
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-1">SGS</h1>
                  <p className="text-orange-100 text-sm">SPGE Groundcheck System</p>
                </motion.div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-5"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Selamat Datang</h2>
                    <p className="text-gray-500 text-sm mt-1">Silakan masuk ke akun Anda</p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-700 font-medium">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Masukkan username"
                        className="pl-12 h-12 rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan password"
                        className="pl-12 pr-12 h-12 rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 sgs-btn-primary rounded-xl text-lg flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        <span>Masuk</span>
                      </>
                    )}
                  </Button>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-center text-gray-400 text-xs">
                      Default: admin / admin123 atau krani1 / user123
                    </p>
                  </div>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
