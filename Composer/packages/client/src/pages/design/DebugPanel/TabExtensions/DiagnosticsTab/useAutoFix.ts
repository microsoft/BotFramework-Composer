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

  useEffect(() => {
    // Auto fix schema absence by setting 'disabled' to true.
    const schemaDiagnostics = diagnostics.filter((d) => d.type === DiagnosticType.SCHEMA) as SchemaDiagnostic[];
    schemaDiagnostics.forEach((d) => {
      const { projectId, rootProjectId, id: dialogId, dialogPath } = d;

      const dialogContent = botProjectSpace
        .find((bot) => bot.projectId === projectId)
        ?.dialogs.find((dialog) => dialog.id === dialogId)?.content;
      if (!dialogContent) return;

      if (get(dialogContent, `${dialogPath}.disabled`)) return;

      const copy = cloneDeep(dialogContent);
      set(copy, `${dialogPath}.disabled`, true);
      console.log('Autofix: disable', projectId, rootProjectId, dialogPath);
      updateDialog({ id: dialogId, projectId, content: copy });
    });
  }, [diagnostics]);
};
