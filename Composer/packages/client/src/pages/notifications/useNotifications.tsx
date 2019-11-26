// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';

import { StoreContext } from '../../store';
import { createSingleMessage } from '../../utils/lgUtil';

import { INotification } from './types';

const DiagnosticSeverity = ['Error', 'Warning']; //'Information', 'Hint'

export default function useNotifications(filter: string) {
  const { state } = useContext(StoreContext);
  const { dialogs, luFiles, lgFiles } = state;

  const memoized = useMemo(() => {
    const notifactions: INotification[] = [];
    const locations = new Set<string>();
    dialogs.forEach(dialog => {
      dialog.diagnostics.map(diagnostic => {
        const location = dialog.displayName;
        locations.add(location);
        notifactions.push({ type: 'dialog', location, message: diagnostic, severity: 'Error', diagnostic });
      });
    });
    luFiles.forEach(lufile => {
      lufile.diagnostics.map(diagnostic => {
        const location = `${lufile.id}.lu`;
        locations.add(location);
        notifactions.push({ type: 'lu', location, message: diagnostic.text, severity: 'Error', diagnostic });
      });
    });
    lgFiles.forEach(lgFiles => {
      lgFiles.diagnostics.map(diagnostic => {
        const location = `${lgFiles.id}.lg`;
        locations.add(location);
        notifactions.push({
          type: 'lg',
          severity: DiagnosticSeverity[diagnostic.Severity],
          location,
          message: createSingleMessage(diagnostic),
          diagnostic,
        });
      });
    });
    return { notifactions, locations: Array.from(locations) };
  }, [dialogs, luFiles, lgFiles]);

  const notifications: INotification[] = !filter
    ? memoized.notifactions
    : memoized.notifactions.filter(x => x.location === filter);

  return { notifications, locations: memoized.locations };
}
