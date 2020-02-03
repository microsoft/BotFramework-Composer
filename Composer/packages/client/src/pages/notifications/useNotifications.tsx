// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';

import { StoreContext } from '../../store';

import { INotification, DialogNotification, LuNotification, LgNotification } from './types';
import { getReferredFiles } from './../../utils/luUtil';

export default function useNotifications(filter?: string) {
  const { state } = useContext(StoreContext);
  const { dialogs, luFiles, lgFiles } = state;

  const memoized = useMemo(() => {
    const notifactions: INotification[] = [];
    dialogs.forEach(dialog => {
      dialog.diagnostics.map(diagnostic => {
        const location = `${dialog.id}.dialog`;
        notifactions.push(new DialogNotification(dialog.id, location, diagnostic));
      });
    });
    getReferredFiles(luFiles, dialogs).forEach(lufile => {
      lufile.diagnostics.map(diagnostic => {
        const location = `${lufile.id}.lu`;
        notifactions.push(new LuNotification(lufile.id, location, diagnostic, lufile, dialogs));
      });
    });
    lgFiles.forEach(lgFile => {
      lgFile.diagnostics.map(diagnostic => {
        const location = `${lgFile.id}.lg`;
        notifactions.push(new LgNotification(lgFile.id, location, diagnostic));
      });
    });
    return notifactions;
  }, [dialogs, luFiles, lgFiles]);

  const notifications: INotification[] = !filter ? memoized : memoized.filter(x => x.severity === filter);

  return notifications;
}
