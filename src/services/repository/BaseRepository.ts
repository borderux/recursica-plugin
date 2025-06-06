import axios, { AxiosInstance } from 'axios';

/**
 * Represents user information from Git platforms (GitHub/GitLab)
 */
export interface UserInfo {
  /** Unique identifier for the user */
  id: number;
  /** Username/login handle (optional) */
  username?: string;
  /** Full display name (optional) */
  name?: string;
  /** Email address (optional) */
  email?: string;
}

/**
 * Represents a project/repository for selection in UI components
 */
export interface Project {
  /** Human-readable project name for display */
  label: string;
  /** Unique identifier used for API calls (project ID for GitLab, owner/repo for GitHub) */
  value: string;
}

/**
 * Represents a Git branch with platform-specific metadata
 */
export interface Branch {
  /** Branch name (e.g., 'main', 'develop', 'feature/xyz') */
  name: string;
  /** Optional numeric identifier (used by GitLab, undefined for GitHub) */
  id?: number;
}

/**
 * Represents basic file information from repository listings
 */
export interface FileInfo {
  /** File name without path (e.g., 'package.json') */
  name: string;
  /** Full path relative to repository root (e.g., 'src/components/Button.tsx') */
  path: string;
}

/**
 * Represents complete file information including content
 */
export interface FileContent {
  /** File name without path */
  name: string;
  /** Full path relative to repository root */
  path: string;
  /** Decoded file content as string */
  content: string;
}

/**
 * Represents an action to be performed during a commit operation
 */
export interface CommitAction {
  /** The type of action to perform on the file */
  action: 'create' | 'update' | 'delete';
  /** Path where the file should be created/updated/deleted */
  file_path: string;
  /** File content (ignored for delete actions) */
  content: string;
}

/**
 * Represents a Pull Request (GitHub) or Merge Request (GitLab)
 */
export interface PullRequest {
  /** Unique identifier (PR number for GitHub, MR IID for GitLab) */
  id: number;
  /** Title of the pull/merge request */
  title: string;
  /** Web URL to view the pull/merge request */
  url: string;
  /** Current state (e.g., 'open', 'merged', 'closed') */
  state: string;
}

export abstract class BaseRepository {
  protected accessToken: string;
  protected httpClient: AxiosInstance;
  protected mainBranch: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.httpClient = axios.create();
    this.mainBranch = 'main'; // Default, will be calculated
  }

  // Abstract methods that must be implemented by concrete classes
  abstract getUserInfo(): Promise<UserInfo>;
  abstract getUserProjects(): Promise<Project[]>;
  abstract getProjectBranches(projectId: string): Promise<Branch[]>;
  abstract getRepositoryFiles(projectId: string, branch: string): Promise<FileInfo[]>;
  abstract getSingleFile(projectId: string, filePath: string, branch: string): Promise<FileContent>;
  abstract createBranch(
    projectId: string,
    branchName: string,
    sourceBranch: string
  ): Promise<Branch>;
  abstract commitFiles(
    projectId: string,
    branch: string,
    message: string,
    actions: CommitAction[]
  ): Promise<void>;
  abstract createPullRequest(
    projectId: string,
    sourceBranch: string,
    targetBranch: string,
    title: string
  ): Promise<PullRequest>;
  abstract hasOpenPullRequest(
    projectId: string,
    sourceBranch: string,
    targetBranch: string
  ): Promise<boolean>;

  // Common method to calculate main branch
  protected async calculateMainBranch(projectId: string): Promise<string> {
    const branches = await this.getProjectBranches(projectId);
    const mainBranch = branches.find(
      (branch) => branch.name === 'main' || branch.name === 'master'
    );

    if (mainBranch) {
      this.mainBranch = mainBranch.name;
      return this.mainBranch;
    }

    // If no main/master branch found, return the first branch or default to 'main'
    this.mainBranch = branches.length > 0 ? branches[0].name : 'main';
    return this.mainBranch;
  }

  // Getter for main branch
  public getMainBranch(): string {
    return this.mainBranch;
  }

  // Common utility method to generate branch name
  protected generateBranchName(username: string, prefix: string = 'recursica'): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    return `${prefix}-${username}-${timestamp}`;
  }
}
