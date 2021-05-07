// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { luIndexer, combineMessage } from '@bfc/indexers';
import { OpenConfirmModal } from '@bfc/ui-shared';
import { DialogSetting } from '@botframework-composer/types';
import { isUsingAdaptiveRuntimeKey, parseRuntimeKey } from '@bfc/shared';

import httpClient from '../../utils/httpUtil';
import TelemetryClient from '../../telemetry/TelemetryClient';

const conflictConfirmationTitle = formatMessage('Conflicting changes detected');
const conflictConfirmationPrompt = formatMessage(
  'This operation will overwrite changes made to previously imported files. Do you want to proceed?'
);

/**
 * Orchestrator Nuget Package can only be automatically imported into Adaptive .Net WebApps.
 */
export const canImportOrchestrator = (runtimeKey?: string) => isUsingAdaptiveRuntimeKey(runtimeKey);

export const importOrchestrator = async (
  projectId: string,
  runtime: DialogSetting['runtime'],
  reloadProject,
  setApplicationLevelError
) => {
  const runtimeInfo = parseRuntimeKey(runtime?.key);

  let reqBody;
  if (runtimeInfo.runtimeLanguage === 'dotnet') {
    reqBody = {
      package: 'Microsoft.Bot.Builder.AI.Orchestrator',
      version: '4.13.1',
      source: 'https://api.nuget.org/v3/index.json',
      isUpdating: false,
      isPreview: false,
    };
  } else if (runtimeInfo.runtimeLanguage === 'js') {
    reqBody = {
      package: 'botbuilder-ai-orchestrator',
      version: '4.13.1',
      source: 'https://registry.npmjs.org/-/v1/search',
      isUpdating: false,
      isPreview: false,
    };
  } else {
    return;
  }

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
