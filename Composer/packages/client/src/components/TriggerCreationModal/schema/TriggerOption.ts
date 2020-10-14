// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface TriggerUIOption {
  label: string;
  submenu?: TriggerSubmenuInfo | string | false;
}
export type TriggerUIOptionMap = { [key: string]: TriggerUIOption };

export interface TriggerSubmenuInfo {
  label: string;
  prompt?: string;
  placeholder?: string;
}
