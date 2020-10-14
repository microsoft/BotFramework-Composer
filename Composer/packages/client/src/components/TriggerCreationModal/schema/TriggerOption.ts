// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface TriggerUIOption {
  label: string;
  submenu?: TriggerSubmenuInfo | string | false;
}

export interface TriggerSubmenuInfo {
  label: string;
  prompt?: string;
  placeholder?: string;
}
