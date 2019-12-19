// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';
import { createSingleMessage } from '@bfc/indexers';

import { StoreContext } from '../../store';
import { replaceDialogDiagnosticLabel } from '../../utils';

import { INotification, DiagnosticSeverity } from './types';
import { getReferredFiles } from './../../utils/luUtil';

export default function useNotifications(filter?: string) {
  const { state } = useContext(StoreContext);
  const { dialogs, luFiles, lgFiles } = state;

  const memoized = useMemo(() => {
    const notifactions: INotification[] = [];
    dialogs.forEach(dialog => {
      dialog.diagnostics.map(diagnostic => {
        const location = `${dialog.id}.dialog`;
        notifactions.push({
          type: 'dialog',
          location,
          message: `In ${replaceDialogDiagnosticLabel(diagnostic.path)} ${diagnostic.message}`,
          severity: DiagnosticSeverity[diagnostic.severity] || '',
          diagnostic,
          id: dialog.id,
        });
      });
    });
    getReferredFiles(luFiles, dialogs).forEach(lufile => {
      lufile.diagnostics.map(diagnostic => {
        const location = `${lufile.id}.lu`;
        notifactions.push({
          type: 'lu',
          location,
          message: createSingleMessage(diagnostic),
          severity: 'Error',
          diagnostic,
          id: lufile.id,
        });
      });
    });
    lgFiles.forEach(lgFile => {
      lgFile.diagnostics.map(diagnostic => {
        const location = `${lgFile.id}.lg`;
        notifactions.push({
          type: 'lg',
          severity: DiagnosticSeverity[diagnostic.severity] || '',
          location,
          message: createSingleMessage(diagnostic),
          diagnostic,
          id: lgFile.id,
        });
      });
    });
    return notifactions;
  }, [dialogs, luFiles, lgFiles]);

  const notifications: INotification[] = !filter ? memoized : memoized.filter(x => x.severity === filter);

  return notifications;
}
