import { Project } from '@/services/repository/BaseRepository';
import { createContext } from 'react';

interface Repository {
  accessToken: string;
  updateAccessToken: (accessToken: string) => void;

  platform: string;
  updatePlatform: (platform: string) => void;

  userProjects: Project[];
  selectedProjectId: string;
  updateSelectedProjectId: (selectedProjectId: string) => void;

  prLink: string;

  fetchSources: () => void;

  runAdapter: () => void;
  adapterResponse: string;

  publishFiles: () => void;
}

export const RepositoryContext = createContext<Repository | null>(null);
