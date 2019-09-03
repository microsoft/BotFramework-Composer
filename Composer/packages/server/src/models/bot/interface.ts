import { Diagnostic as LGDiagnostic } from 'botbuilder-lg';

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
  Name: string;
  Body: string;
  Parameters: string[];
}

export interface LGFile {
  id: string;
  relativePath: string;
  content: string;
  diagnostics: LGDiagnostic[];
  templates: LGTemplate[];
}

export interface LUFile {
  diagnostics: any[]; // ludown parser output
  id: string;
  relativePath: string;
  content: string;
  parsedContent: { [key: string]: any };
  status?: LuisStatus;
  [key: string]: any;
}

export interface ITrigger {
  id: string;
  displayName: string;
  type: string;
  isIntent: boolean;
}

export interface ILuisSettings {
  luis: {
    [key: string]: string;
    endpoint: string;
    endpointKey: string;
  };
}

export interface LuisStatus {
  lastUpdateTime: number;
  lastPublishTime: number;
}

// we will probably also use this interface to consolidate the processing of lu\lg\dialog
export enum FileUpdateType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export interface ILuisConfig {
  name: string;
  authoringKey: string;
  authoringRegion: string | 'westus';
  defaultLanguage: string | 'en-us';
  environment: string | 'composer';
}
