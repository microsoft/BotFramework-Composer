// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TabExtensionConfig } from './types';
import { DiagnosticsTabConfig } from './DiagnosticsTab';
import { WebChatLogTabConfig } from './WebChatLog/config';
import { RuntimeOutputTabConfig } from './RuntimeOutputLog';
import { WatchTabConfig } from './WatchTab/config';

const implementedDebugExtensions: TabExtensionConfig[] = [
  DiagnosticsTabConfig,
  WebChatLogTabConfig,
  RuntimeOutputTabConfig,
  WatchTabConfig,
];

export default implementedDebugExtensions;
