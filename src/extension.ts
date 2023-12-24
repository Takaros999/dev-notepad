// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import fs from "fs";
import { API, GitExtension, Repository } from "./git";
import path from "path";

function getRepositoryLabel(repositoryRoot: string): string {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(
    vscode.Uri.file(repositoryRoot)
  );
  return workspaceFolder?.uri.toString() === repositoryRoot
    ? workspaceFolder.name
    : path.basename(repositoryRoot);
}

const chooseRepository = async (gitApi: API): Promise<Repository> => {
  const repoNames = gitApi.repositories.map((repo) =>
    getRepositoryLabel(repo.rootUri.path)
  );
  const option = await vscode.window.showQuickPick(repoNames, {
    placeHolder: "Choose repository",
  });
  return gitApi.repositories.find(
    (repo) => getRepositoryLabel(repo.rootUri.path) === option
  ) as Repository;
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "dev-notepad" is now active!');

  const showUnvailableErrorMessage = () => {
    vscode.window.showInformationMessage(
      "No workspace or folder has been opened!"
    );
  };
  const showGitErrorMessage = () => {
    vscode.window.showInformationMessage("Error with git!");
  };

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let openGlobalNotesDisposable = vscode.commands.registerCommand(
    "dev-notepad.openGlobalNotes",
    async () => {
      // Create a new file in the storageUri
      fs.mkdirSync(context.globalStorageUri.fsPath, { recursive: true });
      const newFile = vscode.Uri.joinPath(
        context.globalStorageUri,
        "scratchpad.md"
      );
      if (!fs.existsSync(newFile.fsPath)) {
        fs.writeFileSync(newFile.fsPath, "Placeholder", { flag: "w" });
      }

      // Open the new file
      await vscode.window.showTextDocument(newFile, { preserveFocus: true });

      vscode.window.showInformationMessage("Global notes opened!");
    }
  );

  let openWorkspaceNotes = vscode.commands.registerCommand(
    "dev-notepad.openWorkspaceNotes",
    async () => {
      if (context.storageUri === undefined) {
        showUnvailableErrorMessage();
        return;
      }

      // Create a new file in the storageUri
      fs.mkdirSync(context.storageUri.fsPath, { recursive: true });
      const newFile = vscode.Uri.joinPath(context.storageUri, "scratchpad.md");
      if (!fs.existsSync(newFile.fsPath)) {
        fs.writeFileSync(newFile.fsPath, "Placeholder", { flag: "w" });
      }

      // Open the new file
      await vscode.window.showTextDocument(newFile, { preserveFocus: true });

      vscode.window.showInformationMessage("Workspace notes opened!");
    }
  );

  let openRepoNotes = vscode.commands.registerCommand(
    "dev-notepad.openRepoNotes",
    async () => {
      try {
        console.log("Opening repo notes");
        const gitExtension =
          vscode.extensions.getExtension<GitExtension>("vscode.git")?.exports;
        const git = gitExtension?.getAPI(1);
        if (!git) {
          showGitErrorMessage();
          return;
        }

        if (git.repositories.length === 0) {
          vscode.window.showInformationMessage(
            `Not git repositories found in the workspace!`
          );
          return;
        }
        const repo = await chooseRepository(git);

        const currentBranch = repo.state.HEAD;
        if (currentBranch === undefined) {
          vscode.window.showInformationMessage(
            `No branch selected in the workspace!`
          );
          return;
        }

        // Create a new file in the storageUri
        if (context.storageUri === undefined) {
          showUnvailableErrorMessage();
          return;
        }
        fs.mkdirSync(context.storageUri.fsPath, { recursive: true });
        const newFile = vscode.Uri.joinPath(
          context.storageUri,
          `${currentBranch.name?.split("/").slice(-1)}-scratchpad.md`
        );
        if (!fs.existsSync(newFile.fsPath)) {
          fs.writeFileSync(newFile.fsPath, "Placeholder", { flag: "w" });
        }

        // Open the new file
        await vscode.window.showTextDocument(newFile, { preserveFocus: true });
      } catch (error) {
        console.log(error);
        vscode.window.showInformationMessage(`Repo notes opened! ${error}}`);
      }
    }
  );

  let openBranchNotes = vscode.commands.registerCommand(
    "dev-notepad.openBranchNotes",
    async () => {
      try {
        console.log("Opening repo notes");
        const gitExtension =
          vscode.extensions.getExtension<GitExtension>("vscode.git")?.exports;
        const git = gitExtension?.getAPI(1);
        if (!git) {
          showGitErrorMessage();
          return;
        }

        if (git.repositories.length === 0) {
          vscode.window.showInformationMessage(
            `Not git repositories found in the workspace!`
          );
          return;
        }
        const repo = await chooseRepository(git);
        const currentBranch = repo.state.HEAD;
        if (currentBranch === undefined) {
          vscode.window.showInformationMessage(
            `No branch selected in the workspace!`
          );
          return;
        }

        // Create a new file in the storageUri
        if (context.storageUri === undefined) {
          showUnvailableErrorMessage();
          return;
        }
        fs.mkdirSync(context.storageUri.fsPath, { recursive: true });
        const newFile = vscode.Uri.joinPath(
          context.storageUri,
          `${currentBranch.name?.split("/").slice(-1)}-scratchpad.md`
        );
        if (!fs.existsSync(newFile.fsPath)) {
          fs.writeFileSync(newFile.fsPath, "Placeholder", { flag: "w" });
        }

        // Open the new file
        await vscode.window.showTextDocument(newFile, { preserveFocus: true });
      } catch (error) {
        console.log(error);
        vscode.window.showInformationMessage(`Repo notes opened! ${error}}`);
      }
    }
  );

  context.subscriptions.push(
    ...[
      openGlobalNotesDisposable,
      openWorkspaceNotes,
      openRepoNotes,
      openBranchNotes,
    ]
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
