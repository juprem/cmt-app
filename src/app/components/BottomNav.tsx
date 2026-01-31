import React from 'react';
import { Timer, Volume2, Euro, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { TabType } from '@/app/App';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  disabled?: boolean;
}

export const BottomNav = ({ activeTab, setActiveTab, disabled }: BottomNavProps) => {
  const tabs = [
    { id: 'timer', icon: Timer, label: 'Timer', emoji: '💩' },
    { id: 'sounds', icon: Volume2, label: 'Sounds', emoji: '🔊' },
    { id: 'salary', icon: Euro, label: 'Salary', emoji: '💶' },
    { id: 'stats', icon: BarChart3, label: 'Stats', emoji: '📊' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 px-4 pb-4 pt-2 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => (!disabled || tab.id === 'salary') && setActiveTab(tab.id as TabType)}
              className={cn(
                "relative flex flex-col items-center gap-1 min-w-[50px]",
                disabled && tab.id !== 'salary' && "opacity-30 cursor-not-allowed pointer-events-none"
              )}
            >
              <motion.div
                whileTap={disabled && tab.id !== 'salary' ? undefined : { scale: 0.9 }}
                className={cn(
                  "p-1.5 rounded-xl transition-all duration-300",
                  isActive ? "bg-gradient-to-tr from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20" : "text-slate-400"
                )}
              >
                <div className="relative">
                  <Icon size={20} />
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-2 -right-2 text-xs"
                    >
                      {tab.emoji}
                    </motion.span>
                  )}
                </div>
              </motion.div>
              <span className={cn(
                "text-[10px] font-medium uppercase tracking-wider transition-colors duration-300",
                isActive ? "text-purple-400" : "text-slate-500"
              )}>
                {tab.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-1 w-1 h-1 bg-purple-500 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
