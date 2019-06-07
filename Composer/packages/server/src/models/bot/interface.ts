export interface LocationRef {
  storageId: string;
  path: string;
}

export interface BotProjectFileContent {
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
  relativePath: string;
}

export interface LGTemplate {
  name: string;
  body: string;
}

export interface LGFile {
  id: string;
  relativePath: string;
  content: any;
}

export interface LUFile {
  id: string;
  relativePath: string;
  content: string;
}
