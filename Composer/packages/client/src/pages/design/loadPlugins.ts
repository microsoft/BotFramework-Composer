// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { PluginConfig } from '@botframework-ui/extension';

import config from '../../.composer.config';

const { plugins = [] } = config;

export default plugins as PluginConfig[];
