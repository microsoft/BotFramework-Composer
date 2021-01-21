// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ILuisConfig, IQnAConfig } from './settings';

export type BuildResource = { id: string; isEmpty: boolean };

export interface IBuildConfig {
  luisConfig: ILuisConfig;
  qnaConfig: IQnAConfig;
  luResource: BuildResource[];
  qnaResource: BuildResource[];
}
export interface LocationRef {
  storageId: string;
  path: string;
}

export type ISettingManager = {
  get(obfuscate?: boolean): Promise<any | null>;
  set(settings: any): Promise<void>;
  getFileName: () => string;
};
