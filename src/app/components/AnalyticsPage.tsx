import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Calendar, Trophy, Zap, Star, Target, Crown, Award, Medal, Coins, Flame } from 'lucide-react';
import { Progress, Tooltip } from 'antd';
import { useAuth } from '@/app/lib/AuthContext';

interface Achievement {
  id: string;
  name: string;
  icon: string | React.ReactNode;
  description: string;
  check: (stats: any, sessions: any[]) => boolean;
}

const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_flush', name: 'First Flush', icon: '🌱', description: 'Complete your first session.', check: (stats) => (stats?.totalSessions || 0) >= 1 },
  { id: 'century_dump', name: 'The €100 Dump', icon: '⭐', description: 'Earn 100€ in a single session.', check: (stats, sessions) => sessions.some(s => Number(s.earnings) >= 100) },
  { id: 'marathon', name: 'Marathon Man', icon: '🏃', description: 'Session longer than 1 hour.', check: (stats, sessions) => sessions.some(s => s.duration_seconds >= 3600) },
  { id: 'early_bird', name: 'Early Bird', icon: '🌅', description: 'Session before 8 AM.', check: (stats, sessions) => sessions.some(s => new Date(s.started_at).getHours() < 8) },
  { id: 'night_owl', name: 'Night Owl', icon: '🦉', description: 'Session after 11 PM.', check: (stats, sessions) => sessions.some(s => new Date(s.started_at).getHours() >= 23) },
  { id: 'corporate_legend', name: 'Corporate Legend', icon: '🎯', description: 'Spend 10 hours total in bathroom.', check: (stats) => (stats?.totalDuration || 0) >= 36000 },
  { id: 'pro_shitter', name: 'Professional Shitter', icon: '💼', description: 'Complete 50 sessions.', check: (stats) => (stats?.totalSessions || 0) >= 50 },
  { id: 'high_speed', name: 'High Speed', icon: '⚡', description: 'Earn over 1€ per minute.', check: (stats, sessions) => sessions.some(s => (Number(s.earnings) / (s.duration_seconds / 60)) >= 1) },
  { id: 'gold_mine', name: 'Gold Mine', icon: '💰', description: 'Earn 1000€ total.', check: (stats) => (stats?.totalEarnings || 0) >= 1000 },
  { id: 'diamond_hands', name: 'Diamond Trousers', icon: '💎', description: 'Earn 500€ total.', check: (stats) => (stats?.totalEarnings || 0) >= 500 },
  { id: 'wealthy_waste', name: 'Wealthy Waste', icon: '🔥', description: 'Single session over 50€.', check: (stats, sessions) => sessions.some(s => Number(s.earnings) >= 50) },
  { id: 'weekly_warrior', name: 'Weekly Warrior', icon: '🛡️', description: '7 sessions in a single week.', check: (stats) => (stats?.sessionsLast7Days || 0) >= 7 },
];

const MILESTONES = [
  { label: 'Copper Penny', target: 10, icon: '🥉' },
  { label: 'Silver Squeeze', target: 50, icon: '🥈' },
  { label: 'Gold Standard', target: 100, icon: '🥇' },
  { label: 'Diamond Drop', target: 500, icon: '💎' },
  { label: 'Master Plumber', target: 1000, icon: '👑' },
  { label: 'Corporate Overlord', target: 5000, icon: '🏛️' },
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
        const stats = await authService.getUserStats(user.id);
        setUserStats(stats);
        const sessions = await authService.getUserSessions(user.id, 50, 0);
        setRecentSessions(sessions);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAnalyticsData();
  }, [user]);

  const unlockedAchievements = useMemo(() => {
    if (!userStats || !recentSessions) return new Set();
    return new Set(
      ALL_ACHIEVEMENTS.filter(ach => ach.check(userStats, recentSessions)).map(ach => ach.id)
    );
  }, [userStats, recentSessions]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const formatDate = (date: any) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) return <div className="p-12 text-center text-white">Loading professional insights...</div>;

  const totalEarnings = Number(userStats?.totalEarnings || 0);

  return (
    <div className="p-6 bg-slate-950 pb-24 min-h-full">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white">Wealth Analytics <span className="text-yellow-500">📊</span></h2>
        <p className="text-slate-400 text-sm mt-1">Proof that time on the porcelain is non-billable but highly profitable.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { label: 'Total Gains', val: `€${totalEarnings.toFixed(2)}`, icon: Coins, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Time Invested', val: formatDuration(userStats?.totalDuration || 0), icon: Clock, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: 'Avg Earnings', val: `€${Number(userStats?.averageEarnings || 0).toFixed(2)}`, icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Efficiency', val: 'Elite', icon: Crown, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-3xl bg-white/5 border border-white/10">
            <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">{stat.label}</p>
            <h4 className="text-xl font-black text-white">{stat.val}</h4>
          </div>
        ))}
      </div>

      {/* Milestone Progress */}
      <div className="mb-10 bg-slate-900/50 p-6 rounded-[2rem] border border-white/10 shadow-xl">
        <h5 className="text-white font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
          <Medal size={16} className="text-yellow-500" /> Revenue Milestones
        </h5>
        <div className="space-y-6">
          {MILESTONES.slice(0, 3).map((m, i) => {
            const progress = Math.min((totalEarnings / m.target) * 100, 100);
            return (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-300">{m.icon} {m.label}</span>
                  <span className="text-[10px] font-mono text-slate-500">€{totalEarnings.toFixed(0)} / €{m.target}</span>
                </div>
                <Progress
                  percent={progress}
                  showInfo={false}
                  strokeColor={progress === 100 ? '#22c55e' : { '0%': '#A855F7', '100%': '#EC4899' }}
                  trailColor="rgba(255,255,255,0.05)"
                  strokeWidth={10}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="mb-10">
        <h5 className="text-white font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2 px-2">
          <Award size={16} className="text-purple-500" /> Hall of Fame
        </h5>
        <div className="grid grid-cols-3 gap-3">
          {ALL_ACHIEVEMENTS.map((ach) => {
            const isUnlocked = unlockedAchievements.has(ach.id);
            return (
              <Tooltip title={ach.description} key={ach.id}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`relative p-3 rounded-2xl flex flex-col items-center justify-center text-center aspect-square transition-all border ${isUnlocked
                      ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
                      : 'bg-black/40 border-white/5 grayscale opacity-30'
                    }`}
                >
                  <div className="text-2xl mb-1">{ach.icon}</div>
                  <h6 className="text-[9px] font-bold text-white leading-tight">{ach.name}</h6>
                  {isUnlocked && (
                    <div className="absolute top-1 right-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e]" />
                    </div>
                  )}
                </motion.div>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* History */}
      <div className="px-2">
        <h5 className="text-white font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
          <Clock size={16} className="text-blue-500" /> Recent Excursions
        </h5>
        <div className="space-y-3">
          {recentSessions.slice(0, 5).map((session, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500">
                  <Flame size={18} className={session.poop_level > 3 ? 'text-orange-500' : ''} />
                </div>
                <div>
                  <h6 className="text-sm font-bold text-white">{formatDate(session.started_at)}</h6>
                  <p className="text-[10px] text-slate-500">{formatDuration(session.duration_seconds)} • LVL {session.poop_level}</p>
                </div>
              </div>
              <span className="text-sm font-black text-green-400">+€{Number(session.earnings).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
