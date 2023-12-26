import { ExtensionContext, Uri, window } from "vscode";
import { GitWrapper } from "./gitWrapper";
import { FileUtil } from "./fileUtil";

export class NoteManager {
  private git: GitWrapper;

  constructor(private context: ExtensionContext) {
    this.git = new GitWrapper();
  }

  public async openGlobalNotes(): Promise<void> {
    const { globalStorageUri } = this.context;

    const newFile = Uri.joinPath(globalStorageUri, "scratchpad.md");
    FileUtil.createParentDir(newFile);

    FileUtil.createFileIfMissing(newFile, this.getNotePlaceholder());

    await window.showTextDocument(newFile, { preserveFocus: true });
  }

  public async openWorkspaceNotes(): Promise<void> {
    const { storageUri } = this.context;
    if (storageUri === undefined) {
      window.showErrorMessage("Cannot open workspace notes");
      return;
    }

    const newFile = Uri.joinPath(storageUri, "scratchpad.md");
    FileUtil.createParentDir(newFile);

    FileUtil.createFileIfMissing(newFile, this.getNotePlaceholder());

    await window.showTextDocument(newFile, { preserveFocus: true });
  }

  public async openRepoNotes(): Promise<void> {
    const repo = await this.git.chooseRepository();
    if (!repo) {
      window.showErrorMessage("Cannot open repo notes");
      return;
    }

    const { globalStorageUri } = this.context;
    const newFile = Uri.joinPath(globalStorageUri, `${repo}.md`);
    FileUtil.createParentDir(newFile);

    FileUtil.createFileIfMissing(newFile, this.getNotePlaceholder());

    await window.showTextDocument(newFile, { preserveFocus: true });
  }

  public async openBranchNotes(): Promise<void> {
    const currentBranch = await this.git.getCurrentBranch();
    if (!currentBranch) {
      window.showErrorMessage("Cannot open branch notes");
      return;
    }

    const { globalStorageUri } = this.context;
    const newFile = Uri.joinPath(globalStorageUri, `${currentBranch}.md`);
    FileUtil.createParentDir(newFile);

    FileUtil.createFileIfMissing(newFile, this.getNotePlaceholder());

    await window.showTextDocument(newFile, { preserveFocus: true });
  }

  private getNotePlaceholder(): string {
    return `# ${new Date().toLocaleString()}\n\n`;
  }
}
