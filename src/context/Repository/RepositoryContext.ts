import { createContext } from 'react';

interface Repository {
  accessToken: string;
  updateAccessToken: (accessToken: string) => void;
  platform: string;
  updatePlatform: (platform: string) => void;
  userProjects: { label: string; value: string }[];
  selectedProject: string;
  updateSelectedProject: (selectedProject: string) => void;
  projectBranches: string[];
  prLink: string;
  tokenCollection: string;
  updateTokenCollection: (tokenCollection: string) => void;
  themesCollections: string[];
  updateThemesCollections: (themesCollections: string[]) => void;
  fetchSources: () => void;
  runAdapter: () => void;
  adapterResponse: string;
  defaultBranch?: string;
  publishFiles: (selectedBranch: string, createNewBranch: boolean) => void;
}

export const RepositoryContext = createContext<Repository | null>(null);
