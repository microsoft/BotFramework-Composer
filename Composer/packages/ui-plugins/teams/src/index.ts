// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension-client';

import TeamsActionUISchema from './actions';
import TeamsTriggerUISchema from './triggers';

const teamsConfig: PluginConfig = {
  uiSchema: {
    ...TeamsActionUISchema,
    ...TeamsTriggerUISchema,
  },
};

export default teamsConfig;
