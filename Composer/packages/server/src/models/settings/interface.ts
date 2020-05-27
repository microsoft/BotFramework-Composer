// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const OBFUSCATED_VALUE = '*****';

export interface ISettingManager {
  get(obfuscate?: boolean): Promise<any | null>;
  set(settings: any): Promise<void>;
  getFileName: () => string;
}
