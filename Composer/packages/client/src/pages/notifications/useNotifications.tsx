// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import get from 'lodash/get';

import {
  dialogsState,
  luFilesState,
  qnaFilesState,
  lgFilesState,
  projectIdState,
  BotDiagnosticsState,
} from '../../recoilModel/atoms/botState';

import {
  Notification,
  DialogNotification,
  LuNotification,
  LgNotification,
  QnANotification,
  ServerNotification,
} from './types';
import { getReferredFiles } from './../../utils/luUtil';
export default function useNotifications(filter?: string) {
  const dialogs = useRecoilValue(dialogsState);
  const luFiles = useRecoilValue(luFilesState);
  const qnaFiles = useRecoilValue(qnaFilesState);
  const projectId = useRecoilValue(projectIdState);
  const lgFiles = useRecoilValue(lgFilesState);
  const diagnostics = useRecoilValue(BotDiagnosticsState);
  const memoized = useMemo(() => {
    const notifications: Notification[] = [];
    diagnostics.forEach((d) => {
      notifications.push(new ServerNotification(projectId, '', d.source, d));
    });
    dialogs.forEach((dialog) => {
      dialog.diagnostics.map((diagnostic) => {
        const location = `${dialog.id}.dialog`;
        notifications.push(new DialogNotification(projectId, dialog.id, location, diagnostic));
      });
    });
    getReferredFiles(luFiles, dialogs).forEach((lufile) => {
      lufile.diagnostics.map((diagnostic) => {
        const location = `${lufile.id}.lu`;
        notifications.push(new LuNotification(projectId, lufile.id, location, diagnostic, lufile, dialogs));
      });
    });
    lgFiles.forEach((lgFile) => {
      lgFile.diagnostics.map((diagnostic) => {
        const location = `${lgFile.id}.lg`;
        notifications.push(new LgNotification(projectId, lgFile.id, location, diagnostic, lgFile, dialogs));
      });
    });
    qnaFiles.forEach((qnaFile) => {
      get(qnaFile, 'diagnostics', []).map((diagnostic) => {
        const location = `${qnaFile.id}.qna`;
        notifications.push(new QnANotification(projectId, qnaFile.id, location, diagnostic));
      });
    });
    return notifications;
  }, [dialogs, luFiles, qnaFiles, lgFiles, projectId, diagnostics]);

  const notifications: Notification[] = filter ? memoized.filter((x) => x.severity === filter) : memoized;
  return notifications;
}
