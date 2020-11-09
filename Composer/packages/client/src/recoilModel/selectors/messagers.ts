// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { selector } from 'recoil';
import { BotIndexer } from '@bfc/indexers';
import { BotAssets } from '@bfc/shared';

import {
  botDiagnosticsState,
  botProjectFileState,
  botProjectSpaceSelector,
  crossTrainConfigState,
  dialogSchemasState,
  formDialogSchemasSelectorFamily,
  jsonSchemaFilesState,
  lgFilesState,
  luFilesState,
  qnaFilesState,
  settingsState,
  skillManifestsState,
  validateDialogsSelectorFamily,
} from '../../recoilModel';
import { recognizersSelectorFamily } from '../../recoilModel/selectors/recognizers';
import {
  DialogNotification,
  LgNotification,
  LuNotification,
  Notification,
  QnANotification,
  ServerNotification,
  SettingNotification,
  SkillNotification,
} from '../../pages/notifications/types';

import { getReferredLuFiles } from './../../utils/luUtil';

export const messagersSelector = selector({
  key: 'messagersSelector',
  get: ({ get }) => {
    const botProjectSpace = get(botProjectSpaceSelector);
    const allMessage: Notification[] = [];

    for (const project of botProjectSpace) {
      const { projectId, name } = project;
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
      const recognizers = get(recognizersSelectorFamily(projectId));
      const crossTrainConfig = get(crossTrainConfigState(projectId));
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
        recognizers,
        crossTrainConfig,
      };

      const notifications: Notification[] = [];
      diagnostics.forEach((d) => {
        notifications.push(new ServerNotification(projectId, name, '', d.source, d));
      });
      const skillDiagnostics = BotIndexer.checkSkillSetting(botAssets);
      skillDiagnostics.forEach((item) => {
        if (item.source.endsWith('.json')) {
          notifications.push(new SkillNotification(projectId, name, item.source, item.source, item));
        } else {
          notifications.push(new DialogNotification(projectId, name, item.source, item.source, item));
        }
      });
      const luisLocaleDiagnostics = BotIndexer.checkLUISLocales(botAssets);

      luisLocaleDiagnostics.forEach((item) => {
        notifications.push(new SettingNotification(projectId, name, item.source, item.source, item));
      });

      dialogs.forEach((dialog) => {
        dialog.diagnostics.forEach((diagnostic) => {
          const location = `${dialog.id}.dialog`;
          notifications.push(new DialogNotification(projectId, name, dialog.id, location, diagnostic));
        });
      });
      getReferredLuFiles(luFiles, dialogs).forEach((lufile) => {
        lufile.diagnostics.forEach((diagnostic) => {
          const location = `${lufile.id}.lu`;
          notifications.push(new LuNotification(projectId, name, lufile.id, location, diagnostic, lufile, dialogs));
        });
      });
      lgFiles.forEach((lgFile) => {
        lgFile.diagnostics.forEach((diagnostic) => {
          const location = `${lgFile.id}.lg`;
          notifications.push(new LgNotification(projectId, name, lgFile.id, location, diagnostic, lgFile, dialogs));
        });
      });
      qnaFiles.forEach((qnaFile) => {
        qnaFile.diagnostics.forEach((diagnostic) => {
          const location = `${qnaFile.id}.qna`;
          notifications.push(new QnANotification(projectId, name, qnaFile.id, location, diagnostic));
        });
      });
      allMessage.push(...notifications);
    }

    return allMessage;
  },
});
