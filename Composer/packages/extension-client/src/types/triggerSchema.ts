// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@botframework-composer/types';

export interface TriggerUIOption {
  label: string;
  order?: number;
  submenu?: TriggerSubmenuInfo | string | false;
}

export interface TriggerSubmenuInfo {
  label: string;
  prompt?: string;
  placeholder?: string;
}

export type TriggerUISchema = { [key in SDKKinds]?: TriggerUIOption };
