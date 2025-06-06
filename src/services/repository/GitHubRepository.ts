import { AxiosError } from 'axios';
import {
  BaseRepository,
  UserInfo,
  Project,
  Branch,
  FileInfo,
  FileContent,
  CommitAction,
  PullRequest,
} from './BaseRepository';

export class GitHubRepository extends BaseRepository {
  private readonly baseUrl = 'https://api.github.com';

  constructor(accessToken: string) {
    super(accessToken);
    this.httpClient.defaults.headers.common['Authorization'] = `token ${this.accessToken}`;
    this.httpClient.defaults.headers.common['Accept'] = 'application/vnd.github.v3+json';
  }

  async getUserInfo(): Promise<UserInfo> {
    const response = await this.httpClient.get(`${this.baseUrl}/user`);
    return {
      id: response.data.id,
      username: response.data.login,
      name: response.data.name,
      email: response.data.email,
    };
  }

  async getUserProjects(): Promise<Project[]> {
    const response = await this.httpClient.get<{ name: string; id: number; full_name: string }[]>(
      `${this.baseUrl}/user/repos`,
      {
        params: {
          type: 'all',
          sort: 'updated',
          per_page: 100,
        },
      }
    );

    return response.data.map((repo: { name: string; id: number; full_name: string }) => ({
      label: repo.name,
      value: repo.full_name, // GitHub uses owner/repo format
    }));
  }

  async getProjectBranches(projectId: string): Promise<Branch[]> {
    const response = await this.httpClient.get<{ name: string; commit: { sha: string } }[]>(
      `${this.baseUrl}/repos/${projectId}/branches`
    );

    return response.data.map((branch: { name: string; commit: { sha: string } }) => ({
      name: branch.name,
      id: undefined, // GitHub doesn't use numeric IDs for branches
    }));
  }

  async getRepositoryFiles(projectId: string, branch: string): Promise<FileInfo[]> {
    const response = await this.httpClient.get<{ tree: { path: string; type: string }[] }>(
      `${this.baseUrl}/repos/${projectId}/git/trees/${branch}`,
      {
        params: { recursive: 1 },
      }
    );

    return response.data.tree
      .filter((item: { path: string; type: string }) => item.type === 'blob')
      .map((file: { path: string; type: string }) => ({
        name: file.path.split('/').pop() || file.path,
        path: file.path,
      }));
  }

  async getSingleFile(projectId: string, filePath: string, branch: string): Promise<FileContent> {
    const response = await this.httpClient.get(
      `${this.baseUrl}/repos/${projectId}/contents/${filePath}`,
      {
        params: { ref: branch },
      }
    );

    const content = window.atob(response.data.content.replace(/\n/g, ''));

    return {
      name: response.data.name,
      path: response.data.path,
      content: content,
    };
  }

  async createBranch(projectId: string, branchName: string, sourceBranch: string): Promise<Branch> {
    // First, get the SHA of the source branch
    const sourceBranchResponse = await this.httpClient.get(
      `${this.baseUrl}/repos/${projectId}/git/refs/heads/${sourceBranch}`
    );

    const sourceSha = sourceBranchResponse.data.object.sha;

    // Create the new branch
    await this.httpClient.post(`${this.baseUrl}/repos/${projectId}/git/refs`, {
      ref: `refs/heads/${branchName}`,
      sha: sourceSha,
    });

    return {
      name: branchName,
      id: undefined,
    };
  }

  async commitFiles(
    projectId: string,
    branch: string,
    message: string,
    actions: CommitAction[]
  ): Promise<void> {
    // Get the current commit SHA
    const branchResponse = await this.httpClient.get(
      `${this.baseUrl}/repos/${projectId}/git/refs/heads/${branch}`
    );
    const parentSha = branchResponse.data.object.sha;

    // Get the current tree
    const parentCommitResponse = await this.httpClient.get(
      `${this.baseUrl}/repos/${projectId}/git/commits/${parentSha}`
    );
    const baseTreeSha = parentCommitResponse.data.tree.sha;

    // Create blobs for each file
    const tree = [];
    for (const action of actions) {
      if (action.action !== 'delete') {
        const blobResponse = await this.httpClient.post(
          `${this.baseUrl}/repos/${projectId}/git/blobs`,
          {
            content: action.content,
            encoding: 'utf-8',
          }
        );

        tree.push({
          path: action.file_path,
          mode: '100644',
          type: 'blob',
          sha: blobResponse.data.sha,
        });
      } else {
        tree.push({
          path: action.file_path,
          mode: '100644',
          type: 'blob',
          sha: null, // This deletes the file
        });
      }
    }

    // Create a new tree
    const treeResponse = await this.httpClient.post(
      `${this.baseUrl}/repos/${projectId}/git/trees`,
      {
        base_tree: baseTreeSha,
        tree: tree,
      }
    );

    // Create a new commit
    const commitResponse = await this.httpClient.post(
      `${this.baseUrl}/repos/${projectId}/git/commits`,
      {
        message: message,
        tree: treeResponse.data.sha,
        parents: [parentSha],
      }
    );

    // Update the branch reference
    await this.httpClient.patch(`${this.baseUrl}/repos/${projectId}/git/refs/heads/${branch}`, {
      sha: commitResponse.data.sha,
    });
  }

  async createPullRequest(
    projectId: string,
    sourceBranch: string,
    targetBranch: string,
    title: string
  ): Promise<PullRequest> {
    try {
      const response = await this.httpClient.post(`${this.baseUrl}/repos/${projectId}/pulls`, {
        title: title,
        head: sourceBranch,
        base: targetBranch,
      });

      return {
        id: response.data.number,
        title: response.data.title,
        url: response.data.html_url,
        state: response.data.state,
      };
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 422) {
        // Pull request already exists, fetch it
        const existingPR = await this.getExistingPullRequest(projectId, sourceBranch, targetBranch);
        if (existingPR) {
          return existingPR;
        }
      }
      throw error;
    }
  }

  async hasOpenPullRequest(
    projectId: string,
    sourceBranch: string,
    targetBranch: string
  ): Promise<boolean> {
    try {
      const response = await this.httpClient.get(`${this.baseUrl}/repos/${projectId}/pulls`, {
        params: {
          head: sourceBranch,
          base: targetBranch,
          state: 'open',
        },
      });

      return response.data.length > 0;
    } catch (error) {
      console.error('Error checking for open pull requests:', error);
      return false;
    }
  }

  private async getExistingPullRequest(
    projectId: string,
    sourceBranch: string,
    targetBranch: string
  ): Promise<PullRequest | null> {
    try {
      const response = await this.httpClient.get(`${this.baseUrl}/repos/${projectId}/pulls`, {
        params: {
          head: sourceBranch,
          base: targetBranch,
          state: 'all',
        },
      });

      if (response.data.length > 0) {
        const pr = response.data[0];
        return {
          id: pr.number,
          title: pr.title,
          url: pr.html_url,
          state: pr.state,
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching existing pull request:', error);
      return null;
    }
  }

  // Override calculateMainBranch to set it immediately after getting branches
  protected async calculateMainBranch(projectId: string): Promise<string> {
    const mainBranch = await super.calculateMainBranch(projectId);
    return mainBranch;
  }
}
