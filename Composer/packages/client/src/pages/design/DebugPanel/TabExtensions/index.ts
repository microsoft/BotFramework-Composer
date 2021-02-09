// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TabExtensionConfig } from './types';
import { DiagnoticsTabConfig } from './DiagnosticsTab';
import { WebchatLogTabConfig } from './WebchatLog';

const implementedTabExtensions: TabExtensionConfig[] = [DiagnoticsTabConfig, WebchatLogTabConfig];

export default implementedTabExtensions;
