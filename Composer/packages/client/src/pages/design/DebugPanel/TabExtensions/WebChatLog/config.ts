// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

import { TabExtensionConfig, WebChatInspectorTabKey } from '../types';

import { WebChatLogContent } from './WebChatLogContent';
import { WebChatLogItemHeader } from './WebChatLogItemHeader';

export const WebChatLogTabConfig: TabExtensionConfig = {
  key: WebChatInspectorTabKey,
  description: () => formatMessage('Webchat log.'),
  HeaderWidget: WebChatLogItemHeader,
  ContentWidget: WebChatLogContent,
};
