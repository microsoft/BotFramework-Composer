// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

import { TabExtensionConfig, BotStateTabKey } from '../types';

import { BotStateLogHeader } from './BotStateLogHeader';
import { BotStateLogContent } from './BotStateLogContent';

export const BotStateTabConfig: TabExtensionConfig = {
  key: BotStateTabKey,
  description: () => formatMessage('Bot state log'),
  HeaderWidget: BotStateLogHeader,
  ContentWidget: BotStateLogContent,
};
