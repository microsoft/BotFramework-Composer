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
}

export enum FileState {
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
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
      state: FileState;
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
