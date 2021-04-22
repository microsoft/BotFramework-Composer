// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { luIndexer, combineMessage } from '@bfc/indexers';
import { OpenConfirmModal } from '@bfc/ui-shared';

import httpClient from '../../utils/httpUtil';
import TelemetryClient from '../../telemetry/TelemetryClient';

const conflictConfirmationTitle = formatMessage('Conflicting changes detected');
const conflictConfirmationPrompt = formatMessage(
  'This operation will overwrite changes made to previously imported files. Do you want to proceed?'
);

export const importOrchestractor = async (projectId: string, reloadProject, setApplicationLevelError) => {
  const reqBody = {
    package: 'Microsoft.Bot.Builder.AI.Orchestrator',
    version: '4.13.0',
    source: 'https://api.nuget.org/v3/index.json',
    isUpdating: false,
    isPreview: false,
  };
  try {
    const results = await httpClient.post(`projects/${projectId}/import`, reqBody);
    // check to see if there was a conflict that requires confirmation
    if (results.data.success === false) {
      TelemetryClient.track('PackageInstallConflictFound', { ...reqBody, isUpdate: reqBody.isUpdating });
      const confirmResult = await OpenConfirmModal(conflictConfirmationTitle, conflictConfirmationPrompt);

      if (confirmResult) {
        TelemetryClient.track('PackageInstallConflictResolved', { ...reqBody, isUpdate: reqBody.isUpdating });
        // update package, set isUpdating to true
        await httpClient.post(`projects/${projectId}/import`, { ...reqBody, isUpdate: true });
      }
    } else {
      TelemetryClient.track('PackageInstalled', { ...reqBody, isUpdate: reqBody.isUpdating });
      // reload modified content
      await reloadProject(projectId);
    }
  } catch (err) {
    TelemetryClient.track('PackageInstallFailed', { ...reqBody, isUpdate: reqBody.isUpdating });
    setApplicationLevelError({
      status: err.response.status,
      message: err.response && err.response.data.message ? err.response.data.message : err,
      summary: formatMessage('Install Error'),
    });
  }
};

export const getLuDiagnostics = (intent: string, triggerPhrases: string) => {
  const content = `#${intent}\n${triggerPhrases}`;
  const { diagnostics } = luIndexer.parse(content, '', {
    enableListEntities: false,
    enableCompositeEntities: false,
    enableMLEntities: false,
    enablePrebuiltEntities: false,
    enableRegexEntities: false,
  });
  return combineMessage(diagnostics);
};
