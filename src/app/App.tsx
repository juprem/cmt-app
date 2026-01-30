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

// Types
export interface SalaryProfile {
  id: string;
  name: string;
  hourlyRate: number;
  isDefault: boolean;
}

export type TabType = 'timer' | 'sounds' | 'salary' | 'stats';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('timer');
  const [profiles, setProfiles] = useState<SalaryProfile[]>([
    { id: '1', name: 'Standard Job', hourlyRate: 35, isDefault: true },
    { id: '2', name: 'Freelance Gig', hourlyRate: 85, isDefault: false },
    { id: '3', name: 'The "Big Corp" Shit', hourlyRate: 120, isDefault: false },
  ]);
  const [activeProfileId, setActiveProfileId] = useState<string>('1');

  const currentProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

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

  if (isLoading) {
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

  if (!isAuthenticated) {
    return <AuthPage />;
  }

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
        <style dangerouslySetInnerHTML={{ __html: `
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
          {activeTab === 'timer' && <TimerPage hourlyRate={currentProfile.hourlyRate} />}
          {activeTab === 'sounds' && <SoundboardPage />}
          {activeTab === 'salary' && (
            <SalaryPage 
              profiles={profiles} 
              setProfiles={setProfiles} 
              activeProfileId={activeProfileId}
              setActiveProfileId={setActiveProfileId}
            />
          )}
          {activeTab === 'stats' && <AnalyticsPage />}
        </div>

        {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
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
