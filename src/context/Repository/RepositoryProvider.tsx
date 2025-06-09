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
  type CommitAction,
} from '@/services/repository';

interface AdapterFile {
  path: string;
  content: string;
}

export function RepositoryProvider({ children }: { children: React.ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [platform, setPlatform] = useState('');
  const [selectedProjectId, setselectedProjectId] = useState('');
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [filesPublished, setFilesPublished] = useState<boolean>(false);
  const [prLink, setPrLink] = useState<string>('');
  const [adapterResponse, setAdapterResponse] = useState<string>('');
  const [adapterFiles, setAdapterFiles] = useState<AdapterFile[]>([]);

  const [targetBranchId, setTargetBranchId] = useState<number | undefined>(undefined);
  const [projectBranches, setProjectBranches] = useState<Branch[]>([]);
  const selectedBranch = useMemo(() => {
    return projectBranches.find((branch) => branch.id === targetBranchId);
  }, [projectBranches, targetBranchId]);

  const selectedProject = useMemo(() => {
    return userProjects.find((project) => project.id === selectedProjectId);
  }, [userProjects, selectedProjectId]);

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
    if (selectedProjectId && repositoryInstance) {
      getProjectBranches();
    }
  }, [selectedProjectId, repositoryInstance]);

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

  const publishFiles = async () => {
    if (!repositoryInstance || !selectedProjectId || !userInfo || !variablesJson) return;

    try {
      if (!selectedBranch) return;
      const targetBranch = selectedBranch.name;

      if (!selectedProject) return;
      const variablesFilename = 'recursica-bundle.json';

      const exists = await repositoryInstance.fileExists(
        selectedProject,
        variablesFilename,
        targetBranch
      );
      const actions: CommitAction[] = [
        {
          action: exists ? 'update' : 'create',
          file_path: variablesFilename,
          content: variablesJson,
        },
      ];

      for (const file of adapterFiles) {
        if (!selectedProject) return;
        const exists = await repositoryInstance.fileExists(
          selectedProject,
          file.path,
          targetBranch
        );
        actions.push({
          action: exists ? 'update' : 'create',
          file_path: file.path,
          content: file.content,
        });
      }

      await repositoryInstance.commitFiles(
        selectedProjectId,
        targetBranch,
        `Files committed by Recursica\n${variablesFilename}`,
        actions
      );

      try {
        const pullRequest = await repositoryInstance.createPullRequest(
          selectedProjectId,
          targetBranch,
          selectedProject.defaultBranch,
          'New recursica tokens release'
        );
        setPrLink(pullRequest.url);
      } catch (error) {
        console.error('Failed to create pull request, trying to find existing one:', error);

        // Check if there's already an open PR/MR for this branch
        const hasOpenPR = await repositoryInstance.hasOpenPullRequest(
          selectedProjectId,
          targetBranch,
          selectedProject.defaultBranch
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
    if (!repositoryInstance || !selectedProjectId) return;

    try {
      const adapterFilename = 'recursica/adapter.js';
      if (!selectedProject || !selectedBranch) return;

      const fileContent = await repositoryInstance.getSingleFile(
        selectedProject,
        adapterFilename,
        selectedBranch?.name
      );

      const configFile = await repositoryInstance.getSingleFile(
        selectedProject,
        'recursica.json',
        selectedBranch?.name
      );

      const config = JSON.parse(configFile.content);

      // The new URL(..., import.meta.url) syntax is the standard way to load workers
      // in modern JavaScript projects (supported by Vite, Create React App, etc.)
      const worker = new Worker(
        URL.createObjectURL(new Blob([fileContent.content], { type: 'text/javascript' }))
      );
      worker.postMessage({
        bundledJson: variablesJson,
        srcPath: 'src',
        project: 'recursica',
        iconsJson: '',
        overrides: config.overrides,
        iconsConfig: config.iconsConfig,
      });

      // Listener for messages coming FROM the worker
      worker.onmessage = (event) => {
        console.log('✅ Response received from worker:', event.data);
        const {
          recursicaTokens,
          vanillaExtractThemes,
          mantineTheme,
          uiKitObject,
          recursicaObject,
          colorsType,
          iconsObject,
        } = event.data;
        const newAdapterFiles: AdapterFile[] = [];

        if (recursicaTokens) {
          newAdapterFiles.push({
            path: recursicaTokens.path,
            content: recursicaTokens.content,
          });
        }

        const {
          availableThemes,
          themeContract,
          themesFileContent,
          vanillaExtractThemes: subThemes,
        } = vanillaExtractThemes;
        if (availableThemes) {
          newAdapterFiles.push({
            path: availableThemes.path,
            content: availableThemes.content,
          });
        }
        if (themeContract) {
          newAdapterFiles.push({
            path: themeContract.path,
            content: themeContract.content,
          });
        }
        if (themesFileContent) {
          newAdapterFiles.push({
            path: themesFileContent.path,
            content: themesFileContent.content,
          });
        }
        for (const theme of subThemes) {
          newAdapterFiles.push({
            path: theme.path,
            content: theme.content,
          });
        }

        if (mantineTheme.mantineTheme) {
          newAdapterFiles.push({
            path: mantineTheme.mantineTheme.path,
            content: mantineTheme.mantineTheme.content,
          });
        }
        if (mantineTheme.postCss) {
          newAdapterFiles.push({
            path: mantineTheme.postCss.path,
            content: mantineTheme.postCss.content,
          });
        }

        if (uiKitObject) {
          newAdapterFiles.push({
            path: uiKitObject.path,
            content: uiKitObject.content,
          });
        }

        if (recursicaObject) {
          newAdapterFiles.push({
            path: recursicaObject.path,
            content: recursicaObject.content,
          });
        }

        if (colorsType) {
          newAdapterFiles.push({
            path: colorsType.path,
            content: colorsType.content,
          });
        }

        if (iconsObject) {
          newAdapterFiles.push({
            path: iconsObject.iconExports.path,
            content: iconsObject.iconExports.content,
          });
          newAdapterFiles.push({
            path: iconsObject.iconResourceMap.path,
            content: iconsObject.iconResourceMap.content,
          });
          for (const icon of iconsObject.exportedIcons) {
            newAdapterFiles.push({
              path: icon.path,
              content: icon.content,
            });
          }
        }
        setAdapterFiles(newAdapterFiles);
        setAdapterResponse(`adapter ran successfully: ${event.data}`);
      };

      // Listener for any errors that might occur inside the worker
      worker.onerror = (error) => {
        console.error('❌ Error in worker:', error);
        setAdapterResponse(`Error: ${error.message}`);
      };
    } catch (error) {
      console.error('Failed to run adapter:', error);
      setAdapterResponse('Failed to run adapter');
    }
  };

  const value = {
    accessToken,
    platform,
    selectedProjectId,
    updateAccessToken: setAccessToken,
    updatePlatform: setPlatform,
    updateSelectedProjectId: setselectedProjectId,
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
    updateTargetBranchId: setTargetBranchId,
  };

  return <RepositoryContext.Provider value={value}>{children}</RepositoryContext.Provider>;
}
