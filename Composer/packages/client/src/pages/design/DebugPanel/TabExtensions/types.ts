// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FC } from 'react';

export interface TabExtensionConfig {
  /** Unique name of this extension. */
  key: string;

  /** Description of this extension. */
  description?: string;

  /** Tab header component used when debug panel is collapsed. Shows a plain text when it's a string. */
  headerCollapsed: FC | string;

  /** Tab header component used when debug panel is expanded. Shows a plain text when it's a string. */
  headerExpanded: FC | string;

  /** Tab content component used when debug panel is expanded. */
  content: FC;
}
