// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import set from 'lodash/set';
import cloneDeep from 'lodash/cloneDeep';
import { useRecoilValue } from 'recoil';
import { useEffect } from 'react';

import { DiagnosticType, SchemaDiagnostic } from '../../../../diagnostics/types';
import { botProjectSpaceSelector, dispatcherState } from '../../../../../recoilModel';
import { dialogsDispatcher } from '../../../../../recoilModel/dispatchers/dialogs';

import { useDiagnosticsData } from './useDiagnostics';

export const useAutoFix = () => {
  const diagnostics = useDiagnosticsData();
  const botProjectSpace = useRecoilValue(botProjectSpaceSelector);
  const { updateDialog } = useRecoilValue(dispatcherState);

  // Auto fix schema absence by setting 'disabled' to true.
  useEffect(() => {
    const schemaDiagnostics = diagnostics.filter((d) => d.type === DiagnosticType.SCHEMA) as SchemaDiagnostic[];
    /**
     * Aggregated diagnostic paths where contains schema problem
     *
     * Example:
     * {
     *   // projectId
     *  '2096.637': {
     *     // dialogId
     *     'dialog-1': [
     *       'triggers[0].actions[1]', // diagnostics.dialogPath
     *       'triggers[2].actions[3]'
     *     ]
     *   }
     * }
     */
    const aggregatedPaths: { [projectId: string]: { [dialogId: string]: string[] } } = {};
    schemaDiagnostics.forEach((d) => {
      const { projectId, id: dialogId, dialogPath } = d;
      if (!dialogPath) return;
      const currentPaths = get(aggregatedPaths, [projectId, dialogId]);
      if (currentPaths) {
        currentPaths.push(dialogPath);
      } else {
        set(aggregatedPaths, [projectId, dialogId], [dialogPath]);
      }
    });

    // Manipulate dialog contnent
    for (const [projectId, pathsByDialogId] of Object.entries(aggregatedPaths)) {
      const projectDialogs = botProjectSpace.find((bot) => bot.projectId === projectId)?.dialogs;
      if (!Array.isArray(projectDialogs)) continue;

      for (const [dialogId, paths] of Object.entries(pathsByDialogId)) {
        const dialogData = projectDialogs.find((dialog) => dialog.id === dialogId)?.content;
        if (!dialogData) continue;

        const pathsToUpdate = paths.filter((p) => {
          // Filters out those paths where action exists and action.disabled !== true
          const data = get(dialogData, p);
          return data && !get(data, 'disabled');
        });
        if (!pathsToUpdate.length) continue;

        const copy = cloneDeep(dialogData);
        for (const p of pathsToUpdate) {
          set(copy, `${p}.disabled`, true);
        }
        updateDialog({ id: dialogId, projectId, content: copy });
      }
    }
  }, [diagnostics]);
};
