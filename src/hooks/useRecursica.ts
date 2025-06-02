import { RecursicaContext } from '@/context';
import { useContext } from 'react';

export function useRecursica() {
  const context = useContext(RecursicaContext);
  if (!context) {
    throw new Error('Recursica context not found');
  }
  return context;
}
