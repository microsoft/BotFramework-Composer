// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TabExtensionConfig } from './types';
import { DiagnosticsTabConfig } from './DiagnosticsTab';
import { WebChatLogTabConfig } from './WebchatLog/config';
import { RuntimeOutputTabConfig } from './RuntimeOutputLog';

const implementedDebugExtensions: TabExtensionConfig[] = [
  DiagnosticsTabConfig,
  WebChatLogTabConfig,
  RuntimeOutputTabConfig,
];

export default implementedDebugExtensions;
