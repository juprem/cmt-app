import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle2, MoreVertical, Edit2 } from 'lucide-react';
import { Modal, Input, InputNumber, Button, List, Tag } from 'antd';
import { SalaryProfile } from '@/app/App';

interface SalaryPageProps {
  profiles: SalaryProfile[];
  setProfiles: React.Dispatch<React.SetStateAction<SalaryProfile[]>>;
  activeProfileId: string;
  setActiveProfileId: (id: string) => void;
}

export const SalaryPage = ({ profiles, setProfiles, activeProfileId, setActiveProfileId }: SalaryPageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileRate, setNewProfileRate] = useState<number>(30);

  const handleAddProfile = () => {
    if (!newProfileName) return;
    const newProfile: SalaryProfile = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProfileName,
      hourlyRate: newProfileRate || 0,
      isDefault: false,
    };
    setProfiles([...profiles, newProfile]);
    setNewProfileName('');
    setNewProfileRate(30);
    setIsModalOpen(false);
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) return;
    setProfiles(profiles.filter(p => p.id !== id));
    if (activeProfileId === id) {
      setActiveProfileId(profiles.find(p => p.id !== id)?.id || '');
    }
  };

  const activeProfile = profiles.find(p => p.id === activeProfileId);

  return (
    <div className="p-6 bg-slate-950 pb-8">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white">Salary Profiles <span className="text-green-500">💶</span></h2>
        <p className="text-slate-400 text-sm mt-1">Manage your professional toilet valuation.</p>
      </div>

      {/* Current Active Card */}
      <motion.div 
        layout
        className="mb-8 p-6 rounded-[2rem] bg-gradient-to-br from-purple-600 to-indigo-700 shadow-xl shadow-purple-500/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4">
          <CheckCircle2 className="text-white/40" size={48} />
        </div>
        <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Active valuation</p>
        <h3 className="text-2xl font-black text-white mb-4">{activeProfile?.name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black text-white">€{activeProfile?.hourlyRate}</span>
          <span className="text-white/60 font-medium">/ hour</span>
        </div>
      </motion.div>

      {/* List Header */}
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-slate-400 font-bold text-xs uppercase tracking-wider">Your Portfolios</h4>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 text-purple-400 font-bold text-xs bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20"
        >
          <Plus size={14} />
          ADD NEW
        </motion.button>
      </div>

      {/* Profiles List */}
      <div className="space-y-3">
        {profiles.map((profile) => (
          <motion.div
            key={profile.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`group p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
              profile.id === activeProfileId 
              ? 'bg-white/10 border-purple-500/50' 
              : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
            onClick={() => setActiveProfileId(profile.id)}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl ${
                profile.id === activeProfileId ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500'
              }`}>
                €
              </div>
              <div>
                <h5 className="font-bold text-white leading-none mb-1">{profile.name}</h5>
                <p className="text-slate-400 text-xs font-medium">€{profile.hourlyRate}/hr</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {profile.id === activeProfileId && (
                <Tag color="purple" className="border-none font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">Selected</Tag>
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProfile(profile.id);
                }}
                className="p-2 text-slate-600 hover:text-red-400 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal
        title={null}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        className="premium-modal"
        styles={{
          content: {
            background: '#1e293b',
            padding: '24px',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Plus className="text-purple-500" size={32} />
          </div>
          <h3 className="text-2xl font-black text-white">New Venture</h3>
          <p className="text-slate-400 text-sm">How much is this next dump worth?</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Enterprise Name</label>
            <Input 
              placeholder="e.g. Afternoon Relief" 
              className="bg-slate-800 border-slate-700 text-white h-12 rounded-xl hover:border-purple-500 focus:border-purple-500"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Hourly Rate (€)</label>
            <InputNumber 
              className="w-full bg-slate-800 border-slate-700 text-white h-12 rounded-xl hover:border-purple-500 focus:border-purple-500 flex items-center"
              min={1}
              value={newProfileRate}
              onChange={(val) => setNewProfileRate(val || 0)}
            />
          </div>
          <Button 
            type="primary" 
            block 
            className="h-14 rounded-xl font-black text-lg bg-gradient-to-r from-purple-500 to-indigo-600 border-none mt-4"
            onClick={handleAddProfile}
          >
            ESTABLISH VALUATION
          </Button>
        </div>
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .ant-input-number-input {
          color: white !important;
          height: 48px !important;
          line-height: 48px !important;
        }
        .ant-modal-mask {
          backdrop-filter: blur(8px);
        }
      `}} />
    </div>
  );
};
