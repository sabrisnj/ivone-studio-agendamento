import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, UserPreferences } from '../../types';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Coffee, Heart, Droplets, Save, LogOut, Shield, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils';

interface ProfileTabProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
}

export default function ProfileTab({ user, onUpdateUser, onLogout }: ProfileTabProps) {
  const [activeSection, setActiveSection] = useState<'preferences' | 'data' | 'security'>('preferences');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [prefs, setPrefs] = useState<UserPreferences>(user.preferences || {
    memorizeProfile: true,
    drink: 'Chá Morno',
    allergies: '',
    aromas: '',
    lavatoryTemp: 'FRIA'
  });

  const [userData, setUserData] = useState({
    name: user.name,
    phone: user.phone
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.id);
      const updatedUser = {
        ...user,
        ...userData,
        preferences: prefs
      };
      await updateDoc(userRef, {
        name: userData.name,
        phone: userData.phone,
        preferences: prefs
      });
      onUpdateUser(updatedUser);
      localStorage.setItem('ivone_studio_user', JSON.stringify(updatedUser));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 pt-12 space-y-8 max-w-md mx-auto min-h-screen">
      <div className="space-y-2">
        <h1 className={cn(
          "text-3xl font-serif font-bold",
          user.accessibility?.darkMode ? "text-white" : "text-brand-brown"
        )}>
          Perfil & Preferências
        </h1>
        <p className="text-[10px] font-bold text-brand-teal uppercase tracking-[0.2em]">Personalize sua experiência</p>
      </div>

      {/* Section Tabs */}
      <div className="flex bg-white/50 p-1 rounded-2xl border border-brand-pink/10 shadow-sm overflow-x-auto no-scrollbar">
        <TabButton 
          active={activeSection === 'preferences'} 
          onClick={() => setActiveSection('preferences')} 
          label="Preferências" 
        />
        <TabButton 
          active={activeSection === 'data'} 
          onClick={() => setActiveSection('data')} 
          label="Meus Dados" 
        />
        <TabButton 
          active={activeSection === 'security'} 
          onClick={() => setActiveSection('security')} 
          label="Segurança" 
        />
      </div>

      <div className="space-y-8 pb-10">
        {activeSection === 'preferences' && (
          <div className="space-y-8">
            {/* Memorize Profile */}
            <div className="flex items-center justify-between p-6 bg-white rounded-3xl border border-brand-pink/10 shadow-sm">
              <div>
                <h4 className="font-serif font-bold text-brand-brown">Memorizar Perfil?</h4>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Preferências permanentes</p>
              </div>
              <button
                onClick={() => setPrefs({ ...prefs, memorizeProfile: !prefs.memorizeProfile })}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  prefs.memorizeProfile ? "bg-brand-teal" : "bg-gray-200"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  prefs.memorizeProfile ? "left-7" : "left-1"
                )} />
              </button>
            </div>

            {/* Menu de Bebidas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-1">
                <Coffee className="w-4 h-4 text-brand-pink" />
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Menu de Bebidas</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['Café Quente', 'Café Morno', 'Chá Quente', 'Chá Morno', 'Água Fresca', 'Água Gelada', 'Nada'].map((drink) => (
                  <button
                    key={drink}
                    onClick={() => setPrefs({ ...prefs, drink: drink as any })}
                    className={cn(
                      "py-4 px-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border-2",
                      prefs.drink === drink 
                        ? "bg-brand-brown text-white border-brand-brown" 
                        : "bg-white text-gray-400 border-gray-100 hover:border-brand-pink/30"
                    )}
                  >
                    {drink}
                  </button>
                ))}
              </div>
            </div>

            {/* Saúde & Bem-Estar */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-1">
                <Heart className="w-4 h-4 text-brand-pink" />
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saúde & Bem-Estar</h4>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Alergias..."
                  value={prefs.allergies}
                  onChange={(e) => setPrefs({ ...prefs, allergies: e.target.value })}
                  className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-teal outline-none text-sm shadow-sm"
                />
                <input
                  type="text"
                  placeholder="Aromas..."
                  value={prefs.aromas}
                  onChange={(e) => setPrefs({ ...prefs, aromas: e.target.value })}
                  className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-teal outline-none text-sm shadow-sm"
                />
              </div>
            </div>

            {/* Lavatório */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-1">
                <Droplets className="w-4 h-4 text-brand-teal" />
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Temperatura do Lavatório</h4>
              </div>
              <div className="flex bg-white/50 p-1 rounded-2xl border border-gray-100 shadow-sm">
                {['QUENTE', 'MORNA', 'FRIA'].map((temp) => (
                  <button
                    key={temp}
                    onClick={() => setPrefs({ ...prefs, lavatoryTemp: temp as any })}
                    className={cn(
                      "flex-1 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                      prefs.lavatoryTemp === temp 
                        ? (temp === 'FRIA' ? "bg-[#7AB6A6] text-white shadow-lg shadow-[#7AB6A6]/20" : "bg-brand-brown text-white shadow-lg shadow-brand-brown/20")
                        : "text-gray-400 hover:text-brand-brown"
                    )}
                  >
                    {temp}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'data' && (
          <div className="space-y-6">
            <div className="p-6 bg-white rounded-3xl border border-brand-pink/10 shadow-sm space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-pink" />
                  <input
                    type="text"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-teal outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">WhatsApp</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-pink flex items-center justify-center font-bold text-xs">+55</div>
                  <input
                    type="tel"
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-teal outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'security' && (
          <div className="space-y-6">
            <div className="p-6 bg-white rounded-3xl border border-brand-pink/10 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-pink rounded-xl flex items-center justify-center text-brand-brown">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-brand-brown">Segurança</h4>
                  <p className="text-[10px] text-brand-teal font-bold uppercase tracking-widest">Privacidade & LGPD</p>
                </div>
              </div>
              
              <div className="space-y-4 text-sm text-gray-600">
                <div className="space-y-2">
                  <h5 className="font-bold text-xs uppercase tracking-widest text-brand-brown">1. Coleta e Uso de Dados</h5>
                  <p className="text-xs leading-relaxed opacity-80">
                    Ao utilizar nossa aplicação de agendamento, o Ivone Studio coleta informações pessoais como nome e telefone para organizar a agenda e segurança.
                  </p>
                </div>
                <div className="space-y-2">
                  <h5 className="font-bold text-xs uppercase tracking-widest text-brand-brown">2. Proteção de Dados</h5>
                  <p className="text-xs leading-relaxed opacity-80">
                    Seus dados não serão compartilhados fora do ecossistema do Ivone Studio. Utilizamos os seus dados de contacto para enviar lembretes.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest leading-tight">
                Seus dados estão protegidos conforme as leis vigentes.
              </span>
            </div>
          </div>
        )}

        {/* Global Actions */}
        <div className="space-y-4 pt-4 pb-24">
          {activeSection !== 'security' && (
            <button
              onClick={handleSave}
              disabled={loading}
              className={cn(
                "w-full py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs font-bold",
                saveSuccess 
                  ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                  : "bg-brand-brown text-white shadow-brand-brown/20 hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Salvo com Sucesso
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </>
              )}
            </button>
          )}

          <button
            onClick={onLogout}
            className="w-full py-4 border-2 border-dashed border-red-100 text-red-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair da minha conta
          </button>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-3 px-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
        active ? "bg-brand-brown text-white shadow-md" : "text-gray-400 hover:text-brand-brown"
      )}
    >
      {label}
    </button>
  );
}
