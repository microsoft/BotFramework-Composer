// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TabExtensionConfig } from '../types';

import { WebchatLogContent } from './WebchatLogContent';

export const WebchatLogTabConfig: TabExtensionConfig = {
  key: 'WebchatLog',
  description: 'Webchat log.',
  HeaderWidget: 'Webchat Inspector',
  ContentWidget: WebchatLogContent,
};
