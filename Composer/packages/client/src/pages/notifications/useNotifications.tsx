// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import get from 'lodash/get';
import { BotIndexer } from '@bfc/indexers';

import { botStateByProjectIdSelector } from '../../recoilModel';

import {
  Notification,
  DialogNotification,
  SettingNotification,
  LuNotification,
  LgNotification,
  QnANotification,
  ServerNotification,
  SkillNotification,
} from './types';
import { getReferredLuFiles } from './../../utils/luUtil';

export default function useNotifications(filter?: string) {
  const {
    validatedDialogs: dialogs,
    luFiles,
    lgFiles,
    diagnostics,
    dialogSetting,
    skillManifests,
    dialogSchemas,
    projectId,
    qnaFiles,
  } = useRecoilValue(botStateByProjectIdSelector);

  const botAssets = {
    projectId,
    dialogs,
    luFiles,
    qnaFiles,
    lgFiles,
    skillManifests,
    setting: dialogSetting,
    dialogSchemas,
  };

  const memoized = useMemo(() => {
    const notifications: Notification[] = [];
    diagnostics.forEach((d) => {
      notifications.push(new ServerNotification(projectId, '', d.source, d));
    });
    const skillDiagnostics = BotIndexer.checkSkillSetting(botAssets);
    skillDiagnostics.forEach((item) => {
      if (item.source.endsWith('.json')) {
        notifications.push(new SkillNotification(projectId, item.source, item.source, item));
      } else {
        notifications.push(new DialogNotification(projectId, item.source, item.source, item));
      }
    });
    const luisLocaleDiagnostics = BotIndexer.checkLUISLocales(botAssets);

    luisLocaleDiagnostics.forEach((item) => {
      notifications.push(new SettingNotification(projectId, item.source, item.source, item));
    });

    dialogs.forEach((dialog) => {
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
  }, [botAssets, diagnostics]);

  const notifications: Notification[] = filter ? memoized.filter((x) => x.severity === filter) : memoized;
  return notifications;
}
