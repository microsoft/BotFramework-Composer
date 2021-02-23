// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WebChatInspectorTabKey } from '../../constants';
import { TabExtensionConfig } from '../types';

import { WebchatLogContent } from './WebchatLogContent';
import { WebchatLogItemHeader } from './WebchatLogItemHeader';

export const WebchatLogTabConfig: TabExtensionConfig = {
  key: WebChatInspectorTabKey,
  description: 'Webchat log.',
  HeaderWidget: WebchatLogItemHeader,
  ContentWidget: WebchatLogContent,
};
