// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo, useState } from 'react';

import { StoreContext } from '../../store';

import { INotification } from './types';

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
        locations.add(dialog.id);
        notifactions.push({
          type: 'Error',
          location: dialog.displayName,
          message: diagnostic,
        });
      });
    });
    luFiles.forEach(lufile => {
      lufile.diagnostics.map(diagnostic => {
        locations.add(lufile.id);
        notifactions.push({
          type: 'Error',
          location: `${lufile.id}.lu`,
          message: diagnostic.text,
        });
      });
    });
    lgFiles.forEach(lgFiles => {
      lgFiles.diagnostics.map(diagnostic => {
        locations.add(lgFiles.id);
        notifactions.push({
          type: 'Error',
          location: `${lgFiles.id}.lg`,
          message: diagnostic.Message,
        });
      });
    });
    return { notifactions, locations };
  }, [dialogs, luFiles, lgFiles]);

  const notifications: INotification[] = memorized.notifactions.filter(x => filter === 'All' || x.location === filter);
  return { notifications, setFilter, locations: [...memorized.locations] };
}
