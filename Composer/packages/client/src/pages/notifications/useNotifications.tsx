// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo, useState } from 'react';

import { StoreContext } from '../../store';
import { createSingleMessage } from '../../utils/lgUtil';

import { INotification } from './types';

const DiagnosticSeverity = ['Error', 'Warning', 'Information', 'Hint'];

export default function useNotifications() {
  const { state } = useContext(StoreContext);
  const [filter, setFilter] = useState('All');
  const { dialogs, luFiles, lgFiles } = state;

  const memorized = useMemo(() => {
    const notifactions: INotification[] = [];
    const locations = new Set<string>();
    locations.add('All');
    dialogs.forEach(dialog => {
      dialog.diagnostics.map(diagnostic => {
        const location = dialog.displayName;
        locations.add(location);
        notifactions.push({ type: 'Error', location, message: diagnostic });
      });
    });
    luFiles.forEach(lufile => {
      lufile.diagnostics.map(diagnostic => {
        const location = `${lufile.id}.lu`;
        locations.add(location);
        notifactions.push({ type: 'Error', location, message: diagnostic.text });
      });
    });
    lgFiles.forEach(lgFiles => {
      lgFiles.diagnostics.map(diagnostic => {
        const location = `${lgFiles.id}.lg`;
        locations.add(location);
        notifactions.push({
          type: DiagnosticSeverity[diagnostic.Severity],
          location,
          message: createSingleMessage(diagnostic),
        });
      });
    });
    return { notifactions, locations: [...locations] };
  }, [dialogs, luFiles, lgFiles]);

  const notifications: INotification[] = memorized.notifactions.filter(x => filter === 'All' || x.location === filter);

  return { notifications, setFilter, locations: memorized.locations };
}
