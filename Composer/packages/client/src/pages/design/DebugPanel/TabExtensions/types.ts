// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FC } from 'react';

export interface TabExtensionConfig {
  /** Unique name of this extension. */
  key: string;

  /** Description of this extension. */
  description?: string;

  /** Tab header component used when debug panel is collapsed.
   *  If it's typed with string, shows a plain text as the tab header.
   *  When Debug Panel is collapsed, tab headers are wrapped in a div.
   * */
  headerCollapsed: FC | string;

  /** Tab header component used when debug panel is expanded.
   *  If it's typed with string, shows a plain text as the tab header.
   *  When Debug Panel is collapsed, tab headers are wrapped in a PivotItem.
   * */
  headerExpanded: FC | string;

  /** Tab content component used when debug panel is expanded. */
  content: FC;

  /** Extra component displayed on the right side of tab header. */
  toolbar?: FC;
}
