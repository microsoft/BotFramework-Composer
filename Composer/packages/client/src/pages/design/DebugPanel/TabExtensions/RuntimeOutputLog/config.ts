// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

import { TabExtensionConfig, RuntimeLogsTabKey } from '../types';

import { RuntimeOutputLogContent } from './OutputsTabContent';
import { RuntimeOutputLogHeader } from './OutputsLogHeader';

export const RuntimeOutputTabConfig: TabExtensionConfig = {
  key: RuntimeLogsTabKey,
  description: formatMessage('Runtime logs.'),
  HeaderWidget: RuntimeOutputLogHeader,
  ContentWidget: RuntimeOutputLogContent,
};
