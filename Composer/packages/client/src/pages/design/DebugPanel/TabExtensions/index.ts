// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TabExtensionConfig } from './types';
import { DiagnosticsTabConfig } from './DiagnosticsTab';
import { WebchatLogTabConfig } from './WebchatLog';

const implementedDebugExtensions: TabExtensionConfig[] = [DiagnosticsTabConfig, WebchatLogTabConfig];

export default implementedDebugExtensions;
