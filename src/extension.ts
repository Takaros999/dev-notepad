// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import fs from "fs";

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

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "dev-notepad.helloWorld",
    async () => {
      if (context.storageUri === undefined) {
        showUnvailableErrorMessage();
        return;
      }

      // Create a new file in the storageUri
      fs.mkdirSync(context.storageUri.fsPath, { recursive: true });
      console.log(context.storageUri.fsPath);
      const newFile = vscode.Uri.joinPath(context.storageUri, "scratchpad.md");
      fs.writeFileSync(newFile.fsPath, "Placeholder", { flag: "w" });

      // Open the new file
      await vscode.window.showTextDocument(newFile, { preserveFocus: true });

      vscode.window.showInformationMessage("Hello World from Dev Notepad!2");
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
