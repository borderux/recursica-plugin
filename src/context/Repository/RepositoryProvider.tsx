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
  const [prLink, setPrLink] = useState<string>('');

  const [tokenCollection, setTokenCollection] = useState<string>('');
  const [themesCollections, setThemesCollections] = useState<string[]>([]);

  const {
    repository,
    libraries: { recursicaVariables },
    svgIcons,
  } = useFigma();

  const iconsJson = useMemo(() => {
    if (svgIcons) {
      return JSON.stringify(svgIcons, null, 2);
    }
    return null;
  }, [svgIcons]);

  const variablesJson = useMemo(() => {
    if (recursicaVariables) {
      return JSON.stringify(recursicaVariables, null, 2);
    }
    return null;
  }, [recursicaVariables]);

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

  const getRepositoryFiles = async (): Promise<{ name: string; path: string }[]> => {
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
    const files = await getRepositoryFiles();
    if (variablesJson) {
      const variablesFilename = 'recursica-bundle.json';
      commit.message += `\n${variablesFilename}`;
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
    await axios.post(
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

    try {
      const prResponse = await axios.post(
        `https://gitlab.com/api/v4/projects/${selectedProject}/merge_requests`,
        {
          source_branch: selectedBranch,
          target_branch: 'main',
        }
      );
      const data = prResponse.data;
      setPrLink(data.web_url);
    } catch (error) {
      console.error(error);
    }
    setFilesPublished(true);
  };

  const fetchSources = async () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'FETCH_SOURCES',
          payload: {
            tokenCollection,
            themesCollections,
          },
        },
        pluginId: '*',
      },
      '*'
    );
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
    prLink,
    tokenCollection,
    updateTokenCollection: setTokenCollection,
    themesCollections,
    updateThemesCollections: setThemesCollections,
    fetchSources,
  };
  return <RepositoryContext.Provider value={value}>{children}</RepositoryContext.Provider>;
}
