// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useMemo } from 'react';

import { useStoreContext } from '../../hooks/useStoreContext';

import { Notification, DialogNotification, LuNotification, LgNotification, ServerNotification } from './types';
import { getReferredFiles } from './../../utils/luUtil';
export default function useNotifications(filter?: string) {
  const { state } = useStoreContext();
  const { dialogs, luFiles, lgFiles, projectId, diagnostics } = state;
  const memoized = useMemo(() => {
    const notifactions: Notification[] = [];
    diagnostics.forEach((d) => {
      notifactions.push(new ServerNotification(projectId, '', d.source, d));
    });
    dialogs.forEach((dialog) => {
      dialog.diagnostics.map((diagnostic) => {
        const location = `${dialog.id}.dialog`;
        notifactions.push(new DialogNotification(projectId, dialog.id, location, diagnostic));
      });
    });
    getReferredFiles(luFiles, dialogs).forEach((lufile) => {
      lufile.diagnostics.map((diagnostic) => {
        const location = `${lufile.id}.lu`;
        notifactions.push(new LuNotification(projectId, lufile.id, location, diagnostic, lufile, dialogs));
      });
    });
    lgFiles.forEach((lgFile) => {
      lgFile.diagnostics.map((diagnostic) => {
        const location = `${lgFile.id}.lg`;
        notifactions.push(new LgNotification(projectId, lgFile.id, location, diagnostic, lgFile, dialogs));
      });
    });
    return notifactions;
  }, [dialogs, luFiles, lgFiles, projectId, diagnostics]);

  const notifications: Notification[] = filter ? memoized.filter((x) => x.severity === filter) : memoized;
  return notifications;
}
