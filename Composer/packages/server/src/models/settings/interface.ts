// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const OBFUSCATED_VALUE = '*****';

export interface ISettingManager {
  get(slot?: string, obfuscate?: boolean): Promise<any | null>;
  set(slot: string, settings: any): Promise<void>;
}
