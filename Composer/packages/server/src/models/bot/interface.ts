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
  name: string;
  type: string;
  parameters: string[];
  content: any;
  comments: string;
}

export interface LGFile {
  id: string;
  absolutePath: string;
  templates: LGTemplate[];
}
