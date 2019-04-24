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
  relativePath: string;
}

export interface Dialog {
  id: number;
  name: string;
  content: any;
  path: string;
}

export interface LGTemplate {
  id: number;
  name: string;
  type: string;
  // for now parameters is not been used because it shown up with the name.
  parameters: string[];
  content: any;
  absolutePath: string;
  comments: string;
}
