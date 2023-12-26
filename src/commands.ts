import { Disposable, commands } from "vscode";
import { NoteManager } from "./noteManager";

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

  constructor(private noteManager: NoteManager) {
    this.disposables = Commands.map(({ commandId, key, method }) => {
      const command = this.createCommand(commandId, key, method);

      return commands.registerCommand(commandId, command);
    });
  }

  @command("dev-notepad.openGlobalNotes")
  async openGlobalNotes(): Promise<void> {
    await this.noteManager.openGlobalNotes();
  }

  @command("dev-notepad.openWorkspaceNotes")
  async openWorkspaceNotes(): Promise<void> {
    await this.noteManager.openWorkspaceNotes();
  }

  @command("dev-notepad.openRepoNotes")
  async openRepoNotes(): Promise<void> {
    await this.noteManager.openRepoNotes();
  }

  @command("dev-notepad.openBranchNotes")
  async openBranchNotes(): Promise<void> {
    await this.noteManager.openBranchNotes();
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
