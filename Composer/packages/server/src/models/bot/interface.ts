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
  referredDialogs: string[];
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
  lastUpdateTime: number;
  lastPublishTime: number;
  [key: string]: any;
}

export interface ILuisSettings {
  luis: {
    [key: string]: string;
    endpoint: string;
    endpointKey: string;
  };
}

export interface ILuisStatus {
  [key: string]: {
    version?: string | undefined;
    lastUpdateTime: number;
    lastPublishTime: number;
  };
}

export interface ILuisConfig {
  name: string;
  authoringKey: string;
  authoringRegion: string | 'westus';
  defaultLanguage: string | 'en-us';
  environment: string | 'composer';
}

export interface IOperationLUFile {
  diagnostics?: any[]; // ludown parser output
  relativePath?: string;
  content?: string;
  parsedContent?: { [key: string]: any };
  lastUpdateTime?: number;
  lastPublishTime?: number;
  [key: string]: any;
}

export interface ILuisStatusOperation {
  [key: string]: IOperationLUFile;
}
