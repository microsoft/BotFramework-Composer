// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TabExtensionConfig } from '../types';

import { DiagnosticsContent } from './DiagnosticsTabContent';
import { DiagnosticsHeader } from './DiagnosticsTabHeader';
import { DiagnosticsStatus } from './DiagnosticsStatus';

export const DiagnosticsTabConfig: TabExtensionConfig = {
  key: 'DiagnosticsTab',
  description: 'Diagnostics tab which shows errors and warnings.',
  HeaderWidget: DiagnosticsHeader,
  ContentWidget: DiagnosticsContent,
  ToolbarWidget: DiagnosticsStatus,
};
