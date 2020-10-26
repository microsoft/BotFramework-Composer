// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotIndexer } from '@bfc/indexers';
import { BotAssets } from '@bfc/shared';
import { selectorFamily, selector } from 'recoil';
import lodashGet from 'lodash/get';
import formatMessage from 'format-message';

import { getReferredLuFiles } from '../../utils/luUtil';
import { INavTreeItem } from '../../components/NavTree';

import { botDisplayNameState, qnaFilesState } from './../atoms/botState';
import { currentProjectIdState } from './../atoms/appState';
import {
  DialogNotification,
  LgNotification,
  LuNotification,
  Notification,
  QnANotification,
  ServerNotification,
  SettingNotification,
  SkillNotification,
} from './../../pages/notifications/types';
import {
  botDiagnosticsState,
  botProjectFileState,
  botProjectIdsState,
  dialogSchemasState,
  jsonSchemaFilesState,
  lgFilesState,
  luFilesState,
  projectMetaDataState,
  settingsState,
  skillManifestsState,
} from './../atoms';
import { formDialogSchemasSelectorFamily } from './project';
import { validateDialogsSelectorFamily } from './validatedDialogs';

export const notificationListSelector = selectorFamily({
  key: 'notificationListSelector',
  get: (projectId: string) => ({ get }) => {
    const projectsMetaData = get(projectMetaDataState(projectId));
    if (!projectsMetaData || projectsMetaData.isRemote) return [];

    const dialogs = get(validateDialogsSelectorFamily(projectId));
    const luFiles = get(luFilesState(projectId));
    const lgFiles = get(lgFilesState(projectId));
    const diagnostics = get(botDiagnosticsState(projectId));
    const setting = get(settingsState(projectId));
    const skillManifests = get(skillManifestsState(projectId));
    const dialogSchemas = get(dialogSchemasState(projectId));
    const qnaFiles = get(qnaFilesState(projectId));
    const formDialogSchemas = get(formDialogSchemasSelectorFamily(projectId));
    const botProjectFile = get(botProjectFileState(projectId));
    const jsonSchemaFiles = get(jsonSchemaFilesState(projectId));

    const botAssets: BotAssets = {
      projectId,
      dialogs,
      luFiles,
      qnaFiles,
      lgFiles,
      skillManifests,
      setting,
      dialogSchemas,
      formDialogSchemas,
      botProjectFile,
      jsonSchemaFiles,
    };

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
      dialog.diagnostics.forEach((diagnostic) => {
        const location = `${dialog.id}.dialog`;
        notifications.push(new DialogNotification(projectId, dialog.id, location, diagnostic));
      });
    });
    getReferredLuFiles(luFiles, dialogs).forEach((lufile) => {
      lufile.diagnostics.forEach((diagnostic) => {
        const location = `${lufile.id}.lu`;
        notifications.push(new LuNotification(projectId, lufile.id, location, diagnostic, lufile, dialogs));
      });
    });
    lgFiles.forEach((lgFile) => {
      lgFile.diagnostics.forEach((diagnostic) => {
        const location = `${lgFile.id}.lg`;
        notifications.push(new LgNotification(projectId, lgFile.id, location, diagnostic, lgFile, dialogs));
      });
    });
    qnaFiles.forEach((qnaFile) => {
      lodashGet(qnaFile, 'diagnostics', []).forEach((diagnostic) => {
        const location = `${qnaFile.id}.qna`;
        notifications.push(new QnANotification(projectId, qnaFile.id, location, diagnostic));
      });
    });
    return notifications;
  },
});

export const startAllBotEnableSelector = selector({
  key: 'startAllBotEnableSelector',
  get: ({ get }) => {
    const ids = get(botProjectIdsState);
    const result = ids.reduce((result: Notification[], id: string) => {
      return [...result, ...get(notificationListSelector(id))];
    }, []);
    return !result.length;
  },
});

export const allNotificationsSelector = selector({
  key: 'allNotificationsSelector',
  get: ({ get }) => {
    const ids = get(botProjectIdsState);
    const result = ids.reduce((result: Notification[], id: string) => {
      return [...result, ...get(notificationListSelector(id))];
    }, []);
    return result;
  },
});

export const notificationNavLinksSelector = selector({
  key: 'notificationNavLinksSelector',
  get: ({ get }) => {
    const projectId = get(currentProjectIdState);
    const ids = get(botProjectIdsState);
    const result = ids.reduce((result: INavTreeItem[], id: string) => {
      const projectsMetaData = get(projectMetaDataState(id));
      if (projectsMetaData.isRemote) return result;
      const name = get(botDisplayNameState(id));
      result.push({
        id: id,
        name: name,
        ariaLabel: formatMessage('notification links'),
        url: `/bot/${projectId}/notifications/${id}`,
      });
      return result;
    }, []);

    return result;
  },
});
