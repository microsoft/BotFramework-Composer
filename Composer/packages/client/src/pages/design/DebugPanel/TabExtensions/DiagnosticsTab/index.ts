// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TabExtensionConfig } from '../types';

import { DiagnosticsContent } from './DiagnosticsContent';
import { DiagnosticsHeader } from './DiagnosticsHeader';

export const DiagnoticsTabConfig: TabExtensionConfig = {
  key: 'DiagnosticsTab',
  description: 'Diagnostics tab which shows errors and warnings.',
  headerCollapsed: DiagnosticsHeader,
  headerExpanded: DiagnosticsHeader,
  content: DiagnosticsContent,
};
