// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TabExtensionConfig } from './types';
import { DiagnoticsTabConfig } from './DiagnosticsTab';
import { WebchatLogTabConfig } from './WebchatLog';

const implementedDebugExtensions: TabExtensionConfig[] = [DiagnoticsTabConfig, WebchatLogTabConfig];

export default implementedDebugExtensions;
