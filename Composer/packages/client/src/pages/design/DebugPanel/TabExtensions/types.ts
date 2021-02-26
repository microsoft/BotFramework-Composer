// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FC } from 'react';

export const DiagnosticsTabKey = 'Diagnostics';
export const WebChatInspectorTabKey = 'WebChatInspector';

export type DebugDrawerKeys = typeof DiagnosticsTabKey | typeof WebChatInspectorTabKey;

export type DebugPanelTabHeaderProps = {
  isActive: boolean;
};

export type DebugPanelProps = {
  expanded: boolean;
  onToggleExpansion: (expanded: boolean) => void;
};

export interface TabExtensionConfig {
  /** Unique name of this extension. */
  key: DebugDrawerKeys;

  /** Description of this extension. */
  description?: string;

  /** Tab header component. If it's typed with string, shows a plain text as the tab header. */
  HeaderWidget: FC<DebugPanelTabHeaderProps> | string;

  /** Tab content component used when debug panel is expanded. */
  ContentWidget: FC;

  /** Extra component displayed on the right side of Composer command bar. */
  ToolbarWidget?: FC;
}
