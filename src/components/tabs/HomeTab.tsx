import React from 'react';
import { motion } from 'motion/react';
import { User } from '../../types';
import { Phone, Instagram, Plus, Calendar, Scissors, Star, Ticket, Gift } from 'lucide-react';
import { cn } from '../../utils';

interface HomeTabProps {
  user: User;
  onOpenBooking: () => void;
}

export default function HomeTab({ user, onOpenBooking }: HomeTabProps) {
  const firstName = user.name.split(' ')[0];
  const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

  // Helper to check if the prize is from the last 15 days
  const isPrizeActive = () => {
    if (!user.lastLuckyDraw || !user.currentPrize) return false;
    const lastDraw = new Date(user.lastLuckyDraw);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastDraw.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 15;
  };

  const currentWeekPrize = isPrizeActive() ? user.currentPrize : null;

  return (
    <div className="p-6 pt-12 space-y-8 max-w-md mx-auto">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className={cn(
          "text-4xl font-serif font-bold",
          user.accessibility?.darkMode ? "text-white" : "text-brand-brown"
        )}>
          Oi, {formattedName}
        </h1>
        <p className={cn(
          "text-sm font-medium italic",
          user.accessibility?.darkMode ? "text-zinc-400" : "text-brand-teal"
        )}>
          Seja bem-vinda(o) ao Ivone Studio, aqui, cada detalhe é pensado sob medida para cuidar de você e valorizar a sua essência.
        </p>
      </motion.div>

      {/* Current Prize Section */}
      {currentWeekPrize && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-brand-pink/20 border-2 border-brand-pink rounded-[2rem] p-6 text-brand-brown relative overflow-hidden"
        >
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-pink rounded-2xl flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6 text-brand-brown" />
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-brand-teal">Seu Mimo da Semana ✨</span>
              <p className="text-sm font-bold leading-tight">{currentWeekPrize}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Action Card */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <button
          onClick={onOpenBooking}
          className="w-full bg-white border-2 border-dashed border-brand-pink/30 rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 hover:border-brand-pink transition-all group shadow-sm"
        >
          <div className="w-16 h-16 bg-brand-pink rounded-3xl flex items-center justify-center text-brand-brown group-hover:scale-110 transition-transform shadow-lg shadow-brand-pink/20">
            <Plus className="w-8 h-8" />
          </div>
          <div className="text-center">
            <span className="block font-serif font-bold text-xl text-brand-brown">Novo Agendamento</span>
            <span className="text-[10px] font-bold text-brand-teal uppercase tracking-widest mt-1 block">Clique para começar</span>
          </div>
        </button>
      </motion.div>

      {/* Social Links Section */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Conecte-se conosco</h3>
        <div className="grid grid-cols-2 gap-4">
          <a
            href="https://wa.me/5511997308578"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-3 bg-emerald-50 border border-emerald-100 p-6 rounded-3xl hover:bg-emerald-100 transition-all group"
          >
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">WhatsApp</span>
          </a>

          <a
            href="https://instagram.com/ivonehairstudio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-3 bg-pink-50 border border-pink-100 p-6 rounded-3xl hover:bg-pink-100 transition-all group"
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
              <Instagram className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-pink-700 uppercase tracking-widest">Instagram</span>
          </a>
        </div>
      </div>

      {/* Quick Info Card */}
      <div className="bg-brand-brown rounded-[2rem] p-6 text-white overflow-hidden relative shadow-xl shadow-brand-brown/10">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-brand-pink mb-2">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Destaque</span>
          </div>
          <h4 className="text-xl font-serif font-bold mb-2">Clube de Mimos</h4>
          <p className="text-white/60 text-xs leading-relaxed">
            Que tal um mimo hoje? <br />
            em descontos exclusivos e até Bilhete da Sorte te esperando! <br />
            Acesse a aba Mimos para conferir tudo!!!
          </p>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <Ticket className="w-24 h-24 rotate-12" />
        </div>
      </div>
    </div>
  );
}
