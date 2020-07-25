// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import get from 'lodash/get';
import { Diagnostic, DiagnosticSeverity } from '@bfc/shared';

import {
  dialogsState,
  luFilesState,
  qnaFilesState,
  lgFilesState,
  projectIdState,
  BotDiagnosticsState,
  settingsState,
} from '../../recoilModel/atoms';

import {
  Notification,
  DialogNotification,
  LuNotification,
  LgNotification,
  QnANotification,
  ServerNotification,
  SkillNotification,
} from './types';
import { getReferredLuFiles } from './../../utils/luUtil';

export default function useNotifications(filter?: string) {
  const dialogs = useRecoilValue(dialogsState);
  const luFiles = useRecoilValue(luFilesState);
  const qnaFiles = useRecoilValue(qnaFilesState);
  const projectId = useRecoilValue(projectIdState);
  const lgFiles = useRecoilValue(lgFilesState);
  const diagnostics = useRecoilValue(BotDiagnosticsState);
  const settings = useRecoilValue(settingsState);
  const memoized = useMemo(() => {
    const notifications: Notification[] = [];
    diagnostics.forEach((d) => {
      notifications.push(new ServerNotification(projectId, '', d.source, d));
    });
    dialogs.forEach((dialog) => {
      // used skill not existed in setting
      dialog.skills.forEach((skillId) => {
        if (settings.skill?.findIndex(({ manifestUrl }) => manifestUrl === skillId) === -1) {
          const diagnostic = new Diagnostic(
            `skill '${skillId}' is not existed in appsettings.json`,
            dialog.id,
            DiagnosticSeverity.Error
          );
          const location = `${dialog.id}.dialog`;
          notifications.push(new DialogNotification(projectId, dialog.id, location, diagnostic));
        }
      });
      // use skill but not fill bot endpoint in skill page.
      if (dialog.skills.length) {
        if (!settings.botId || !settings.skillHostEndpoint) {
          const diagnostic = new Diagnostic(
            'appsettings.json Microsoft App Id or Skill Host Endpoint are empty',
            dialog.id,
            DiagnosticSeverity.Warning
          );
          const location = `${dialog.id}.dialog`;
          notifications.push(new SkillNotification(projectId, dialog.id, location, diagnostic));
        }
      }
      dialog.diagnostics.map((diagnostic) => {
        const location = `${dialog.id}.dialog`;
        notifications.push(new DialogNotification(projectId, dialog.id, location, diagnostic));
      });
    });
    getReferredLuFiles(luFiles, dialogs).forEach((lufile) => {
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
  }, [dialogs, luFiles, qnaFiles, lgFiles, projectId, diagnostics, settings]);

  const notifications: Notification[] = filter ? memoized.filter((x) => x.severity === filter) : memoized;
  return notifications;
}
