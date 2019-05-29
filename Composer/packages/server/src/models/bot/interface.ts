export interface LocationRef {
  storageId: string;
  path: string;
}

export interface BotProjectFileContent {
  files: string[];
  services: string[];
  entry: string;
  schemas?: {
    editor?: string;
    sdk?: string;
  };
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
  body: string;
}

export interface LGFile {
  id: string;
  absolutePath: string;
  content: any;
}

export interface LUFile {
  id: string;
  absolutePath: string;
  // templates: Array;
  content: any;
}
