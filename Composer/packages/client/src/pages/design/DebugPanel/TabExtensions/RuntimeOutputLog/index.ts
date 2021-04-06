// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

import { TabExtensionConfig, RuntimeLogTabKey } from '../types';

import { OutputsTabContent } from './OutputsTabContent';
import { OutputsTabLogHeader } from './OutputsTabLogHeader';

export const RuntimeOutputTabConfig: TabExtensionConfig = {
  key: RuntimeLogTabKey,
  description: () => formatMessage('Runtime log.'),
  HeaderWidget: OutputsTabLogHeader,
  ContentWidget: OutputsTabContent,
};
