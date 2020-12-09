// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ILuisConfig, IQnAConfig } from './settings';

export type Resource = { id: string; isEmpty: boolean };

export interface IBuildConfig {
  luisConfig: ILuisConfig;
  qnaConfig: IQnAConfig;
  luResource: Resource[];
  qnaResource: Resource[];
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
