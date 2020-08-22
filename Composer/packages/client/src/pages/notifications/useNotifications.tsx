// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { BotIndexer } from '@bfc/indexers';

import {
  luFilesState,
  lgFilesState,
  projectIdState,
  BotDiagnosticsState,
  settingsState,
  skillManifestsState,
  dialogSchemasState,
} from '../../recoilModel/atoms/botState';
import { validatedDialogsSelector } from '../../recoilModel/selectors/validatedDialogs';

import {
  Notification,
  DialogNotification,
  SettingNotification,
  LuNotification,
  LgNotification,
  ServerNotification,
  SkillNotification,
} from './types';
import { getReferredFiles } from './../../utils/luUtil';
export default function useNotifications(filter?: string) {
  const dialogs = useRecoilValue(validatedDialogsSelector);
  const luFiles = useRecoilValue(luFilesState);
  const projectId = useRecoilValue(projectIdState);
  const lgFiles = useRecoilValue(lgFilesState);
  const diagnostics = useRecoilValue(BotDiagnosticsState);
  const setting = useRecoilValue(settingsState);
  const skillManifests = useRecoilValue(skillManifestsState);
  const dialogSchemas = useRecoilValue(dialogSchemasState);
  const botAssets = {
    projectId,
    dialogs,
    luFiles,
    lgFiles,
    skillManifests,
    setting,
    dialogSchemas,
  };
  const memoized = useMemo(() => {
    const notifactions: Notification[] = [];
    diagnostics.forEach((d) => {
      notifactions.push(new ServerNotification(projectId, '', d.source, d));
    });
    const skillDiagnostics = BotIndexer.checkSkillSetting(botAssets);
    skillDiagnostics.forEach((item) => {
      if (item.source.endsWith('.json')) {
        notifactions.push(new SkillNotification(projectId, item.source, item.source, item));
      } else {
        notifactions.push(new DialogNotification(projectId, item.source, item.source, item));
      }
    });
    const luisLocaleDiagnostics = BotIndexer.checkLUISLocales(botAssets);

    luisLocaleDiagnostics.forEach((item) => {
      notifactions.push(new SettingNotification(projectId, item.source, item.source, item));
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
  }, [botAssets, diagnostics]);

  const notifications: Notification[] = filter ? memoized.filter((x) => x.severity === filter) : memoized;
  return notifications;
}
