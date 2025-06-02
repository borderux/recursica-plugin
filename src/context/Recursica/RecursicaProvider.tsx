import { useState } from 'react';
import { RecursicaContext } from './RecursicaContext';

export const RecursicaProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState('');
  const [projectId, setProjectId] = useState('');

  const value = {
    token,
    updateToken: (token: string) => setToken(token),
    projectId,
    updateProjectId: (projectId: string) => setProjectId(projectId),
  };

  return <RecursicaContext.Provider value={value}>{children}</RecursicaContext.Provider>;
};
