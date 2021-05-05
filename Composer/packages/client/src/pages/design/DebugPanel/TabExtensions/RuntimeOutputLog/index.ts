// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

import { TabExtensionConfig, RuntimeLogTabKey } from '../types';

import { OutputsTabContent } from './OutputTabContent';
import { OutputsTabLogHeader } from './OutputTabLogHeader';

export const RuntimeOutputTabConfig: TabExtensionConfig = {
  key: RuntimeLogTabKey,
  description: () => formatMessage('Runtime log.'),
  HeaderWidget: OutputsTabLogHeader,
  ContentWidget: OutputsTabContent,
};
