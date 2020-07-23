// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/shared';

export interface MenuOptions {
  label?: string;
  group?: string;
  submenu?: string[] | false;
}

export type MenuUISchema = { [key in SDKKinds]?: MenuOptions };
