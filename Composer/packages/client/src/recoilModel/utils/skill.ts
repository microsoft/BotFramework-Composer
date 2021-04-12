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
    skillEndpoint: `=settings.skill['${manifestIdentifier}'].endpointUrl`, // manifest.endpoints.length > 0 ? manifest.endpoints?.[selectEndpointIndex].endpointUrl : '',
    skillAppId: `=settings.skill['${manifestIdentifier}'].msAppId`, // manifest.endpoints.length > 0 ? manifest.endpoints?.[selectEndpointIndex].msAppId : '',
  };
};
