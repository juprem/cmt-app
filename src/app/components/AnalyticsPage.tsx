import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Calendar, Trophy, Zap, Star, Target, Crown } from 'lucide-react';
import { Progress, List, Avatar } from 'antd';
import { useAuth } from '@/app/lib/AuthContext';

const achievements = [
  { id: 1, name: 'First Flush', icon: '🌱', description: 'Complete your first session.', unlocked: true },
  { id: 2, name: 'The €100 Dump', icon: '⭐', description: 'Earn 100€ in a single session.', unlocked: true },
  { id: 3, name: 'Corporate Legend', icon: '🎯', description: 'Spend 10 hours on the toilet in a week.', unlocked: false },
  { id: 4, name: 'Golden Plunger', icon: '🏆', description: 'Maintain a 45min/day average.', unlocked: false },
];

export const AnalyticsPage = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<any>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!user) return;

      try {
        const { authService } = await import('@/app/lib/auth');

        // Load user statistics
        const stats = await authService.getUserStats(user.id);
        setUserStats(stats);

        // Load recent sessions
        const sessions = await authService.getUserSessions(user.id, 10, 0);
        setRecentSessions(sessions);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, [user]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' +
        d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-slate-950 pb-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-white text-lg">Loading analytics...</div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 bg-slate-950 pb-8">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white">Analytics <span className="text-yellow-500">📊</span></h2>
        <p className="text-slate-400 text-sm mt-1">Measuring your high-yield downtime.</p>
      </div>

      {/* 2x2 Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          {
            label: 'Total Gains',
            val: `€${Number(userStats?.totalEarnings || 0).toFixed(2)}`,
            sub: `From ${userStats?.totalSessions || 0} sessions`,
            icon: TrendingUp,
            color: 'text-green-400',
            bg: 'bg-green-400/10'
          },
          {
            label: 'Time Invested',
            val: formatDuration(userStats?.totalDuration || 0),
            sub: 'Total bathroom time',
            icon: Clock,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10'
          },
          {
            label: 'Avg Session',
            val: formatDuration(userStats?.averageDuration || 0),
            sub: 'Typical break length',
            icon: Calendar,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10'
          },
          {
            label: 'Avg Earnings',
            val: `€${Number(userStats?.averageEarnings || 0).toFixed(2)}`,
            sub: 'Per session average',
            icon: Trophy,
            color: 'text-yellow-400',
            bg: 'bg-yellow-400/10'
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col"
          >
            <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">{stat.label}</p>
            <h4 className="text-xl font-black text-white">{stat.val}</h4>
            <p className="text-[10px] text-slate-400 mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Efficiency Meter */}
      <div className="mb-8 p-6 rounded-[2rem] bg-slate-900 border border-white/5 relative overflow-hidden">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h5 className="font-bold text-white mb-1">Efficiency Rating</h5>
            <p className="text-slate-500 text-xs">Based on current salary vs session time.</p>
          </div>
          <div className="text-4xl">🎯</div>
        </div>

        <Progress
          percent={78}
          showInfo={false}
          strokeColor={{
            '0%': '#A855F7',
            '100%': '#EC4899',
          }}
          strokeWidth={12}
          className="mb-4"
        />

        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-tighter">
          <span className="flex items-center gap-1 opacity-50">🌱 Sprout</span>
          <span className="flex items-center gap-1 opacity-50">⭐ Pro</span>
          <span className="text-purple-400 flex items-center gap-1">🎯 ELITE</span>
          <span className="flex items-center gap-1 opacity-50">🏆 Legend</span>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="mb-8">
        <h5 className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-4 px-2">Milestones</h5>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`flex-shrink-0 w-32 h-40 rounded-3xl p-4 flex flex-col items-center justify-center text-center transition-all ${ach.unlocked ? 'bg-gradient-to-b from-white/10 to-white/5 border border-white/20' : 'bg-black/20 border border-dashed border-white/5 grayscale opacity-50'
                }`}
            >
              <div className="text-4xl mb-3">{ach.icon}</div>
              <h6 className="text-[11px] font-black text-white leading-tight mb-1">{ach.name}</h6>
              <p className="text-[9px] text-slate-500 leading-tight">{ach.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="mb-4 px-2">
        <h5 className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-4">Past Sessions</h5>
        <div className="space-y-3">
          {recentSessions.length > 0 ? (
            recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h6 className="text-sm font-bold text-white">{formatDate(session.started_at)}</h6>
                    <p className="text-[10px] text-slate-500 font-medium">{formatDuration(session.duration_seconds)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-green-400">+€{Number(session.earnings).toFixed(2)}</span>
                  {session.poop_level > 1 && (
                    <div className="text-[8px] text-slate-500">LVL {session.poop_level}</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <div className="text-4xl mb-2">🚽</div>
              <p className="text-sm">No sessions yet. Start your first bathroom timer!</p>
            </div>
          )}
        </div>
      </div>

      <div className="h-10" /> {/* Spacer for bottom nav */}
    </div>
  );
};
