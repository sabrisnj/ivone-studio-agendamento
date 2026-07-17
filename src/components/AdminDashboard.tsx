import React, { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, addDoc, deleteDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { User, Appointment, Service, LuckyDrawPrize, WeeklyPromotion } from '../types';
import { CheckCircle2, XCircle, Clock4, LogOut, Filter, Calendar, User as UserIcon, Phone, Scissors, Plus, Search, Ticket, Trash2, Star, Loader2 } from 'lucide-react';
import { cn, formatPrice } from '../utils';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [prizes, setPrizes] = useState<LuckyDrawPrize[]>([]);
  const [promotions, setPromotions] = useState<WeeklyPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'mimos'>('appointments');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [isAddingService, setIsAddingService] = useState(false);
  const [isAddingPrize, setIsAddingPrize] = useState(false);
  const [isAddingPromo, setIsAddingPromo] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'appointments'),
      orderBy('createdAt', 'desc')
    );

    const unsubAppointments = onSnapshot(q, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Appointment[]);
      setLoading(false);
    });

    const unsubServices = onSnapshot(collection(db, 'services'), (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Service[]);
    });

    const unsubPrizes = onSnapshot(collection(db, 'lucky_prizes'), (snapshot) => {
      setPrizes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LuckyDrawPrize[]);
    });

    const unsubPromos = onSnapshot(collection(db, 'promotions'), (snapshot) => {
      setPromotions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WeeklyPromotion[]);
    });

    return () => {
      unsubAppointments();
      unsubServices();
      unsubPrizes();
      unsubPromos();
    };
  }, []);

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const appRef = doc(db, 'appointments', id);
      await updateDoc(appRef, { status });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddService = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newService = {
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      duration: formData.get('duration') as string,
      category: formData.get('category') as string,
    };
    await addDoc(collection(db, 'services'), newService);
    setIsAddingService(false);
  };

  const handleAddPrize = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPrize = {
      name: formData.get('name') as string,
    };
    await addDoc(collection(db, 'lucky_prizes'), newPrize);
    setIsAddingPrize(false);
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este procedimento?')) {
      await deleteDoc(doc(db, 'services', id));
    }
  };

  const handleDeletePrize = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este prêmio?')) {
      await deleteDoc(doc(db, 'lucky_prizes', id));
    }
  };

  const filteredAppointments = appointments.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = app.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         app.userPhone.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100 text-[10px] font-bold uppercase tracking-wider">Confirmado</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100 text-[10px] font-bold uppercase tracking-wider">Recusado</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold uppercase tracking-wider">Pendente</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto min-h-screen flex flex-col p-6 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Painel da Gestora</h1>
          <p className="text-sm text-gray-500 font-medium">Controle total do Ivone Studio</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onLogout}
            className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-red-500 transition-colors shadow-sm"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Admin Tabs */}
      <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm mb-8 w-fit">
        <button 
          onClick={() => setActiveTab('appointments')}
          className={cn("px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-all", activeTab === 'appointments' ? "bg-brand-brown text-white shadow-md shadow-brand-brown/20" : "text-gray-400 hover:text-gray-900")}
        >
          Agenda
        </button>
        <button 
          onClick={() => setActiveTab('services')}
          className={cn("px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-all", activeTab === 'services' ? "bg-brand-brown text-white shadow-md shadow-brand-brown/20" : "text-gray-400 hover:text-gray-900")}
        >
          Procedimentos
        </button>
        <button 
          onClick={() => setActiveTab('mimos')}
          className={cn("px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-all", activeTab === 'mimos' ? "bg-brand-brown text-white shadow-md shadow-brand-brown/20" : "text-gray-400 hover:text-gray-900")}
        >
          Mimos
        </button>
      </div>

      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-3xl shadow-sm focus:ring-2 focus:ring-[#D4A373] outline-none"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                  <Clock4 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aguardando</p>
                  <p className="text-xl font-serif font-bold text-gray-900">{appointments.filter(a => a.status === 'pending').length}</p>
                </div>
              </div>
              <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm h-fit self-center">
                <button 
                  onClick={() => setFilter('pending')}
                  className={cn("px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all", filter === 'pending' ? "bg-brand-teal text-white" : "text-gray-400")}
                >
                  Pendentes
                </button>
                <button 
                  onClick={() => setFilter('all')}
                  className={cn("px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all", filter === 'all' ? "bg-brand-teal text-white" : "text-gray-400")}
                >
                  Todos
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cliente</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Procedimento</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Horário</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="w-8 h-8 border-3 border-[#D4A373] border-t-transparent rounded-full animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-gray-400 font-medium">
                        Nenhum agendamento encontrado.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((app) => (
                      <motion.tr 
                        layout
                        key={app.id} 
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-brand-pink rounded-xl flex items-center justify-center text-brand-brown font-serif font-bold text-xs">
                              {app.userName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{app.userName}</p>
                              <p className="text-[11px] text-gray-400 font-mono">{app.userPhone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Scissors className="w-3.5 h-3.5 text-brand-pink" />
                              <span className="text-sm font-semibold text-brand-brown">{app.serviceName}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">{app.date}</span>
                            <span className="text-xs text-brand-teal font-bold">{app.time}h</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {getStatusBadge(app.status)}
                        </td>
                        <td className="px-6 py-5 text-right">
                          {app.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleStatusUpdate(app.id, 'rejected')}
                                className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(app.id, 'approved')}
                                className="p-2 text-green-400 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-2">Finalizado</span>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-serif font-bold text-brand-brown">Catálogo de Procedimentos</h3>
            <button 
              onClick={() => setIsAddingService(true)}
              className="flex items-center gap-2 bg-brand-teal text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-brand-teal/20"
            >
              <Plus className="w-4 h-4" /> Novo Procedimento
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(service => (
              <div key={service.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-pink/10 rounded-2xl flex items-center justify-center text-brand-pink">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-brown">{service.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{service.category} • {service.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-serif font-bold text-brand-teal">{formatPrice(service.price)}</p>
                  </div>
                  <button 
                    onClick={() => service.id && handleDeleteService(service.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'mimos' && (
        <div className="space-y-12">
          {/* Lucky Prizes */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-serif font-bold text-brand-brown">Bilhete da Sorte (Prêmios)</h3>
              <button 
                onClick={() => setIsAddingPrize(true)}
                className="flex items-center gap-2 bg-brand-teal text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-brand-teal/20"
              >
                <Plus className="w-4 h-4" /> Novo Prêmio
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {prizes.map(prize => (
                <div key={prize.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <Ticket className="w-4 h-4 text-brand-teal" />
                    <span className="text-sm font-semibold text-gray-700">{prize.name}</span>
                  </div>
                  <button 
                    onClick={() => prize.id && handleDeletePrize(prize.id)}
                    className="p-2 text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Weekly Promotions */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-serif font-bold text-brand-brown">Promoções Semanais</h3>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {promotions.map(promo => (
                <div key={promo.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-brand-pink">
                      <Star className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{promo.day}</span>
                    </div>
                    <span className="text-lg font-serif font-bold text-brand-brown">{promo.title}</span>
                  </div>
                  <div className="space-y-2">
                    {promo.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="font-semibold text-gray-700">{item.name}</p>
                          {item.sub && <p className="text-[10px] text-gray-400">{item.sub}</p>}
                        </div>
                        <span className="text-brand-teal font-bold">{item.discount || 'Brinde'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Add Service Modal */}
      <AnimatePresence>
        {isAddingService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-brand-brown/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl space-y-6"
            >
              <h3 className="text-2xl font-serif font-bold text-brand-brown">Novo Procedimento</h3>
              <form onSubmit={handleAddService} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Nome</label>
                  <input name="name" required className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-teal outline-none text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Preço (R$)</label>
                    <input name="price" type="number" required className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-teal outline-none text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Duração</label>
                    <input name="duration" placeholder="Ex: 60min" required className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-teal outline-none text-sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Categoria</label>
                  <select name="category" className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-teal outline-none text-sm">
                    <option>Cabelo</option>
                    <option>Unhas</option>
                    <option>Rosto</option>
                    <option>Corpo</option>
                    <option>Geral</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsAddingService(false)} className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Cancelar</button>
                  <button type="submit" className="flex-1 bg-brand-brown text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand-brown/20">Salvar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Prize Modal */}
      <AnimatePresence>
        {isAddingPrize && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-brand-brown/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl space-y-6"
            >
              <h3 className="text-2xl font-serif font-bold text-brand-brown">Novo Prêmio</h3>
              <form onSubmit={handleAddPrize} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Descrição do Mimo</label>
                  <input name="name" required placeholder="Ex: 10% OFF em qualquer serviço!" className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-teal outline-none text-sm" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsAddingPrize(false)} className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Cancelar</button>
                  <button type="submit" className="flex-1 bg-brand-brown text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand-brown/20">Salvar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
