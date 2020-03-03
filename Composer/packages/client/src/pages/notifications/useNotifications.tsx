// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';
import get from 'lodash/get';
import { LgNamePattern } from '@bfc/shared';

import { StoreContext } from '../../store';

import { Notification, DialogNotification, LuNotification, LgNotification } from './types';
import { getReferredFiles } from './../../utils/luUtil';
export default function useNotifications(filter?: string) {
  const { state } = useContext(StoreContext);
  const { dialogs, luFiles, lgFiles, projectId } = state;
  const memoized = useMemo(() => {
    const notifactions: Notification[] = [];
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
      const lgTemplates = get(lgFile, 'templates', []);
      lgFile.diagnostics
        // only report diagnostics belong to itself.
        .filter(({ source, message }) => message.includes(`source: ${source}`))
        .map(diagnostic => {
          const mappedTemplate = lgTemplates.find(
            t =>
              get(diagnostic, 'range.start.line') >= get(t, 'range.startLineNumber') &&
              get(diagnostic, 'range.end.line') <= get(t, 'range.endLineNumber')
          );
          const id = lgFile.id;
          const location = `${lgFile.id}.lg`;
          let lgTemplateName = '';
          if (mappedTemplate && mappedTemplate.name.match(LgNamePattern)) {
            //should navigate to design page
            lgTemplateName = mappedTemplate.name;
          }
          notifactions.push(new LgNotification(id, lgTemplateName, location, diagnostic, dialogs));
        });
    });
    return notifactions;
  }, [dialogs, luFiles, lgFiles, projectId]);

  const notifications: Notification[] = filter ? memoized.filter(x => x.severity === filter) : memoized;
  return notifications;
}
