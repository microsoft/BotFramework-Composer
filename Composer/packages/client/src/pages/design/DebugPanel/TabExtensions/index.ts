// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TabExtensionConfig } from './types';
import { DiagnosticsTabConfig } from './DiagnosticsTab';
import { WebChatLogTabConfig } from './WebChatLog';

const implementedDebugExtensions: TabExtensionConfig[] = [DiagnosticsTabConfig, WebChatLogTabConfig];

export default implementedDebugExtensions;
