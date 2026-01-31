import React, { useState, useEffect } from 'react';
import { Timer, Volume2, Euro, BarChart3, Settings } from 'lucide-react';
import { ConfigProvider, theme } from 'antd';
import { TimerPage } from '@/app/components/TimerPage';
import { SoundboardPage } from '@/app/components/SoundboardPage';
import { SalaryPage } from '@/app/components/SalaryPage';
import { AnalyticsPage } from '@/app/components/AnalyticsPage';
import { BottomNav } from '@/app/components/BottomNav';
import { AuthPage } from '@/app/components/AuthPage';
import { AccountMenu } from '@/app/components/AccountMenu';
import { AuthProvider, useAuth } from '@/app/lib/AuthContext';
import { TimerProvider } from '@/app/lib/TimerContext';

import { Toaster } from '@/app/components/ui/sonner';

// Types
export type TabType = 'timer' | 'sounds' | 'salary' | 'stats';

function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('timer');

  // Salary Gate: If user hasn't set an hourly rate, force them to the salary page
  useEffect(() => {
    if (isAuthenticated && (!user?.hourly_rate || Number(user.hourly_rate) <= 0) && activeTab !== 'salary') {
      setActiveTab('salary');
    }
  }, [isAuthenticated, user?.hourly_rate, activeTab]);

  // Initialize database on app start
  useEffect(() => {
    const initDB = async () => {
      try {
        const { authService } = await import('@/app/lib/auth');
        await authService.initDatabase();
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    initDB();
  }, []);

  if (isLoading && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">
            💩
          </div>
          <p className="text-white text-lg font-medium">Loading CTM...</p>
        </div>
      </div>
    );
  }

  const hasSalarySet = user?.hourly_rate && Number(user.hourly_rate) > 0;

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#A855F7',
          borderRadius: 16,
        },
      }}
    >
      <div className="flex flex-col h-screen w-full bg-slate-950 text-white overflow-hidden safe-area-bottom">
        {!isAuthenticated ? (
          <AuthPage />
        ) : (
          <TimerProvider hourlyRate={Number(user?.hourly_rate || 0)}>
            <style dangerouslySetInnerHTML={{
              __html: `
              :root {
                --sat: env(safe-area-inset-top);
                --sar: env(safe-area-inset-right);
                --sab: env(safe-area-inset-bottom);
                --sal: env(safe-area-inset-left);
              }
              .safe-area-bottom {
                padding-bottom: var(--sab);
              }
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }
              .no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
              @keyframes rainbow-pulse {
                0% { filter: hue-rotate(0deg) brightness(1); }
                50% { filter: hue-rotate(180deg) brightness(1.2); }
                100% { filter: hue-rotate(360deg) brightness(1); }
              }
              .animate-rainbow {
                animation: rainbow-pulse 10s linear infinite;
              }
            `}} />

            {/* Account Menu */}
            <AccountMenu />

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto relative pb-20">
              {activeTab === 'timer' && <TimerPage hourlyRate={Number(user?.hourly_rate || 0)} />}
              {activeTab === 'sounds' && <SoundboardPage />}
              {activeTab === 'salary' && <SalaryPage />}
              {activeTab === 'stats' && <AnalyticsPage />}
            </div>

            {/* Bottom Navigation */}
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} disabled={!hasSalarySet} />
          </TimerProvider>
        )}
        <Toaster />
      </div>
    </ConfigProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
