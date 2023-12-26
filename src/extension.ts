import { Disposable, ExtensionContext, window } from "vscode";
import { CommandCenter } from "./commands";
import { NoteManager } from "./noteManager";

const showGitErrorMessage = () => {
  window.showInformationMessage("Error with git!");
};

export function activate(context: ExtensionContext) {
  const disposables: Disposable[] = [];
  context.subscriptions.push(
    new Disposable(() => Disposable.from(...disposables).dispose())
  );

  const noteManager = new NoteManager(context);

  const cc = new CommandCenter(noteManager);

  disposables.push(cc);
}

export function deactivate() {}
