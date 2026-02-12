'use client';

import { motion } from 'framer-motion';
import { Calculator } from 'lucide-react';

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = "Chargement..." }: LoadingProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-foreground flex items-center justify-center">
      <div className="text-center">
        {/* Animated loader */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-500 rounded-full" />
          </motion.div>
          
          {/* Middle ring */}
          <motion.div
            className="absolute inset-4 border-4 border-purple-500/30 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-purple-500 rounded-full" />
          </motion.div>
          
          {/* Inner ring */}
          <motion.div
            className="absolute inset-8 border-4 border-cyan-500/30 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-500 rounded-full" />
          </motion.div>
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Calculator className="w-8 h-8 text-foreground" />
          </div>
        </div>

        {/* Loading text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-foreground"
        >
          {message}
        </motion.p>

        {/* Animated dots */}
        <motion.div
          className="flex justify-center gap-2 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-indigo-500 rounded-full"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
