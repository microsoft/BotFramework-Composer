// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

import { TabExtensionConfig, WatchTabKey } from '../types';

import { WatchTabHeader } from './WatchTabHeader';
import { WatchTabContent } from './WatchTabContent';

export const WatchTabConfig: TabExtensionConfig = {
  key: WatchTabKey,
  description: () => formatMessage('Watch tab'),
  HeaderWidget: WatchTabHeader,
  ContentWidget: WatchTabContent,
};
