export interface LocationRef {
  storageId: string;
  path: string;
}

export interface FileInfo {
  name: string;
  content: any;
  path: string;
  relativePath: string;
}

export interface Dialog {
  id: string;
  isRoot: boolean;
  displayName: string;
  content: { [key: string]: any };
  diagnostics: string[];
  lgFile: string;
  luFile: string;
  luIntents: string[];
  lgTemplates: string[];
  relativePath: string;
}

export interface LGTemplate {
  name: string;
  body: string;
}

export interface LGFile {
  id: string;
  relativePath: string;
  content: string;
  diagnostics: any[]; // LGParser output, TODO:
}

export interface LUFile {
  diagnostics: any[]; // ludown parser output
  id: string;
  relativePath: string;
  content: string;
  parsedContent: { [key: string]: any };
}

export enum FileState {
  UPDATED,
  LATEST,
}

export interface ILuisSettings {
  luis: {
    [key: string]: string;
    endpoint: string;
    endpointKey: string;
  };
  status: {
    [key: string]: {
      version: string | undefined;
      checksum: string;
      status: FileState;
    };
  };
}

export interface ILuisConfig {
  name: string;
  authoringKey: string;
  authoringRegion: string | 'westus';
  defaultLanguage: string | 'en-us';
  environment: string | 'composer';
}
