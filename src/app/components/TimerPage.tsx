import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Droplets } from 'lucide-react';
import { useTimer } from '@/app/lib/TimerContext';

interface TimerPageProps {
  hourlyRate: number;
}

export const TimerPage = ({ hourlyRate }: TimerPageProps) => {
  const {
    isActive,
    seconds,
    earnings,
    poopLevel,
    startTimer,
    pauseTimer,
    stopTimer,
    statusMessages
  } = useTimer();

  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statusMessages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [statusMessages.length]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-full flex flex-col items-center justify-between py-12 px-6 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 animate-gradient-slow overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.4),transparent_50%)] animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-yellow-500/10 via-green-500/10 via-blue-500/10 to-purple-500/10 animate-rainbow opacity-30 mix-blend-overlay" />
        <AnimatePresence>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: '110vh', x: `${Math.random() * 100}vw`, rotate: 0 }}
              animate={{
                y: '-10vh',
                rotate: 360,
                x: `${Math.random() * 100}vw`
              }}
              transition={{
                duration: 15 + Math.random() * 20,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 10
              }}
              className="absolute text-4xl opacity-10 pointer-events-none"
            >
              {['💩', '💸', '🚽', '🌈', '💎', '🔥'][i % 6]}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Top Header */}
      <div className="text-center z-10">
        <motion.h1
          className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 mb-2"
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          CTM
        </motion.h1>
        <p className="text-slate-300 font-medium tracking-widest text-xs uppercase">Compte Ta Merde</p>
      </div>

      {/* Timer Circle */}
      <div className="relative flex flex-col items-center justify-center py-8">
        <motion.div
          className="w-72 h-72 rounded-full border-4 border-white/10 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xl bg-white/5"
          animate={{ scale: isActive ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="144"
              cy="144"
              r="130"
              fill="transparent"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="8"
            />
            <motion.circle
              cx="144"
              cy="144"
              r="130"
              fill="transparent"
              stroke="url(#timerGradient)"
              strokeWidth="10"
              strokeDasharray="816"
              strokeDashoffset={816 - (816 * (seconds % 60)) / 60}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>

          <motion.div
            key={earnings}
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-mono font-black text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]"
          >
            €{earnings.toFixed(2)}
          </motion.div>
          <div className="text-xl font-mono text-white/60 mt-2">
            {formatTime(seconds)}
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={statusIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-[10px] text-purple-300/80 uppercase font-bold tracking-tighter text-center px-8 mt-4"
            >
              {statusMessages[statusIndex]}
            </motion.p>
          </AnimatePresence>

          <motion.div
            animate={{
              y: [0, -5, 0],
              scale: 1 + (poopLevel - 1) * 0.05
            }}
            transition={{
              y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
              scale: { type: "spring", stiffness: 300 }
            }}
            className="mt-4 flex flex-col items-center"
          >
            <div className="relative">
              <motion.span
                className="text-4xl filter drop-shadow-xl select-none block"
                animate={{ rotateY: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                {poopLevel > 5 ? '👑' : poopLevel > 3 ? '💩' : '💩'}
              </motion.span>
              {poopLevel > 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 text-[8px] font-black rounded-full w-6 h-6 flex items-center justify-center border border-white"
                >
                  LVL {poopLevel}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-sm flex flex-col gap-4 z-10">
        <div className="flex gap-4">
          {!isActive ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={startTimer}
              className="flex-1 h-16 rounded-3xl bg-green-500 hover:bg-green-400 text-white font-black text-xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all"
            >
              <Play fill="currentColor" size={24} />
              START
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={pauseTimer}
              className="flex-1 h-16 rounded-3xl bg-yellow-500 hover:bg-yellow-400 text-white font-black text-xl flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/30 border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1 transition-all"
            >
              <Pause fill="currentColor" size={24} />
              PAUSE
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={stopTimer}
            className="w-16 h-16 rounded-3xl bg-red-500 hover:bg-red-400 text-white flex items-center justify-center shadow-lg shadow-red-500/30 border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all"
          >
            <Droplets size={24} />
          </motion.button>
        </div>

        <p className="text-center text-white/40 text-[10px] uppercase tracking-widest font-bold">
          Hourly Rate: €{hourlyRate.toFixed(2)}/hr
        </p>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes gradient-slow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-slow {
          background-size: 200% 200%;
          animation: gradient-slow 15s ease infinite;
        }
      `}} />
    </div>
  );
};
