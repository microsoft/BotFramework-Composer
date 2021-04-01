// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { generateDesignerId } from '@bfc/shared';
import formatMessage from 'format-message';

import httpClient from '../../utils/httpUtil';
import TelemetryClient from '../../telemetry/TelemetryClient';

export const createActionFromManifest = (manifest) => {
  console.log(manifest);
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
    skillEndpoint: `=settings.skill['${manifest.name}'].endpointUrl`,
    skillAppId: `=settings.skill['${manifest.name}'].msAppId`,
  };
};

export const importOrchestractor = async (projectId: string, reloadProject, setApplicationLevelError) => {
  const reqBody = {
    package: 'Microsoft.Bot.Components.Orchestrator',
    version: '1.0.0-preview.20210310.a7ff2d0',
    source: 'https://api.nuget.org/v3/index.json',
    isUpdating: false,
  };
  try {
    const results = await httpClient.post(`projects/${projectId}/import`, reqBody);
    // check to see if there was a conflict that requires confirmation
    if (results.data.success === false) {
      TelemetryClient.track('PackageInstallConflictFound', { ...reqBody, isUpdate: reqBody.isUpdating });
    } else {
      TelemetryClient.track('PackageInstalled', { ...reqBody, isUpdate: reqBody.isUpdating });
      // reload modified content
      await reloadProject(projectId);
    }
  } catch (err) {
    TelemetryClient.track('PackageInstallFailed', { ...reqBody, isUpdate: reqBody.isUpdating });

    console.error(err);
    setApplicationLevelError({
      status: err.response.status,
      message: err.response && err.response.data.message ? err.response.data.message : err,
      summary: formatMessage('Install Error'),
    });
  }
};
