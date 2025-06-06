import { useEffect, useMemo, useState } from 'react';
import { RepositoryContext } from './RepositoryContext';
import { useFigma } from '@/hooks/useFigma';
import axios, { AxiosError } from 'axios';

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
  const [projectBranches, setProjectBranches] = useState<string[]>([]);
  const [userProjects, setUserProjects] = useState<{ label: string; value: string }[]>([]);
  const [filesPublished, setFilesPublished] = useState<boolean>(false);
  const [prLink, setPrLink] = useState<string>('');
  const [adapterResponse, setAdapterResponse] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [targetBranch, setTargetBranch] = useState<string>('');

  const [tokenCollection, setTokenCollection] = useState<string>('');
  const [themesCollections, setThemesCollections] = useState<string[]>([]);

  const {
    repository,
    libraries: { recursicaVariables },
  } = useFigma();

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

  const defaultBranch = projectBranches.find((branch) => branch === 'main' || branch === 'master');

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

  const getRepositoryFiles = async (
    selectedBranch: string
  ): Promise<{ name: string; path: string }[]> => {
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

  const publishFiles = async (selectedBranch: string, createNewBranch: boolean) => {
    const commit = {
      message: 'Files commited by Recursica',
      actions: [] as { action: string; file_path: string; content: string }[],
    };
    let targetBranch = selectedBranch;
    if (createNewBranch) {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const newBranchName = `recursica-${userInfo?.username}-${timestamp}`;
      const newBranch = await axios.post(
        `https://gitlab.com/api/v4/projects/${selectedProject}/repository/branches`,
        {
          branch: newBranchName,
          ref: 'main',
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      targetBranch = newBranch.data.name;
    }
    setTargetBranch(targetBranch);
    const files = await getRepositoryFiles(targetBranch);
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
    await axios.post(
      `https://gitlab.com/api/v4/projects/${selectedProject}/repository/commits`,
      {
        branch: targetBranch,
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
          source_branch: targetBranch,
          target_branch: defaultBranch,
          title: 'New recursica tokens release',
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = prResponse.data;
      setPrLink(data.web_url);
    } catch (error) {
      if (error instanceof AxiosError) {
        const response = await axios.get(
          `https://gitlab.com/api/v4/projects/${selectedProject}/merge_requests`,
          {
            params: {
              source_branch: targetBranch,
              target_branch: defaultBranch,
            },
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const data = response.data;
        setPrLink(data[0].web_url);
      } else {
        console.error(error);
      }
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

  const runAdapter = async () => {
    const adapterFilename = 'helloworld.js';
    const targetBranch = 'recursica/v2';
    const response = await axios.get(
      `https://gitlab.com/api/v4/projects/${selectedProject}/repository/files/${adapterFilename}`,
      {
        params: {
          ref: targetBranch,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const adapterCode = window.atob(response.data.content);
    const adapter = eval(adapterCode);
    setAdapterResponse(`adapter ran successfully: ${adapter}`);
  };

  const value = {
    accessToken,
    platform,
    selectedProject,
    updateAccessToken: setAccessToken,
    updatePlatform: setPlatform,
    updateSelectedProject: setSelectedProject,
    userProjects,
    projectBranches,
    filesPublished,
    prLink,
    tokenCollection,
    updateTokenCollection: setTokenCollection,
    themesCollections,
    updateThemesCollections: setThemesCollections,
    fetchSources,
    publishFiles,
    defaultBranch,
    runAdapter,
    adapterResponse,
  };
  return <RepositoryContext.Provider value={value}>{children}</RepositoryContext.Provider>;
}
