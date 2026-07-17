import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { User, Service } from '../types';
import { X, Calendar, Clock, ChevronRight, Check, Scissors, Star } from 'lucide-react';
import { cn, formatPrice } from '../utils';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const TIMES = [
  '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export default function BookingModal({ isOpen, onClose, user }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchServices();
      setStep(1);
      setSuccess(false);
      setSelectedService(null);
      setSelectedDate('');
      setSelectedTime('');
    }
  }, [isOpen]);

  const [otherDescription, setOtherDescription] = useState('');
  const [otherDuration, setOtherDuration] = useState('');

  const fetchServices = async () => {
    const snapshot = await getDocs(collection(db, 'services'));
    const svcs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Service[];
    // Remove duplicates and sort by name
    const uniqueSvcs = Array.from(new Map(svcs.map(s => [s.name, s])).values())
      .sort((a, b) => a.name.localeCompare(b.name));
    setServices(uniqueSvcs);
  };

  const handleBooking = async () => {
    if (!user || !selectedService || !selectedDate || !selectedTime) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        serviceId: selectedService.id,
        serviceName: selectedService.name === 'Outros' ? `Outros: ${otherDescription}` : selectedService.name,
        date: selectedDate,
        time: selectedTime,
        status: 'pending',
        notes: selectedService.name === 'Outros' ? `Procedimento: ${otherDescription} | Duração: ${otherDuration}` : '',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-brand-brown">Agendar</h2>
            <p className="text-[10px] font-bold text-brand-teal uppercase tracking-widest">Passo {step} de 3</p>
          </div>
          <button onClick={onClose} className="p-3 text-gray-400 hover:text-brand-brown rounded-2xl hover:bg-gray-100 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shadow-lg shadow-emerald-500/10">
                <Check className="w-12 h-12 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold text-brand-brown">Pedido Enviado!</h3>
                <p className="text-sm text-gray-500 max-w-[260px] mx-auto">
                  Analisaremos seu pedido e confirmaremos em breve via WhatsApp.
                </p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Selecione o Procedimento</h3>
                  <div className="space-y-3">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => {
                          setSelectedService(service);
                          if (service.name !== 'Outros') setStep(2);
                        }}
                        className={cn(
                          "w-full p-6 rounded-3xl border text-left transition-all flex items-center justify-between group",
                          selectedService?.id === service.id 
                            ? "border-brand-teal bg-brand-teal/5 ring-1 ring-brand-teal" 
                            : "border-gray-100 hover:border-brand-pink/30 hover:bg-brand-beige/20"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                            selectedService?.id === service.id ? "bg-brand-teal text-white" : "bg-brand-pink/10 text-brand-pink"
                          )}>
                            <Scissors className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-serif font-bold text-brand-brown">{service.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{service.duration}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-teal group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>

                  {selectedService?.name === 'Outros' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 pt-4"
                    >
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-brand-teal uppercase tracking-widest ml-1">Outro: ______________________</label>
                        <textarea
                          value={otherDescription}
                          onChange={(e) => setOtherDescription(e.target.value)}
                          placeholder="Digite aqui o procedimento..."
                          className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-brand-teal outline-none text-sm min-h-[100px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-brand-teal uppercase tracking-widest ml-1">Tempo: ______________________</label>
                        <input
                          type="text"
                          value={otherDuration}
                          onChange={(e) => setOtherDuration(e.target.value)}
                          placeholder="Ex: 1h 30min"
                          className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-brand-teal outline-none text-sm"
                        />
                      </div>
                      <button
                        onClick={() => setStep(2)}
                        disabled={!otherDescription || !otherDuration}
                        className="w-full py-5 bg-brand-brown text-white font-bold rounded-2xl shadow-xl shadow-brand-brown/20 hover:scale-[1.01] active:scale-[0.99] transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                      >
                        Continuar
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Selecione a Data</h3>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-brand-teal outline-none font-bold text-brand-brown"
                    />
                  </div>

                  {selectedDate && (
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Horários Disponíveis</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {TIMES.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={cn(
                              "py-4 rounded-2xl text-[10px] font-bold transition-all border uppercase tracking-widest",
                              selectedTime === time
                                ? "bg-brand-teal text-white border-brand-teal shadow-lg shadow-brand-teal/20"
                                : "bg-white border-gray-100 text-gray-400 hover:border-brand-pink/30"
                            )}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-5 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all uppercase tracking-widest text-xs"
                    >
                      Voltar
                    </button>
                    <button
                      disabled={!selectedDate || !selectedTime}
                      onClick={() => setStep(3)}
                      className="flex-[2] py-5 bg-brand-brown text-white font-bold rounded-2xl shadow-xl shadow-brand-brown/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
                    >
                      Continuar
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-brand-pink/5 border border-brand-pink/10 rounded-[2rem] p-8 space-y-6">
                    <h3 className="text-[10px] font-bold text-brand-teal uppercase tracking-widest">Resumo do Agendamento</h3>
                    <div className="space-y-6">
                      <SummaryItem icon={<Scissors className="w-5 h-5" />} label="Procedimento" value={selectedService?.name === 'Outros' ? otherDescription : selectedService?.name || ''} />
                      <SummaryItem icon={<Calendar className="w-5 h-5" />} label="Data e Hora" value={`${selectedDate} às ${selectedTime}h`} />
                      <SummaryItem icon={<Star className="w-5 h-5" />} label="Status" value="Aguardando Confirmação" />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 py-5 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all uppercase tracking-widest text-xs"
                    >
                      Voltar
                    </button>
                    <button
                      disabled={loading}
                      onClick={handleBooking}
                      className="flex-[2] py-5 bg-brand-teal text-white font-bold rounded-2xl shadow-xl shadow-brand-teal/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          <span>Finalizar Pedido</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function SummaryItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-pink shadow-sm border border-brand-pink/5">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="font-serif font-bold text-brand-brown mt-0.5">{value}</p>
      </div>
    </div>
  );
}
