import fs from "fs";
import path from "path";
import { Uri } from "vscode";

export class FileUtil {
  public static exists(uri: Uri): boolean {
    return fs.existsSync(uri.fsPath);
  }

  public static createParentDir(uri: Uri): void {
    const dirName = path.dirname(uri.fsPath);
    fs.mkdirSync(dirName, { recursive: true });
  }

  public static createFile(uri: Uri, placeholder: string): void {
    fs.writeFileSync(uri.fsPath, placeholder, { flag: "w" });
  }

  public static createFileIfMissing(uri: Uri, placeholder: string): void {
    if (!this.exists(uri)) {
      this.createFile(uri, placeholder);
    }
  }
}
