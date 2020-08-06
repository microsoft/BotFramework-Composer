// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { Diagnostic, DiagnosticSeverity } from '@bfc/shared';

import { currentProjectIdState } from '../../recoilModel/atoms/botState';
import { botStateByProjectIdSelector } from '../../recoilModel';

import {
  Notification,
  DialogNotification,
  LuNotification,
  LgNotification,
  ServerNotification,
  SkillNotification,
} from './types';
import { getReferredFiles } from './../../utils/luUtil';
export default function useNotifications(filter?: string) {
  const { dialogs, luFiles, lgFiles, diagnostics, settings } = useRecoilValue(botStateByProjectIdSelector);
  const projectId = useRecoilValue(currentProjectIdState);

  const memoized = useMemo(() => {
    const notifactions: Notification[] = [];
    diagnostics.forEach((d) => {
      notifactions.push(new ServerNotification(projectId, '', d.source, d));
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
          notifactions.push(new DialogNotification(projectId, dialog.id, location, diagnostic));
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
          notifactions.push(new SkillNotification(projectId, dialog.id, location, diagnostic));
        }
      }
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
  }, [dialogs, luFiles, lgFiles, projectId, diagnostics, settings]);

  const notifications: Notification[] = filter ? memoized.filter((x) => x.severity === filter) : memoized;
  return notifications;
}
