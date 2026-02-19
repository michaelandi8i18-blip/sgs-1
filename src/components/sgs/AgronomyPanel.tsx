'use client';

import { motion } from 'framer-motion';
import { Leaf, Construction } from 'lucide-react';

export function AgronomyPanel() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl mb-8"
      >
        <Leaf className="w-16 h-16 text-white" />
      </motion.div>
      
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold text-gray-800 mb-3"
      >
        Panel Agronomy
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-500 text-center max-w-md mb-8"
      >
        Fitur Agronomy sedang dalam pengembangan. 
        Panel ini akan menyediakan fitur pemantauan dan analisis agronomi.
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
      >
        <Construction className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="font-semibold text-green-800 mb-2">Segera Hadir</h3>
        <p className="text-green-600 text-sm">
          Fitur agronomy akan segera tersedia dalam update mendatang
        </p>
      </motion.div>
    </div>
  );
}
