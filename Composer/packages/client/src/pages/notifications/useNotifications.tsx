// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';
import { createSingleMessage } from '@bfc/indexers';
import get from 'lodash/get';

import { StoreContext } from '../../store';
import { replaceDialogDiagnosticLabel } from '../../utils';

import { INotification, DiagnosticSeverity } from './types';
import { getReferredFiles } from './../../utils/luUtil';
export default function useNotifications(filter?: string) {
  const { state } = useContext(StoreContext);
  const { dialogs, luFiles, lgFiles } = state;
  const inLineLgTemplateFormat = /^bfd(.*)-[0-9]+$/;
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
      const lgTemplates = get(lgFile, 'templates', []);
      lgFile.diagnostics.map(diagnostic => {
        const mappedTemplate = lgTemplates.find(
          t =>
            get(diagnostic, 'range.start.line', -1) >= get(t, 'range.startLineNumber') &&
            get(diagnostic, 'range.end.line', -1) <= get(t, 'range.endLineNumber')
        );
        if (mappedTemplate && inLineLgTemplateFormat.test(mappedTemplate.name)) {
          //should navigate to design page
          console.log(mappedTemplate);
          console.log(diagnostic);
          const location = `${lgFile.id}.lg`;
          notifactions.push({
            type: 'inlineLgTemplate',
            severity: DiagnosticSeverity[diagnostic.severity] || '',
            location,
            message: createSingleMessage(diagnostic),
            diagnostic,
            id: mappedTemplate.name,
          });
        } else {
          const location = `${lgFile.id}.lg`;
          notifactions.push({
            type: 'customCraftedLgTemplateg',
            severity: DiagnosticSeverity[diagnostic.severity] || '',
            location,
            message: createSingleMessage(diagnostic),
            diagnostic,
            id: lgFile.id,
          });
        }
      });
    });
    return notifactions;
  }, [dialogs, luFiles, lgFiles]);

  const notifications: INotification[] = !filter ? memoized : memoized.filter(x => x.severity === filter);

  return notifications;
}
