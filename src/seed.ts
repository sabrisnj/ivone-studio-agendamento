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
}
