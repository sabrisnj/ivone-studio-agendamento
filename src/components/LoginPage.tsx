import React, { useState } from 'react';
import { motion } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { User } from '../types';
import { Phone, User as UserIcon, Lock, Star } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isAdminMode) {
        // Simple admin code check - in real app would be Firebase Auth
        if (adminCode === 'ivone2024') {
          const user: User = {
            id: 'admin-1',
            name: 'Ivone (Gestora)',
            phone: 'Admin',
            isAdmin: true
          };
          onLogin(user);
        } else {
          setError('Código de administrador inválido.');
        }
      } else {
        if (!name || !phone) {
          setError('Por favor, preencha todos os campos.');
          setLoading(false);
          return;
        }

        // Search for existing user by phone
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('phone', '==', phone));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          onLogin({
            id: querySnapshot.docs[0].id,
            name: userData.name,
            phone: userData.phone,
            isAdmin: userData.isAdmin || false
          });
        } else {
          // Create new user
          const docRef = await addDoc(usersRef, {
            name,
            phone,
            isAdmin: false,
            createdAt: serverTimestamp()
          });
          onLogin({
            id: docRef.id,
            name,
            phone,
            isAdmin: false
          });
        }
      }
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 py-12"
    >
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-brand-brown/5 overflow-hidden border border-brand-pink/10">
        <div className="bg-white p-12 text-center space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-24 h-24 bg-brand-pink rounded-[2rem] flex items-center justify-center mx-auto shadow-lg shadow-brand-pink/20"
          >
            <span className="text-4xl font-serif font-bold text-brand-brown">IH</span>
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-4xl font-serif font-bold text-brand-brown">Ivone</h1>
            <p className="text-brand-teal text-[10px] font-bold uppercase tracking-[0.3em]">Hair Studio</p>
          </div>
        </div>

        <div className="px-10 pb-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {!isAdminMode ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">
                    Seu Nome
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-brand-teal focus:bg-white transition-all outline-none text-sm text-gray-600 font-medium"
                    placeholder="Como gostaria de ser chamada?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-brand-teal focus:bg-white transition-all outline-none text-sm text-gray-600 font-medium"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">
                  Código da Gestora
                </label>
                <input
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-brand-teal focus:bg-white transition-all outline-none text-sm text-gray-600 font-medium"
                  placeholder="Digite seu código"
                />
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 rounded-2xl border border-red-100"
              >
                <p className="text-red-500 text-[10px] text-center font-bold uppercase tracking-tight">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-brown text-white font-bold py-5 rounded-3xl shadow-xl shadow-brand-brown/10 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center uppercase tracking-widest text-xs"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                isAdminMode ? 'Entrar como Gestora' : 'Entrar no Studio'
              )}
            </button>
          </form>

          <div className="mt-10 flex flex-col items-center gap-6">
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className="text-[10px] font-bold text-brand-teal uppercase tracking-widest hover:text-brand-brown transition-all decoration-brand-teal/20 underline underline-offset-4"
            >
              {isAdminMode ? 'Voltar para Acesso Cliente' : 'Acesso Administrativo'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
