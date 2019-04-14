export interface BotProjectRef {
  storageId: string;
  path: string;
}

export interface BotProjectFileContent {
  files: string[];
  services: string[];
  entry: string;
}

export interface FileInfo {
  name: string;
  content: any;
  path: string;
  dir: string;
  relativePath: string;
}
