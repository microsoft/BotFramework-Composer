// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TabExtensionConfig } from '../types';

import { DiagnosticsContent } from './DiagnosticsTabContent';
import { DiagnosticsHeaderCollapsed, DiagnosticsHeaderExpanded } from './DiagnosticsTabHeader';

export const DiagnoticsTabConfig: TabExtensionConfig = {
  key: 'DiagnosticsTab',
  description: 'Diagnostics tab which shows errors and warnings.',
  headerCollapsed: DiagnosticsHeaderCollapsed,
  headerExpanded: DiagnosticsHeaderExpanded,
  content: DiagnosticsContent,
};
