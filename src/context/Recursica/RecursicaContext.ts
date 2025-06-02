import { createContext } from 'react';

export interface IRecursicaContext {
  token: string;
  updateToken: (token: string) => void;
  projectId: string;
  updateProjectId: (projectId: string) => void;
}

export const RecursicaContext = createContext<IRecursicaContext | null>(null);
