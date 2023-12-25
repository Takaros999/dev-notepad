import { Disposable, ExtensionContext, extensions, window } from "vscode";
import { CommandCenter } from "./commands";
import { GitExtension } from "./git";

const showGitErrorMessage = () => {
  window.showInformationMessage("Error with git!");
};

export function activate(context: ExtensionContext) {
  const disposables: Disposable[] = [];
  context.subscriptions.push(
    new Disposable(() => Disposable.from(...disposables).dispose())
  );
  const gitExtension =
    extensions.getExtension<GitExtension>("vscode.git")?.exports;
  const git = gitExtension?.getAPI(1);
  if (!git) {
    showGitErrorMessage();
    return;
  }

  const cc = new CommandCenter(git, context);

  disposables.push(cc);
}

export function deactivate() {}
