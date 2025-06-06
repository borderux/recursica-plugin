import { useEffect, useMemo, useState } from 'react';
import { RepositoryContext } from './RepositoryContext';
import { useFigma } from '@/hooks/useFigma';
import {
  BaseRepository,
  GitLabRepository,
  GitHubRepository,
  type UserInfo,
  type Project,
  type Branch,
  type FileInfo,
  type CommitAction,
} from '@/services/repository';

export function RepositoryProvider({ children }: { children: React.ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [platform, setPlatform] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [projectBranches, setProjectBranches] = useState<Branch[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [filesPublished, setFilesPublished] = useState<boolean>(false);
  const [prLink, setPrLink] = useState<string>('');
  const [adapterResponse, setAdapterResponse] = useState<string>('');

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

  // Create repository instance based on platform
  const repositoryInstance = useMemo((): BaseRepository | null => {
    if (!accessToken || !platform) return null;

    switch (platform.toLowerCase()) {
      case 'gitlab':
        return new GitLabRepository(accessToken);
      case 'github':
        return new GitHubRepository(accessToken);
      default:
        return null;
    }
  }, [accessToken, platform]);

  useEffect(() => {
    if (repository) {
      setAccessToken(repository.accessToken);
      setPlatform(repository.platform);
    }
  }, [repository]);

  useEffect(() => {
    if (repositoryInstance) {
      fetchUserInfo();
    }
  }, [repositoryInstance]);

  useEffect(() => {
    if (selectedProject && repositoryInstance) {
      getProjectBranches();
    }
  }, [selectedProject, repositoryInstance]);

  useEffect(() => {
    if (userInfo && repositoryInstance) {
      getUserProjects();
    }
  }, [userInfo, repositoryInstance]);

  const defaultBranch = projectBranches.find(
    (branch) => branch.name === 'main' || branch.name === 'master'
  )?.name;

  const fetchUserInfo = async () => {
    if (!repositoryInstance) return;

    try {
      const data = await repositoryInstance.getUserInfo();
      setUserInfo(data);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  const getUserProjects = async () => {
    if (!repositoryInstance) return;

    try {
      const projects = await repositoryInstance.getUserProjects();
      setUserProjects(projects);
    } catch (error) {
      console.error('Failed to fetch user projects:', error);
    }
  };

  const getProjectBranches = async () => {
    if (!repositoryInstance || !selectedProject) return;

    try {
      const branches = await repositoryInstance.getProjectBranches(selectedProject);
      setProjectBranches(branches);
    } catch (error) {
      console.error('Failed to fetch project branches:', error);
    }
  };

  const getRepositoryFiles = async (selectedBranch: string): Promise<FileInfo[]> => {
    if (!repositoryInstance || !selectedProject) return [];

    try {
      return await repositoryInstance.getRepositoryFiles(selectedProject, selectedBranch);
    } catch (error) {
      console.error('Failed to fetch repository files:', error);
      return [];
    }
  };

  const publishFiles = async (selectedBranch: string, createNewBranch: boolean) => {
    if (!repositoryInstance || !selectedProject || !userInfo || !variablesJson) return;

    try {
      let targetBranch = selectedBranch;

      if (createNewBranch) {
        const newBranchName = `recursica-${userInfo.username}-${Math.floor(Date.now() / 1000)}`;
        const branch = await repositoryInstance.createBranch(
          selectedProject,
          newBranchName,
          'main'
        );
        targetBranch = branch.name;
      }

      const files = await getRepositoryFiles(targetBranch);
      const variablesFilename = 'recursica-bundle.json';

      const exists = files.find((file) => file.name === variablesFilename);
      const actions: CommitAction[] = [
        {
          action: exists ? 'update' : 'create',
          file_path: variablesFilename,
          content: variablesJson,
        },
      ];

      await repositoryInstance.commitFiles(
        selectedProject,
        targetBranch,
        `Files committed by Recursica\n${variablesFilename}`,
        actions
      );

      try {
        const pullRequest = await repositoryInstance.createPullRequest(
          selectedProject,
          targetBranch,
          defaultBranch || 'main',
          'New recursica tokens release'
        );
        setPrLink(pullRequest.url);
      } catch (error) {
        console.error('Failed to create pull request, trying to find existing one:', error);

        // Check if there's already an open PR/MR for this branch
        const hasOpenPR = await repositoryInstance.hasOpenPullRequest(
          selectedProject,
          targetBranch,
          defaultBranch || 'main'
        );

        if (hasOpenPR) {
          console.log('Pull request already exists for this branch');
        }
      }

      setFilesPublished(true);
    } catch (error) {
      console.error('Failed to publish files:', error);
    }
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
    if (!repositoryInstance || !selectedProject) return;

    try {
      const adapterFilename = 'helloworld.js';
      const targetBranch = 'recursica/v2';

      const fileContent = await repositoryInstance.getSingleFile(
        selectedProject,
        adapterFilename,
        targetBranch
      );

      const adapter = eval(fileContent.content);
      setAdapterResponse(`adapter ran successfully: ${adapter}`);
    } catch (error) {
      console.error('Failed to run adapter:', error);
      setAdapterResponse('Failed to run adapter');
    }
  };

  const value = {
    accessToken,
    platform,
    selectedProject,
    updateAccessToken: setAccessToken,
    updatePlatform: setPlatform,
    updateSelectedProject: setSelectedProject,
    userProjects,
    projectBranches: projectBranches.map((branch) => branch.name), // Convert back to strings for compatibility
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
