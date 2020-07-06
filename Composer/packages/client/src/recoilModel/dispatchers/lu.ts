// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { LuFile } from '@bfc/shared';
import { useRecoilCallback, CallbackInterface } from 'recoil';

import * as luUtil from '../../utils/luUtil';
import luFileStatusStorage from '../../utils/luFileStatusStorage';
import LuWorker from '../parsers/luWorker';
import { luFilesState, botLoadErrorState } from '../atoms/botState';

import { Text } from './../../constants';
import { botStatusState } from './../atoms/botState';
import { dialogsState } from './../atoms/botState';
import httpClient from './../../utils/httpUtil';
import { BotStatus } from './../../constants';

export const luDispatcher = () => {
  const updateLuFile = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({ id, content, projectId }) => {
      let luFiles = await snapshot.getPromise(luFilesState);
      const result = (await LuWorker.parse(id, content)) as LuFile;
      luFiles = luFiles.map((file) => (file.id === id ? result : file));
      luFileStatusStorage.updateFileStatus(projectId, id);
      set(luFilesState, luFiles);
    }
  );

  const updateLuIntent = async ({ projectId, file, intentName, intent }) => {
    const newContent = luUtil.updateIntent(file.content, intentName, intent);
    await updateLuFile({ id: file.id, projectId, content: newContent });
  };

  const createLuIntent = async ({ projectId, file, intent }) => {
    const newContent = luUtil.addIntent(file.content, intent);
    await updateLuFile({ id: file.id, projectId, content: newContent });
  };

  const removeLuIntent = async ({ projectId, file, intentName }) => {
    const newContent = luUtil.removeIntent(file.content, intentName);
    await updateLuFile({ id: file.id, projectId, content: newContent });
  };

  const publishLuis = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (authoringKey: string, projectId: string) => {
      const dialogs = await snapshot.getPromise(dialogsState);
      try {
        const luFiles = await snapshot.getPromise(luFilesState);
        const referred = luUtil.checkLuisPublish(luFiles, dialogs);
        //TODO crosstrain should add locale
        const crossTrainConfig = luUtil.createCrossTrainConfig(dialogs, referred);
        await httpClient.post(`/projects/${projectId}/luFiles/publish`, {
          authoringKey,
          projectId,
          crossTrainConfig,
          luFiles: referred.map((file) => file.id),
        });
        luFileStatusStorage.publishAll(projectId);
        set(botStatusState, BotStatus.published);
      } catch (err) {
        set(botStatusState, BotStatus.failed);
        set(botLoadErrorState, { title: Text.LUISDEPLOYFAILURE, message: err.response?.data?.message || err.message });
      }
    }
  );

  return {
    updateLuFile,
    updateLuIntent,
    createLuIntent,
    removeLuIntent,
    publishLuis,
  };
};
