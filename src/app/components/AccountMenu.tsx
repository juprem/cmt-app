import React from 'react';
import { motion } from 'framer-motion';
import { User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export const AccountMenu: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-6 right-6 z-50"
    >
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-4 p-4">
          {/* User Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          
          {/* User Info */}
          <div className="flex-1">
            <p className="text-white font-bold text-sm">{user.name}</p>
            <p className="text-slate-400 text-xs">{user.email}</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              className="p-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/10"
              title="Settings"
            >
              <Settings size={18} />
            </button>
            
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-xl hover:bg-red-400/10"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};