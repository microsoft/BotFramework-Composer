// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/types';

export interface MenuOptions {
  label?: string;
  group?: string;
  submenu?: string[] | false;
}

// A $kind may be referenced by have multiple menu items. In this case, its typed with MenuOptions[].
export type MenuUISchema = { [key in SDKKinds]?: MenuOptions | MenuOptions[] };
