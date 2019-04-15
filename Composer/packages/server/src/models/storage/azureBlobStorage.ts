import { IFileStorage, Stat, StorageConnection } from './interface';

export class AzureBlobStorage implements IFileStorage {
  constructor(conn: StorageConnection) {
    throw new Error('Method not implemented.');
  }

  statSync(path: string): Stat {
    throw new Error('Method not implemented.');
  }

  readFileSync(path: string): string {
    throw new Error('Method not implemented.');
  }
  readDirSync(path: string): string[] {
    throw new Error('Method not implemented.');
  }
  existSync(path: string): boolean {
    throw new Error('Method not implemented.');
  }
  writeFileSync(path: string, content: any): void {
    throw new Error('Method not implemented.');
  }
}
