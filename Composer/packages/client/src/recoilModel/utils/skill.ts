// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { generateDesignerId } from '@bfc/shared';

export const createActionFromManifest = (manifestIdentifier) => {
  // get identifier
  return {
    $kind: 'Microsoft.BeginSkill',
    $designer: {
      id: `${generateDesignerId()}`,
    },
    activityProcessed: true,
    botId: '=settings.MicrosoftAppId',
    skillHostEndpoint: '=settings.skillHostEndpoint',
    connectionName: '=settings.connectionName',
    allowInterruptions: true,
    skillEndpoint: `=settings.skill['${manifestIdentifier}'].endpointUrl`,
    skillAppId: `=settings.skill['${manifestIdentifier}'].msAppId`,
  };
};
