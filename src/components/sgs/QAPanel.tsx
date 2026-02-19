'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Construction } from 'lucide-react';

export function QAPanel() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl mb-8"
      >
        <ShieldCheck className="w-16 h-16 text-white" />
      </motion.div>
      
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold text-gray-800 mb-3"
      >
        Quality Assurance
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-500 text-center max-w-md mb-8"
      >
        Fitur Quality Assurance sedang dalam pengembangan. 
        Panel ini akan menyediakan fitur jaminan kualitas produk.
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center"
      >
        <Construction className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h3 className="font-semibold text-blue-800 mb-2">Segera Hadir</h3>
        <p className="text-blue-600 text-sm">
          Fitur Quality Assurance akan segera tersedia dalam update mendatang
        </p>
      </motion.div>
    </div>
  );
}
