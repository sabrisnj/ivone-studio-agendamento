export type AppointmentStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  category: string;
}

export interface UserPreferences {
  memorizeProfile: boolean;
  drink: 'Café Quente' | 'Café Morno' | 'Chá Quente' | 'Chá Morno' | 'Água Fresca' | 'Água Gelada' | 'Nada';
  allergies: string;
  aromas: string;
  lavatoryTemp: 'QUENTE' | 'MORNA' | 'FRIA';
}

export interface AccessibilitySettings {
  darkMode: boolean;
  highContrast: boolean;
  largeFont: boolean;
  narration: boolean;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  isAdmin: boolean;
  preferences?: UserPreferences;
  accessibility?: AccessibilitySettings;
  lastLuckyDraw?: string;
  currentPrize?: string;
  luckyDrawCount?: number;
}

export interface LuckyDrawPrize {
  id?: string;
  name: string;
}

export interface WeeklyPromotion {
  id?: string;
  day: string;
  title: string;
  icon?: string;
  items: {
    name: string;
    sub?: string;
    discount?: string;
  }[];
}

export interface Appointment {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  createdAt: any;
  notes?: string;
}
