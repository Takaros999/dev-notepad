import {
  ExtensionContext,
  Disposable,
  Uri,
  window,
  commands,
  workspace,
} from "vscode";
import fs from "fs";
import { API, GitExtension, Repository } from "./git";
import path from "path";

interface NotesCommand {
  commandId: string;
  key: string;
  method: Function;
}

const Commands: NotesCommand[] = [];

function command(commandId: string): Function {
  return (_target: any, key: string, descriptor: any) => {
    if (!(typeof descriptor.value === "function")) {
      throw new Error("not supported");
    }
    Commands.push({ commandId, key, method: descriptor.value });
  };
}

export class CommandCenter {
  private disposables: Disposable[];

  constructor(private git: API, private context: ExtensionContext) {
    this.disposables = Commands.map(({ commandId, key, method }) => {
      const command = this.createCommand(commandId, key, method);

      return commands.registerCommand(commandId, command);
    });
  }

  @command("dev-notepad.openGlobalNotes")
  async openGlobalNotes(): Promise<void> {
    // Create a new file in the storageUri
    const { globalStorageUri } = this.context;
    fs.mkdirSync(globalStorageUri.fsPath, { recursive: true });
    const newFile = Uri.joinPath(globalStorageUri, "scratchpad.md");
    if (!fs.existsSync(newFile.fsPath)) {
      fs.writeFileSync(newFile.fsPath, "Placeholder", { flag: "w" });
    }

    // Open the new file
    await window.showTextDocument(newFile, { preserveFocus: true });

    window.showInformationMessage("Global notes opened!");
  }

  @command("dev-notepad.openWorkspaceNotes")
  async openWorkspaceNotes(): Promise<void> {
    const { storageUri } = this.context;
    if (storageUri === undefined) {
      this.showUnvailableErrorMessage("workspace");
      return;
    }

    // Create a new file in the storageUri
    fs.mkdirSync(storageUri.fsPath, { recursive: true });
    const newFile = Uri.joinPath(storageUri, "scratchpad.md");
    if (!fs.existsSync(newFile.fsPath)) {
      fs.writeFileSync(newFile.fsPath, "Placeholder", { flag: "w" });
    }

    // Open the new file
    await window.showTextDocument(newFile, { preserveFocus: true });

    window.showInformationMessage("Workspace notes opened!");
  }
  @command("dev-notepad.openRepoNotes")
  async openRepoNotes(): Promise<void> {
    const repo = await this.chooseRepository();

    const currentBranch = repo.state.HEAD;
    if (currentBranch === undefined) {
      window.showInformationMessage(`No branch selected in the workspace!`);
      return;
    }

    // Create a new file in the storageUri
    const { globalStorageUri } = this.context;
    fs.mkdirSync(globalStorageUri.fsPath, { recursive: true });
    const newFile = Uri.joinPath(
      globalStorageUri,
      `${this.getRepositoryLabel(repo.rootUri.path)}-scratchpad.md`
    );
    if (!fs.existsSync(newFile.fsPath)) {
      fs.writeFileSync(newFile.fsPath, "Placeholder", { flag: "w" });
    }

    // Open the new file
    await window.showTextDocument(newFile, { preserveFocus: true });
  }

  @command("dev-notepad.openBranchNotes")
  async openBranchNotes(): Promise<void> {
    const repo = await this.chooseRepository();

    const currentBranch = repo.state.HEAD;
    if (currentBranch === undefined) {
      window.showInformationMessage(`No branch selected in the workspace!`);
      return;
    }

    // Create a new file in the storageUri
    const { globalStorageUri } = this.context;
    fs.mkdirSync(globalStorageUri.fsPath, { recursive: true });
    const newFile = Uri.joinPath(
      globalStorageUri,
      `${this.getRepositoryLabel(repo.rootUri.path)}-${currentBranch.name
        ?.split("/")
        .slice(-1)}-scratchpad.md`
    );
    if (!fs.existsSync(newFile.fsPath)) {
      fs.writeFileSync(newFile.fsPath, "Placeholder", { flag: "w" });
    }

    // Open the new file
    await window.showTextDocument(newFile, { preserveFocus: true });
  }

  private getRepositoryLabel(repositoryRoot: string): string {
    const workspaceFolder = workspace.getWorkspaceFolder(
      Uri.file(repositoryRoot)
    );
    return workspaceFolder?.uri.toString() === repositoryRoot
      ? workspaceFolder.name
      : path.basename(repositoryRoot);
  }

  private chooseRepository = async (): Promise<Repository> => {
    if (this.git.repositories.length === 1) {
      return this.git.repositories[0];
    }

    const repoNames = this.git.repositories.map((repo) =>
      this.getRepositoryLabel(repo.rootUri.path)
    );
    const option = await window.showQuickPick(repoNames, {
      placeHolder: "Choose repository",
    });
    return this.git.repositories.find(
      (repo) => this.getRepositoryLabel(repo.rootUri.path) === option
    ) as Repository;
  };

  private showUnvailableErrorMessage(
    code: "global" | "workspace" | "git"
  ): void {
    let message = "";
    switch (code) {
      case "global":
        message = "No global storage has been set!";
        break;
      case "workspace":
        message = "No workspace or folder has been opened!";
        break;
      case "git":
        message = "Error with git!";
        break;
    }

    window.showErrorMessage(message);
  }

  private createCommand(
    id: string,
    key: string,
    method: Function
  ): (...args: any[]) => any {
    const result = (...args: any[]) => {
      let result: Promise<any>;

      result = Promise.resolve(method.apply(this, args));

      //   this.telemetryReporter.sendTelemetryEvent("", { command: id });

      return result.catch((err) => {
        console.log(err);
      });
    };

    // patch this object, so people can call methods directly
    (this as any)[key] = result;

    return result;
  }

  dispose(): void {
    this.disposables.forEach((d) => d.dispose());
  }
}
