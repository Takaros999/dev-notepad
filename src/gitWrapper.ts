import { Uri, extensions, window, workspace } from "vscode";
import { API, GitExtension, Repository } from "./git";
import path from "path";

//todo: throw errors instead of returning null
export class GitWrapper {
  private git?: API;

  constructor() {
    const gitExtension =
      extensions.getExtension<GitExtension>("vscode.git")?.exports;
    this.git = gitExtension?.getAPI(1);
  }

  /**
   * @returns Repository label
   */
  public async chooseRepository(): Promise<string | null> {
    if (!this.git || this.git.repositories.length === 0) {
      return null;
    }

    const repoNames = this.git.repositories.map((repo) =>
      this.getRepositoryLabel(repo)
    );
    const option = await window.showQuickPick(repoNames, {
      placeHolder: "Choose repository",
    });
    const repository = this.git.repositories.find(
      (repo) => this.getRepositoryLabel(repo) === option
    ) as Repository;

    return this.getRepositoryLabel(repository);
  }

  /**
   * @returns Branch label
   */
  public async getCurrentBranch(): Promise<string | null> {
    if (!this.git || this.git.repositories.length === 0) {
      return null;
    }

    const repository = await this.chooseRepository();
    if (!repository) {
      return null;
    }

    const branch = this.git.repositories.find(
      (repo) => this.getRepositoryLabel(repo) === repository
    )?.state.HEAD?.name;

    return branch ? path.basename(branch) : null;
  }

  private getRepositoryLabel(repository: Repository): string {
    const repositoryRoot = repository.rootUri.path;
    const workspaceFolder = workspace.getWorkspaceFolder(
      Uri.file(repositoryRoot)
    );
    return workspaceFolder?.uri.toString() === repositoryRoot
      ? workspaceFolder.name
      : path.basename(repositoryRoot);
  }
}
