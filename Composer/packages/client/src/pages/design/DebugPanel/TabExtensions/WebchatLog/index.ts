// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TabExtensionConfig } from '../types';

import { WebchatLogContent } from './WebchatLogContent';
import { WebchatLogItemHeader } from './WebchatLogItemHeader';

export const WebchatLogTabConfig: TabExtensionConfig = {
  key: 'WebchatLog',
  description: 'Webchat log.',
  HeaderWidget: WebchatLogItemHeader,
  ContentWidget: WebchatLogContent,
};
