// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import set from 'lodash/set';
import cloneDeep from 'lodash/cloneDeep';
import { useRecoilValue } from 'recoil';
import { useEffect } from 'react';

import { DiagnosticType, SchemaDiagnostic } from '../../../../diagnostics/types';
import { botProjectSpaceSelector, dispatcherState } from '../../../../../recoilModel';

import { useDiagnosticsData } from './useDiagnostics';

export const useAutoFix = () => {
  const diagnostics = useDiagnosticsData();
  const botProjectSpace = useRecoilValue(botProjectSpaceSelector);
  const { updateDialog } = useRecoilValue(dispatcherState);

  // Auto fix schema absence by setting 'disabled' to true.
  useEffect(() => {
    /**
     * Caches updated dialogs data as a tree to avoid frequent recoil state submission.
     *
     * Example:
     * {
     *   // projectId
     *  '2096.637': {
     *     // dialogId
     *     'dialog-1': {...} // updated dialog json
     *   }
     * }
     */
    const cachedDialogs: { [projectId: string]: { [dialogId: string]: any } } = {};

    const schemaDiagnostics = diagnostics.filter((d) => d.type === DiagnosticType.SCHEMA) as SchemaDiagnostic[];
    schemaDiagnostics.forEach((d) => {
      const { projectId, id: dialogId, dialogPath } = d;

      const dialogContent = botProjectSpace
        .find((bot) => bot.projectId === projectId)
        ?.dialogs.find((dialog) => dialog.id === dialogId)?.content;

      // Contains two cases: 1. action already disabled 2. action doesn't exists on this path.
      if (get(dialogContent, `${dialogPath}.disabled`)) return;

      // Manipulate the dialog content and caches the result
      const dialogData = get(cachedDialogs, [projectId, dialogId]) ?? cloneDeep(dialogContent);
      set(dialogData, `${dialogPath}.disabled`, true);
      set(cachedDialogs, [projectId, dialogId], dialogData);
    });

    // Submit cached dialog updates to recoil store.
    for (const [projectId, dialogs] of Object.entries(cachedDialogs)) {
      for (const [dialogId, dialogData] of Object.entries(dialogs)) {
        updateDialog({ id: dialogId, projectId, content: dialogData });
      }
    }
  }, [diagnostics]);
};
