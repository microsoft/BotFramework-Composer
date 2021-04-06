// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TabExtensionConfig } from './types';
import { DiagnosticsTabConfig } from './DiagnosticsTab';
import { WebchatLogTabConfig } from './WebchatLog/config';
import { RuntimeOutputTabConfig } from './RuntimeOutputLog';

const implementedDebugExtensions: TabExtensionConfig[] = [
  DiagnosticsTabConfig,
  WebchatLogTabConfig,
  RuntimeOutputTabConfig,
];

export default implementedDebugExtensions;
