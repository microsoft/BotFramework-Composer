import fs from 'fs';
import path from 'path';

interface IFileInfo {
  [key: string]: any;
}

export class FileStorage {
  private _fileInfo: IFileInfo;
  private _lastFlushedSerializedFileInfo: string | null = null;
  private path: string;
  private onError: (error: Error) => void;

  constructor(path: string, onError: (error: Error) => void) {
    this.path = path;
    this.onError = onError;
    this._fileInfo = this.loadSync();
  }

  private get fileInfo(): IFileInfo {
    if (!this._fileInfo) {
      this._fileInfo = this.loadSync();
    }

    return this._fileInfo;
  }

  private loadSync(): object {
    try {
      if (fs.existsSync(this.path)) {
        this._lastFlushedSerializedFileInfo = fs.readFileSync(this.path, 'utf-8');
      } else {
        this._lastFlushedSerializedFileInfo = fs.readFileSync(path.resolve('storage.example.json'), 'utf-8');
      }

      return JSON.parse(this._lastFlushedSerializedFileInfo);
    } catch (error) {
      this.onError(error);
    }

    return {};
  }

  getItem<T>(key: string, defaultValue?: T): T | any {
    const res = this.fileInfo[key];

    if (typeof res === 'undefined') {
      return defaultValue;
    }

    return res;
  }

  setItem(key: string, data: any): void {
    if (typeof data === 'undefined' || data === null) {
      return this.removeItem(key);
    }

    if (this.fileInfo[key] === data) {
      return;
    }

    this.fileInfo[key] = data;
    this.saveSync();
  }

  removeItem(key: string): void {
    const value = this.fileInfo[key];
    if (typeof value !== 'undefined') {
      this.fileInfo[key] = undefined;
      this.saveSync();
    }
  }

  private saveSync(): void {
    const serializedFileInfo = JSON.stringify(this._fileInfo, null, 4);

    if (serializedFileInfo === this._lastFlushedSerializedFileInfo) {
      return;
    }
    this._lastFlushedSerializedFileInfo = serializedFileInfo;

    const fd = fs.openSync(this.path, 'w');

    try {
      fs.writeFileSync(fd, serializedFileInfo);

      fs.fdatasyncSync(fd);
    } catch (error) {
      this.onError(error);
    } finally {
      fs.closeSync(fd);
    }
  }
}
