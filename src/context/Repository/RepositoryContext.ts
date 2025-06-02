import { createContext } from 'react';

interface Repository {
  accessToken: string;
  updateAccessToken: (accessToken: string) => void;
  platform: string;
  updatePlatform: (platform: string) => void;
  userProjects: { label: string; value: string }[];
  selectedProject: string;
  updateSelectedProject: (selectedProject: string) => void;
  selectedBranch: string;
  updateSelectedBranch: (selectedBranch: string) => void;
  projectBranches: string[];
}

export const RepositoryContext = createContext<Repository | null>(null);
