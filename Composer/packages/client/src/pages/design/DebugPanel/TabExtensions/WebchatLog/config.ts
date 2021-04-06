// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

import { TabExtensionConfig, WebChatInspectorTabKey } from '../types';

import { WebchatLogContent } from './WebchatLogContent';
import { WebChatLogItemHeader } from './WebchatLogItemHeader';

export const WebchatLogTabConfig: TabExtensionConfig = {
  key: WebChatInspectorTabKey,
  description: () => formatMessage('Webchat log.'),
  HeaderWidget: WebChatLogItemHeader,
  ContentWidget: WebchatLogContent,
};
