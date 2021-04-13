// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

import { TabExtensionConfig, DiagnosticsTabKey } from '../types';

import { DiagnosticsContent } from './DiagnosticsTabContent';
import { DiagnosticsHeader } from './DiagnosticsTabHeader';
import { DiagnosticsStatus } from './DiagnosticsStatus';

export const DiagnosticsTabConfig: TabExtensionConfig = {
  key: DiagnosticsTabKey,
  description: () => formatMessage('Diagnostics tab which shows errors and warnings.'),
  HeaderWidget: DiagnosticsHeader,
  ContentWidget: DiagnosticsContent,
  ToolbarWidget: DiagnosticsStatus,
};
