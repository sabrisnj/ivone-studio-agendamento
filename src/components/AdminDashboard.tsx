import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { User, Appointment, Service } from '../types';
import { CheckCircle2, XCircle, Clock4, LogOut, Filter, Calendar, User as UserIcon, Phone, Scissors, Plus, Search } from 'lucide-react';
import { cn, formatPrice } from '../utils';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'appointments'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(apps);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const appRef = doc(db, 'appointments', id);
      await updateDoc(appRef, { status });
    } catch (err) {
      console.error(err);
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
    <div className="max-w-4xl mx-auto min-h-screen flex flex-col p-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Painel da Gestora</h1>
          <p className="text-sm text-gray-500 font-medium">Controle total do Ivone Studio</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
            <button 
              onClick={() => setFilter('pending')}
              className={cn("px-4 py-2 rounded-xl text-sm font-medium transition-all", filter === 'pending' ? "bg-brand-brown text-white shadow-md shadow-brand-brown/20" : "text-gray-500 hover:text-gray-900")}
            >
              Pendentes
            </button>
            <button 
              onClick={() => setFilter('all')}
              className={cn("px-4 py-2 rounded-xl text-sm font-medium transition-all", filter === 'all' ? "bg-brand-brown text-white shadow-md shadow-brand-brown/20" : "text-gray-500 hover:text-gray-900")}
            >
              Todos
            </button>
          </div>
          <button 
            onClick={onLogout}
            className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-red-500 transition-colors shadow-sm"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="flex-1 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center text-green-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hoje</p>
              <p className="text-xl font-serif font-bold text-gray-900">
                {appointments.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'approved').length}
              </p>
            </div>
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
                        {app.notes && (
                          <span className="text-[10px] text-brand-teal italic mt-1 block max-w-[150px] truncate" title={app.notes}>
                            "{app.notes}"
                          </span>
                        )}
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
                            title="Recusar"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(app.id, 'approved')}
                            className="p-2 text-green-400 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all"
                            title="Confirmar"
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
  );
}
