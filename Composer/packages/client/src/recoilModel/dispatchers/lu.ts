// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { LuFile, LuIntentSection } from '@bfc/shared';
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
  const updateFile = async (
    { set, snapshot }: CallbackInterface,
    { id, content, projectId }: { id: string; content: string; projectId: string }
  ) => {
    let luFiles = await snapshot.getPromise(luFilesState);
    const result = (await LuWorker.parse(id, content)) as LuFile;
    luFiles = luFiles.map((file) => (file.id === id ? result : file));
    luFileStatusStorage.updateFileStatus(projectId, id);
    set(luFilesState, luFiles);
  };

  const updateLuFile = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      content,
      projectId,
    }: {
      id: string;
      content: string;
      projectId: string;
    }) => {
      await updateFile(callbackHelpers, { id, content, projectId });
    }
  );

  const updateLuIntent = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      projectId,
      file,
      intentName,
      intent,
    }: {
      projectId: string;
      file: LuFile;
      intentName: string;
      intent: LuIntentSection;
    }) => {
      const newContent = luUtil.updateIntent(file.content, intentName, intent);
      await updateFile(callbackHelpers, { id: file.id, projectId, content: newContent });
    }
  );

  const createLuIntent = useRecoilCallback<
    [{ projectId: string; file: LuFile; intentName: string; intent: LuIntentSection }],
    Promise<void>
  >((callbackHelpers: CallbackInterface) => async ({ projectId, file, intent }) => {
    const newContent = luUtil.addIntent(file.content, intent);
    await updateFile(callbackHelpers, { id: file.id, projectId, content: newContent });
  });

  const removeLuIntent = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      projectId,
      file,
      intentName,
    }: {
      projectId: string;
      file: LuFile;
      intentName: string;
    }) => {
      const newContent = luUtil.removeIntent(file.content, intentName);
      await updateFile(callbackHelpers, { id: file.id, projectId, content: newContent });
    }
  );

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
