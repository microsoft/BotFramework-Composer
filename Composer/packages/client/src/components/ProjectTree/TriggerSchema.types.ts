// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/shared';

export type TriggerUISchema = { [$kind in SDKKinds]: TriggerOption };

export interface TriggerOption {
  /** Displayed option name. e.g. "Intent recognized" */
  label: string;

  /** Describes parent path(s) to reach this trigger option.
   *    1. Submenu[] - A list of Submenu needs to go through from root to this option
   *    2. Submenu - Equivalent to a Submenu[] with 1 element
   *    3. string - Equivalent to a Submenu whose 'label' field equals to the string
   *    2. false - Trigger is at root level
   */
  submenu: Submenu[] | Submenu | string | false;
}

interface Submenu {
  label: string;
  prompt?: string;
}
