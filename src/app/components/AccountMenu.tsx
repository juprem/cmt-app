import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import { Dropdown, Avatar, MenuProps } from 'antd';
import { useAuth } from '../lib/AuthContext';

export const AccountMenu: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  const items: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div className="px-2 py-2 border-b border-white/5 mb-1">
          <p className="text-white font-bold text-sm truncate">{user.name}</p>
          <p className="text-slate-400 text-xs truncate">{user.email}</p>
        </div>
      ),
      disabled: true,
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <Settings size={14} />,
      onClick: () => console.log('Settings clicked'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Disconnect',
      icon: <LogOut size={14} />,
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <div className="fixed top-6 right-6 z-[100]">
      <Dropdown
        menu={{
          items,
          className: "bg-slate-900/95 backdrop-blur-xl border border-white/10 p-1 rounded-2xl shadow-2xl min-w-[180px]",
        }}
        placement="bottomRight"
        trigger={['click']}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center p-0.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full border border-white/20 shadow-lg shadow-purple-500/10 hover:border-purple-500/50 transition-all cursor-pointer"
        >
          <Avatar
            size={40}
            className="bg-gradient-to-br from-purple-500 to-pink-500 font-bold border-2 border-slate-950"
            style={{ display: 'flex', alignItems: 'center', justifyItems: 'center' }}
          >
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
        </motion.button>
      </Dropdown>
    </div>
  );
};