import { db } from './lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const services = [
  { name: 'Coloração Premium', price: 150, duration: '120min', category: 'Cabelo' },
  { name: 'Corte Design + Secagem', price: 85, duration: '60min', category: 'Cabelo' },
  { name: 'Escova + Hidratação', price: 55, duration: '60min', category: 'Cabelo' },
  { name: 'Escova Modelada', price: 45, duration: '45min', category: 'Cabelo' },
  { name: 'Escova Progressiva', price: 250, duration: '120min', category: 'Cabelo' },
  { name: 'Extensão de Cílios', price: 120, duration: '120min', category: 'Rosto' },
  { name: 'Extensão de Cílios | Manutenção', price: 80, duration: '70min', category: 'Rosto' },
  { name: 'Manicure', price: 30, duration: '30min', category: 'Unhas' },
  { name: 'Pedicure', price: 35, duration: '60min', category: 'Unhas' },
  { name: 'Manicure + Pedicure', price: 60, duration: '90min', category: 'Unhas' },
  { name: 'Pedicure + Podologia', price: 95, duration: '90min', category: 'Unhas' },
  { name: 'Drenagem Linfática', price: 80, duration: '60min', category: 'Corpo' },
  { name: 'Outros', price: 0, duration: 'Variável', category: 'Geral' },
];

export async function seedServices() {
  const querySnapshot = await getDocs(collection(db, 'services'));
  const existingNames = querySnapshot.docs.map(doc => doc.data().name);
  
  for (const service of services) {
    if (!existingNames.includes(service.name)) {
      await addDoc(collection(db, 'services'), service);
      console.log(`Added service: ${service.name}`);
    }
  }

  // Seed Lucky Draw Prizes
  const luckyPrizes = [
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

  const luckySnapshot = await getDocs(collection(db, 'lucky_prizes'));
  if (luckySnapshot.empty) {
    for (const name of luckyPrizes) {
      await addDoc(collection(db, 'lucky_prizes'), { name });
    }
  }

  // Seed Weekly Promotions
  const promotions = [
    {
      day: "Terça-Feira",
      title: "Terça da Beleza",
      icon: "Smile",
      items: [
        { name: 'Escova + Hidratação', sub: 'Tratamento de brilho', discount: '12% OFF' },
        { name: 'Manicure + Pedicure', sub: 'Ritual completo', discount: '12% OFF' },
        { name: 'Manicure', sub: 'Esmaltação simples', discount: '12% OFF' }
      ]
    },
    {
      day: "Quarta-Feira",
      title: "Quarta Iluminada",
      icon: "Heart",
      items: [
        { name: 'Corte + Secagem Feminino', discount: '15% OFF' },
        { name: 'Manicure + Pedicure', sub: 'Ganha um Spa Esfoliante de Pés' }
      ]
    },
    {
      day: "Quinta-Feira",
      title: "Quinta Zen",
      icon: "Coffee",
      items: [
        { name: 'Escova + Hidratação', sub: 'Ganha um Tratamento a Vapor' },
        { name: 'Manutenção de Cílios', discount: '5% OFF' }
      ]
    }
  ];

  const promoSnapshot = await getDocs(collection(db, 'promotions'));
  if (promoSnapshot.empty) {
    for (const promo of promotions) {
      await addDoc(collection(db, 'promotions'), promo);
    }
  }
}
