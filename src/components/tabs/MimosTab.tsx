import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../../types';
import { Star, Gift, Share2, Ticket, Sparkles, Smile, Coffee, Heart, AlertCircle } from 'lucide-react';
import { cn } from '../../utils';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface MimosTabProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

export default function MimosTab({ user, onUpdateUser }: MimosTabProps) {
  const [luckyResult, setLuckyResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const drawLuckyTicket = async () => {
    const now = new Date();
    const getWeekNumber = (d: Date) => {
      const date = new Date(d.getTime());
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
      const week1 = new Date(date.getFullYear(), 0, 4);
      return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    };

    const currentWeek = getWeekNumber(now);
    const lastDraw = user.lastLuckyDraw ? new Date(user.lastLuckyDraw) : null;
    const lastDrawWeek = lastDraw ? getWeekNumber(lastDraw) : null;
    const isNewWeek = lastDrawWeek !== currentWeek || now.getFullYear() !== (lastDraw?.getFullYear() || 0);

    const drawCount = isNewWeek ? 0 : (user.luckyDrawCount || 0);

    if (drawCount >= 2) {
      setError('Você já retirou seu bilhete duas vezes esta semana! Volte na próxima semana. ✨');
      return;
    }

    const prizes = [
      '10% OFF em qualquer serviço!',
      'Mimo surpresa no próximo lavatório!',
      'Spa Esfoliante de Pés Grátis!',
      '5% OFF em qualquer serviço hoje!',
      'R$ 1,99 OFF em qualquer serviço hoje!',
      'Hidratação com Vaporização capilar Grátis!',
      'Vale-Presente de R$ 10 para uma amiga!',
      'Um Abraço bem apertado de algum colaborador!',
      '15% OFF em qualquer serviço, na próxima visita!',
      'Vale um café fresquinho!',
      'Uma frase motivacional para o seu dia!',
      'Poste um story marcando o salão e ganhe R$ 5 OFF!',
      'Você escolhe a playlist do salão pelos próximos 30 minutos!',
      'Ganhe uma Escova no seu próximo serviço de mechas ou coloração!',
      'Pé e Mão com 5% OFF no seu próximo agendamento!',
      'Amiga da Vez: Indique uma amiga e ambas ganham 10% OFF na próxima visita!'
    ];

    const getNewPrize = (exclude?: string | null) => {
      let available = prizes;
      if (exclude) {
        available = prizes.filter(p => p !== exclude);
      }
      return available[Math.floor(Math.random() * available.length)];
    };

    const randomPrize = getNewPrize(luckyResult);
    
    try {
      const userRef = doc(db, 'users', user.id);
      const nowIso = now.toISOString();
      const nextDrawCount = drawCount + 1;

      await updateDoc(userRef, { 
        lastLuckyDraw: nowIso,
        currentPrize: randomPrize,
        luckyDrawCount: nextDrawCount
      });
      
      const updatedUser = { 
        ...user, 
        lastLuckyDraw: nowIso, 
        currentPrize: randomPrize,
        luckyDrawCount: nextDrawCount
      };
      onUpdateUser(updatedUser);
      localStorage.setItem('ivone_studio_user', JSON.stringify(updatedUser));
      
      setLuckyResult(randomPrize);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Erro ao retirar bilhete. Tente novamente.');
    }
  };

  return (
    <div className="p-6 pt-12 space-y-8 max-w-md mx-auto min-h-screen">
      <div className="space-y-2">
        <h1 className={cn(
          "text-3xl font-serif font-bold",
          user.accessibility?.darkMode ? "text-white" : "text-brand-brown"
        )}>
          Clube de Mimos
        </h1>
      </div>

      {/* Refer & Win Banner */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-brand-brown rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl shadow-brand-brown/10"
      >
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-brand-pink">
            <Share2 className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Indique e Ganhe</span>
          </div>
          <h4 className="text-xl font-serif font-bold leading-tight">
            Indique uma amiga e ganhe 10% de desconto!
          </h4>
          <p className="text-white/60 text-xs leading-relaxed">
            Ganhe o benefício na sua próxima visita assim que ela realizar o primeiro agendamento.
          </p>
          <button className="w-full bg-brand-pink text-brand-brown font-bold py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all">
            Compartilhar Link
          </button>
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-10">
          <Gift className="w-32 h-32 rotate-12" />
        </div>
      </motion.div>

      {/* Weekly Promotions Section */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Mimos da Semana</h3>
        
        <div className="space-y-3">
          <PromoCard 
            day="Terça-Feira"
            title="Terça da Beleza"
            items={[
              { name: 'Escova + Hidratação', sub: 'Tratamento de brilho', discount: '12% OFF' },
              { name: 'Manicure + Pedicure', sub: 'Ritual completo', discount: '12% OFF' },
              { name: 'Manicure', sub: 'Esmaltação simples', discount: '12% OFF' }
            ]}
            icon={<Smile className="w-4 h-4" />}
            darkMode={user.accessibility?.darkMode}
          />

          <PromoCard 
            day="Quarta-Feira"
            title="Quarta Iluminada"
            items={[
              { name: 'Corte + Secagem Feminino', discount: '15% OFF' },
              { name: 'Manicure + Pedicure', sub: 'Ganha um Spa Esfoliante de Pés' }
            ]}
            icon={<Heart className="w-4 h-4" />}
            darkMode={user.accessibility?.darkMode}
          />

          <PromoCard 
            day="Quinta-Feira"
            title="Quinta Zen"
            items={[
              { name: 'Escova + Hidratação', sub: 'Ganha um Tratamento a Vapor' },
              { name: 'Manutenção de Cílios', discount: '5% OFF' }
            ]}
            icon={<Coffee className="w-4 h-4" />}
            darkMode={user.accessibility?.darkMode}
          />
        </div>
      </div>

      {/* More Discounts Section */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Ganhe Mais Descontos</h3>
        <div className="space-y-3">
          <div className={cn(
            "p-5 rounded-3xl border shadow-sm",
            user.accessibility?.darkMode ? "bg-zinc-800 border-zinc-700" : "bg-white border-brand-pink/10"
          )}>
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className={cn("text-sm font-semibold", user.accessibility?.darkMode ? "text-zinc-200" : "text-gray-700")}>
                    Avalie no Google
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">Ganhe 5% de desconto no seu próximo procedimento estético.</p>
                </div>
                <span className="bg-brand-pink text-brand-brown text-[10px] font-bold px-2 py-1 rounded-lg shrink-0">
                  5% OFF
                </span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className={cn("text-sm font-semibold", user.accessibility?.darkMode ? "text-zinc-200" : "text-gray-700")}>
                    Indique e Ganhe
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">Indique uma amiga e ganhe desconto na sua próxima visita.</p>
                </div>
                <span className="bg-brand-pink text-brand-brown text-[10px] font-bold px-2 py-1 rounded-lg shrink-0">
                  5% OFF
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saturday Lucky Ticket */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Sábado da Sorte</h3>
        <button
          onClick={drawLuckyTicket}
          className="w-full bg-white border-2 border-dashed border-brand-teal/30 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 group hover:border-brand-teal transition-all"
        >
          <div className="w-16 h-16 bg-brand-teal/10 rounded-full flex items-center justify-center text-brand-teal group-hover:scale-110 group-hover:rotate-12 transition-all">
            <Ticket className="w-8 h-8" />
          </div>
          <div className="text-center">
            <span className="block font-serif font-bold text-lg text-brand-brown">Tirar Bilhete da Sorte</span>
            <span className="text-[10px] font-bold text-brand-teal uppercase tracking-widest mt-1 block">Válido para uso somente aos sábados</span>
          </div>
        </button>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-3 text-orange-700"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-widest leading-tight">{error}</span>
          </motion.div>
        )}
      </div>

      {/* Lucky Result Modal */}
      <AnimatePresence>
        {luckyResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-brand-brown/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-xs text-center space-y-6 shadow-2xl"
            >
              <div className="w-20 h-20 bg-brand-teal rounded-full flex items-center justify-center mx-auto shadow-lg shadow-brand-teal/20">
                <Sparkles className="w-10 h-10 text-white animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold text-brand-brown">Parabéns!</h3>
                <p className="text-[10px] font-bold text-brand-teal uppercase tracking-widest">Seu prêmio surpresa é:</p>
                <div className="py-4 px-6 bg-brand-teal/10 rounded-2xl text-brand-teal font-bold text-lg">
                  {luckyResult}
                </div>
              </div>
              <div className="space-y-4">
                <button
                  onClick={() => setLuckyResult(null)}
                  className="w-full bg-brand-brown text-white font-bold py-4 rounded-2xl text-xs uppercase tracking-widest"
                >
                  Uhuul! Salvar Mimo
                </button>
                {(user.luckyDrawCount || 0) < 2 && (
                  <button
                    onClick={drawLuckyTicket}
                    className="w-full bg-white border border-brand-brown text-brand-brown font-bold py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-brand-brown/5 transition-all"
                  >
                    Tentar de Novo
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PromoCard({ day, title, items, icon, darkMode }: { day: string, title: string, items: any[], icon: React.ReactNode, darkMode?: boolean }) {
  return (
    <div className={cn(
      "p-5 rounded-3xl border shadow-sm",
      darkMode ? "bg-zinc-800 border-zinc-700" : "bg-white border-brand-pink/10"
    )}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="text-brand-pink">{icon}</div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{day}</span>
        </div>
        <div className="bg-brand-pink/10 text-brand-teal text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
          Especial
        </div>
      </div>
      <h4 className={cn(
        "text-lg font-serif font-bold mb-4",
        darkMode ? "text-white" : "text-brand-brown"
      )}>{title}</h4>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between items-center gap-4">
            <div>
              <p className={cn(
                "text-sm font-semibold",
                darkMode ? "text-zinc-200" : "text-gray-700"
              )}>{item.name}</p>
              {item.sub && <p className="text-[10px] text-gray-400">{item.sub}</p>}
            </div>
            {item.discount && (
              <span className="bg-brand-pink text-brand-brown text-[10px] font-bold px-2 py-1 rounded-lg">
                {item.discount}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
