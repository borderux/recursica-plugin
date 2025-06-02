import { useEffect, useMemo, useState } from 'react';
import { RepositoryContext } from './RepositoryContext';
import { useFigma } from '@/hooks/useFigma';
import axios from 'axios';

interface UserInfo {
  id: number;
  username?: string;
  name?: string;
  email?: string;
}

export function RepositoryProvider({ children }: { children: React.ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [platform, setPlatform] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [projectBranches, setProjectBranches] = useState<string[]>([]);
  const [userProjects, setUserProjects] = useState<{ label: string; value: string }[]>([]);
  const [filesPublished, setFilesPublished] = useState<boolean>(false);
  const { repository, variables, svgIcons, metadata } = useFigma();
  const iconsJson = useMemo(() => {
    if (svgIcons) {
      return JSON.stringify(svgIcons, null, 2);
    }
    return null;
  }, [svgIcons]);

  const variablesJson = useMemo(() => {
    if (variables) {
      return JSON.stringify(variables, null, 2);
    }
    return null;
  }, [variables]);

  const variablesFilename = useMemo(() => {
    if (metadata?.projectType === 'themes') {
      return `recursica-${metadata?.theme}-theme.json`;
    }
    return `recursica-${metadata?.projectType}.json`;
  }, [metadata]);

  useEffect(() => {
    if (repository) {
      setAccessToken(repository.accessToken);
      setPlatform(repository.platform);
    }
  }, [repository]);

  useEffect(() => {
    if (accessToken) {
      fetchUserInfo();
    }
  }, [accessToken]);

  useEffect(() => {
    if (selectedProject) {
      getProjectBranches();
    }
  }, [selectedProject]);

  useEffect(() => {
    if (userInfo) {
      getUserProjects();
    }
  }, [userInfo]);

  useEffect(() => {
    if (selectedProject && selectedBranch) {
      publishFiles();
    }
  }, [selectedProject, selectedBranch]);

  const fetchUserInfo = async () => {
    const response = await axios.get(`https://gitlab.com/api/v4/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.data;
    setUserInfo(data);
  };

  const getUserProjects = async () => {
    const response = await axios.get<{ name: string; id: number }[]>(
      `https://gitlab.com/api/v4/users/${userInfo?.id}/contributed_projects`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = response.data;
    const projects = data.map((project: { name: string; id: number }) => {
      return { label: project.name, value: project.id.toString() };
    });
    setUserProjects(projects);
  };

  const getProjectBranches = async () => {
    const response = await axios.get<{ name: string; id: number }[]>(
      `https://gitlab.com/api/v4/projects/${selectedProject}/repository/branches`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = response.data;
    const branches = data.map((branch: { name: string; id: number }) => branch.name);
    setProjectBranches(branches);
  };

  const getFiles = async (): Promise<{ name: string; path: string }[]> => {
    const response = await axios.get(
      `https://gitlab.com/api/v4/projects/${selectedProject}/repository/tree`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          ref: selectedBranch,
        },
      }
    );
    return response.data;
  };

  const publishFiles = async () => {
    const commit = {
      message: 'Files commited by Recursica',
      actions: [] as { action: string; file_path: string; content: string }[],
    };
    const files = await getFiles();
    console.log(variablesJson, iconsJson);
    if (variablesJson) {
      commit.message += `\nrecursica-variables.json`;
      const exists = files.find((file) => file.name === variablesFilename);
      commit.actions.push({
        action: exists ? 'update' : 'create',
        file_path: variablesFilename,
        content: variablesJson,
      });
    }
    if (iconsJson) {
      const iconFilename = 'recursica-icons.json';
      const exists = files.find((file) => file.name === iconFilename);
      commit.message += `\n${iconFilename}`;
      commit.actions.push({
        action: exists ? 'update' : 'create',
        file_path: iconFilename,
        content: iconsJson,
      });
    }
    const response = await axios.post(
      `https://gitlab.com/api/v4/projects/${selectedProject}/repository/commits`,
      {
        branch: selectedBranch,
        commit_message: commit.message,
        actions: commit.actions,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = response.data;
    console.log(data);
    setFilesPublished(true);
  };

  const value = {
    accessToken,
    platform,
    selectedProject,
    selectedBranch,
    updateAccessToken: setAccessToken,
    updatePlatform: setPlatform,
    updateSelectedProject: setSelectedProject,
    updateSelectedBranch: setSelectedBranch,
    userProjects,
    projectBranches,
    filesPublished,
  };
  return <RepositoryContext.Provider value={value}>{children}</RepositoryContext.Provider>;
}
