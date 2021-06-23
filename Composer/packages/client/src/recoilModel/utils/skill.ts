// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { generateDesignerId } from '@bfc/shared';

import { manifestUrl } from '../../pages/design/styles';

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

export const getManifestJsonFromZip = (zipContent) => {
  try {
    const manifestUrl = Object.keys(zipContent).find((key) => key.indexOf('.json') > 0 && key.indexOf('manifest') > 0);
    return manifestUrl
      ? { name: `skills/${manifestUrl}`, content: JSON.parse(zipContent[manifestUrl]) }
      : { name: '', content: null };
  } catch (e) {
    return { name: '', content: null };
  }
};
