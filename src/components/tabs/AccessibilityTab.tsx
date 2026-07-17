import React from 'react';
import { motion } from 'motion/react';
import { User, AccessibilitySettings } from '../../types';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Moon, Contrast, Type, Volume2, Settings2, Info } from 'lucide-react';
import { cn } from '../../utils';

interface AccessibilityTabProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

export default function AccessibilityTab({ user, onUpdateUser }: AccessibilityTabProps) {
  const settings = user.accessibility || {
    darkMode: false,
    highContrast: false,
    largeFont: false,
    narration: false
  };

  const toggleSetting = async (key: keyof AccessibilitySettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    const updatedUser = { ...user, accessibility: newSettings };
    
    // Optimistic UI
    onUpdateUser(updatedUser);
    localStorage.setItem('ivone_studio_user', JSON.stringify(updatedUser));

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { accessibility: newSettings });
    } catch (error) {
      console.error("Update accessibility error:", error);
    }
  };

  return (
    <div className="p-6 pt-12 space-y-8 max-w-md mx-auto min-h-screen">
      <div className="space-y-2">
        <h1 className={cn(
          "text-3xl font-serif font-bold",
          user.accessibility?.darkMode ? "text-white" : "text-brand-brown"
        )}>
          Acessibilidade
        </h1>
        <p className="text-[10px] font-bold text-brand-teal uppercase tracking-[0.2em]">Personalize sua visualização</p>
      </div>

      <div className={cn(
        "bg-white rounded-[2rem] border p-2 shadow-sm divide-y",
        user.accessibility?.darkMode ? "bg-zinc-800 border-zinc-700 divide-zinc-700" : "bg-white border-brand-pink/10 divide-gray-50"
      )}>
        <AccessibilityToggle
          icon={<Moon className="w-5 h-5" />}
          label="Modo Escuro"
          description="Altera as cores para tons confortáveis"
          active={settings.darkMode}
          onClick={() => toggleSetting('darkMode')}
          darkMode={user.accessibility?.darkMode}
        />
        <AccessibilityToggle
          icon={<Contrast className="w-5 h-5" />}
          label="Alto Contraste"
          description="Aumenta o contraste para leitura"
          active={settings.highContrast}
          onClick={() => toggleSetting('highContrast')}
          darkMode={user.accessibility?.darkMode}
        />
        <AccessibilityToggle
          icon={<Type className="w-5 h-5" />}
          label="Tamanho da Fonte"
          description="Aumenta a escala do texto"
          active={settings.largeFont}
          onClick={() => toggleSetting('largeFont')}
          darkMode={user.accessibility?.darkMode}
        />
        <AccessibilityToggle
          icon={<Volume2 className="w-5 h-5" />}
          label="Narração"
          description="Ativa leitura de tela por voz"
          active={settings.narration}
          onClick={() => toggleSetting('narration')}
          darkMode={user.accessibility?.darkMode}
        />
      </div>

      <div className={cn(
        "p-6 rounded-3xl border flex gap-4",
        user.accessibility?.darkMode ? "bg-zinc-800/50 border-zinc-700" : "bg-brand-pink/5 border-brand-pink/10"
      )}>
        <Info className="w-5 h-5 text-brand-teal shrink-0 mt-1" />
        <p className="text-xs leading-relaxed text-gray-500 italic">
          Estas configurações são salvas automaticamente no seu perfil para garantir que cada visita ao nosso App seja perfeitamente adaptada às suas necessidades.
        </p>
      </div>
    </div>
  );
}

interface AccessibilityToggleProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
  darkMode?: boolean;
}

function AccessibilityToggle({ icon, label, description, active, onClick, darkMode }: AccessibilityToggleProps) {
  return (
    <div className="flex items-center justify-between p-6">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
          active ? "bg-brand-teal text-white" : (darkMode ? "bg-zinc-700 text-zinc-400" : "bg-brand-beige text-brand-pink")
        )}>
          {icon}
        </div>
        <div>
          <h4 className={cn(
            "font-serif font-bold text-sm",
            darkMode ? "text-white" : "text-brand-brown"
          )}>{label}</h4>
          <p className="text-[10px] text-gray-400 font-medium">{description}</p>
        </div>
      </div>
      <button
        onClick={onClick}
        className={cn(
          "w-12 h-6 rounded-full transition-all relative",
          active ? "bg-brand-teal" : (darkMode ? "bg-zinc-600" : "bg-gray-200")
        )}
      >
        <motion.div
          animate={{ x: active ? 24 : 0 }}
          className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
        />
      </button>
    </div>
  );
}
