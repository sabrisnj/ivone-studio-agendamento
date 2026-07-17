import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Appointment } from '../../types';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Calendar, Clock, Scissors, CheckCircle2, Clock4, XCircle } from 'lucide-react';
import { cn } from '../../utils';

interface AppointmentsTabProps {
  user: User;
}

export default function AppointmentsTab({ user }: AppointmentsTabProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.id]);

  const getStatusInfo = (status: Appointment['status']) => {
    switch (status) {
      case 'approved': return { label: 'Confirmado', icon: <CheckCircle2 className="w-3 h-3" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
      case 'rejected': return { label: 'Cancelado', icon: <XCircle className="w-3 h-3" />, color: 'bg-red-50 text-red-600 border-red-100' };
      case 'completed': return { label: 'Finalizado', icon: <CheckCircle2 className="w-3 h-3" />, color: 'bg-gray-50 text-gray-600 border-gray-100' };
      default: return { label: 'Pendente', icon: <Clock4 className="w-3 h-3" />, color: 'bg-brand-pink/20 text-brand-brown border-brand-pink/30' };
    }
  };

  return (
    <div className="p-6 pt-12 space-y-8 max-w-md mx-auto min-h-screen">
      <div className="space-y-2">
        <h1 className={cn(
          "text-3xl font-serif font-bold",
          user.accessibility?.darkMode ? "text-white" : "text-brand-brown"
        )}>
          Meus Agendamentos
        </h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Acompanhe suas reservas</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-brand-pink border-t-transparent rounded-full animate-spin" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-brand-pink/20">
          <div className="w-16 h-16 bg-brand-beige rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-brand-pink" />
          </div>
          <p className="text-sm font-medium text-gray-500">Nenhum agendamento encontrado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((app, index) => {
            const status = getStatusInfo(app.status);
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-5 rounded-3xl border shadow-sm transition-all",
                  user.accessibility?.darkMode ? "bg-zinc-800 border-zinc-700" : "bg-white border-brand-pink/10"
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-pink rounded-2xl flex items-center justify-center text-brand-brown shadow-sm">
                      <Scissors className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={cn(
                        "font-serif font-bold",
                        user.accessibility?.darkMode ? "text-white" : "text-brand-brown"
                      )}>{app.serviceName}</h4>
                      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-brand-teal mt-0.5">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {app.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {app.time}h
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                    status.color
                  )}>
                    {status.icon}
                    {status.label}
                  </div>
                </div>

                {app.notes && (
                  <div className="pt-3 border-t border-gray-50 mt-3">
                    <p className="text-[10px] text-gray-400 italic">" {app.notes} "</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
