import React from 'react';
import { motion } from 'framer-motion';

const sounds = [
  { id: '1', emoji: '🎺', label: 'Victory Toot', file: 'victory_toot.mp3', color: 'from-yellow-400 to-orange-500' },
  { id: '2', emoji: '🌊', label: 'Tidal Wave', file: 'tidal_wave.mp3', color: 'from-blue-400 to-indigo-500' },
  { id: '3', emoji: '🚀', label: 'Blast Off', file: 'blast_off.mp3', color: 'from-red-400 to-pink-500' },
  { id: '4', emoji: '🎸', label: 'Rock Out', file: 'rock_out.mp3', color: 'from-purple-400 to-indigo-600' },
  { id: '5', emoji: '💥', label: 'Big Bang', file: 'big_bang.mp3', color: 'from-orange-400 to-red-600' },
  { id: '6', emoji: '🦆', label: 'The Quack', file: 'the_quack.mp3', color: 'from-green-400 to-teal-500' },
  { id: '7', emoji: '🔔', label: 'Notification', file: 'notification.mp3', color: 'from-sky-400 to-blue-600' },
  { id: '8', emoji: '💨', label: 'The Gust', file: 'fart.mp3', color: 'from-pink-400 to-rose-600' },
];

export const SoundboardPage = () => {
  const handlePlay = (file: string) => {
    const audio = new Audio(`/sounds/${file}`);
    audio.play().catch(err => console.error('Error playing sound:', err));

    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  return (
    <div className="p-6 h-full bg-slate-950 flex flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white">Soundboard <span className="text-purple-500">🔊</span></h2>
        <p className="text-slate-400 text-sm mt-1">Mask your bathroom sounds with style.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {sounds.map((sound) => (
          <motion.button
            key={sound.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePlay(sound.file)}
            className={`relative flex flex-col items-center justify-center gap-2 rounded-3xl p-6 bg-gradient-to-br ${sound.color} shadow-lg shadow-black/20 group overflow-hidden border border-white/10`}
          >

            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <span className="text-5xl group-active:scale-125 transition-transform duration-200">
              {sound.emoji}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
              {sound.label}
            </span>

            {/* Visual ripple effect element (CSS only) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 4, opacity: 0.3 }}
                className="absolute inset-0 bg-white rounded-full m-auto w-10 h-10"
              />
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
        <p className="text-xs text-slate-500 italic">"Discretion is the better part of valor, but noise is the fun part of business."</p>
      </div>
    </div>
  );
};
