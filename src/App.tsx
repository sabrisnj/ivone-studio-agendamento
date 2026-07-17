/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from './lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { User, Appointment, Service } from './types';
import { seedServices } from './seed';
import { Home, Calendar, Gift, User as UserIcon, Settings, Menu } from 'lucide-react';
import { cn } from './utils';

// Components
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import HomeTab from './components/tabs/HomeTab';
import AppointmentsTab from './components/tabs/AppointmentsTab';
import MimosTab from './components/tabs/MimosTab';
import ProfileTab from './components/tabs/ProfileTab';
import AccessibilityTab from './components/tabs/AccessibilityTab';
import BookingModal from './components/BookingModal';

export type TabId = 'home' | 'appointments' | 'mimos' | 'profile' | 'accessibility';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    async function init() {
      seedServices();
      
      const savedUser = localStorage.getItem('ivone_studio_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    }
    
    init();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('ivone_studio_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ivone_studio_user');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-brand-pink border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const renderTab = () => {
    if (!user) return null;
    switch (activeTab) {
      case 'home': return <HomeTab user={user} onOpenBooking={() => setIsBookingOpen(true)} />;
      case 'appointments': return <AppointmentsTab user={user} />;
      case 'mimos': return <MimosTab user={user} onUpdateUser={setUser} />;
      case 'profile': return <ProfileTab user={user} onUpdateUser={setUser} onLogout={handleLogout} />;
      case 'accessibility': return <AccessibilityTab user={user} onUpdateUser={setUser} />;
      default: return <HomeTab user={user} onOpenBooking={() => setIsBookingOpen(true)} />;
    }
  };

  return (
    <div className={cn(
      "min-h-screen font-sans text-brand-brown transition-colors duration-300",
      user?.accessibility?.darkMode ? "bg-zinc-900 text-zinc-100" : "bg-brand-beige text-brand-brown",
      user?.accessibility?.highContrast && "contrast-125",
      user?.accessibility?.largeFont && "text-lg"
    )}>
      <AnimatePresence mode="wait">
        {!user ? (
          <LoginPage onLogin={handleLogin} />
        ) : user.isAdmin ? (
          <AdminDashboard user={user} onLogout={handleLogout} />
        ) : (
          <div className="pb-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderTab()}
              </motion.div>
            </AnimatePresence>

            {/* Bottom Navigation */}
            <nav className={cn(
              "fixed bottom-0 left-0 right-0 border-t flex items-center justify-around px-2 py-3 z-50",
              user?.accessibility?.darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white/80 backdrop-blur-md border-brand-pink/20"
            )}>
              <NavButton 
                active={activeTab === 'home'} 
                onClick={() => setActiveTab('home')} 
                icon={<Home className="w-5 h-5" />} 
                label="Home" 
                darkMode={user?.accessibility?.darkMode}
              />
              <NavButton 
                active={activeTab === 'appointments'} 
                onClick={() => setActiveTab('appointments')} 
                icon={<Calendar className="w-5 h-5" />} 
                label="Agenda" 
                darkMode={user?.accessibility?.darkMode}
              />
              <NavButton 
                active={activeTab === 'mimos'} 
                onClick={() => setActiveTab('mimos')} 
                icon={<Gift className="w-5 h-5" />} 
                label="Mimos" 
                darkMode={user?.accessibility?.darkMode}
              />
              <NavButton 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')} 
                icon={<UserIcon className="w-5 h-5" />} 
                label="Perfil" 
                darkMode={user?.accessibility?.darkMode}
              />
              <NavButton 
                active={activeTab === 'accessibility'} 
                onClick={() => setActiveTab('accessibility')} 
                icon={<Settings className="w-5 h-5" />} 
                label="Ajustes" 
                darkMode={user?.accessibility?.darkMode}
              />
            </nav>
          </div>
        )}
      </AnimatePresence>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        user={user} 
      />
    </div>
  );
}

function NavButton({ active, onClick, icon, label, darkMode }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, darkMode?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all",
        active 
          ? (darkMode ? "text-brand-pink" : "text-brand-teal") 
          : (darkMode ? "text-zinc-500" : "text-gray-400")
      )}
    >
      <div className={cn(
        "p-2 rounded-xl transition-all",
        active && (darkMode ? "bg-brand-pink/10" : "bg-brand-teal/10")
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}
