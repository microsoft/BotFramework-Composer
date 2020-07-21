// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { LuFile, LuIntentSection } from '@bfc/shared';
import { useRecoilCallback, CallbackInterface } from 'recoil';
import differenceBy from 'lodash/differenceBy';

import { getBaseName, getExtension } from '../../utils/fileUtil';
import * as luUtil from '../../utils/luUtil';
import luFileStatusStorage from '../../utils/luFileStatusStorage';
import luWorker from '../parsers/luWorker';
import {
  luFilesState,
  botLoadErrorState,
  projectIdState,
  botStatusState,
  dialogsState,
  localeState,
  settingsState,
} from '../atoms/botState';

import httpClient from './../../utils/httpUtil';
import { Text, BotStatus } from './../../constants';

const intentIsNotEmpty = ({ Name, Body }) => {
  return !!Name && !!Body;
};
// fill other locale luFile new added intent with '- '
const initialBody = '- ';

export const updateLuFileState = async (
  callbackHelpers: CallbackInterface,
  { id, content }: { id: string; content: string }
) => {
  const { set, snapshot } = callbackHelpers;
  const luFiles = await snapshot.getPromise(luFilesState);
  const projectId = await snapshot.getPromise(projectIdState);

  const dialogId = getBaseName(id);
  const locale = getExtension(id);
  const updatedLuFile = (await luWorker.parse(id, content)) as LuFile;
  const originLuFile = luFiles.find((file) => id === file.id);
  const sameIdOtherLocaleFiles = luFiles.filter((file) => {
    const fileDialogId = getBaseName(file.id);
    const fileLocale = getExtension(file.id);
    return fileDialogId === dialogId && locale !== fileLocale;
  });

  if (!originLuFile) {
    throw new Error('origin lu file not found in store');
  }

  const changes: LuFile[] = [updatedLuFile];

  const addedIntents = differenceBy(updatedLuFile.intents, originLuFile.intents, 'Name')
    .filter(intentIsNotEmpty)
    .map((t) => {
      return {
        ...t,
        Body: initialBody,
      };
    });
  const deletedIntents = differenceBy(originLuFile.intents, updatedLuFile.intents, 'Name').filter(intentIsNotEmpty);
  const onlyAdds = addedIntents.length && !deletedIntents.length;
  const onlyDeletes = !addedIntents.length && deletedIntents.length;
  // sync add/remove intents
  if (onlyAdds || onlyDeletes) {
    for (const { id, content } of sameIdOtherLocaleFiles) {
      let newContent: string = (await luWorker.addIntents(content, addedIntents)) as string;
      newContent = (await luWorker.removeIntents(
        newContent,
        deletedIntents.map(({ Name }) => Name)
      )) as string;
      const newLuFile = (await luWorker.parse(id, newContent)) as LuFile;
      changes.push(newLuFile);
    }
  }

  changes.forEach(({ id }) => {
    luFileStatusStorage.updateFileStatus(projectId, id);
  });

  const newluFiles = luFiles.map((file) => {
    const changedFile = changes.find(({ id }) => id === file.id);
    if (changedFile) {
      return changedFile;
    }
    return file;
  });

  set(luFilesState, newluFiles);
};

export const createLuFileState = async (
  callbackHelpers: CallbackInterface,
  { id, content }: { id: string; content: string }
) => {
  const { set, snapshot } = callbackHelpers;
  const luFiles = await snapshot.getPromise(luFilesState);
  const projectId = await snapshot.getPromise(projectIdState);
  const locale = await snapshot.getPromise(localeState);
  const { languages } = await snapshot.getPromise(settingsState);
  const createdLuId = `${id}.${locale}`;
  const createdLuFile = (await luWorker.parse(id, content)) as LuFile;
  if (luFiles.find((lg) => lg.id === createdLuId)) {
    throw new Error('lu file already exist');
  }
  const changes: LuFile[] = [];

  // copy to other locales
  languages.forEach((lang) => {
    const fileId = `${id}.${lang}`;
    luFileStatusStorage.updateFileStatus(projectId, fileId);
    changes.push({
      ...createdLuFile,
      id: fileId,
    });
  });

  set(luFilesState, [...luFiles, ...changes]);
};

export const removeLuFileState = async (callbackHelpers: CallbackInterface, { id }: { id: string }) => {
  const { set, snapshot } = callbackHelpers;
  let luFiles = await snapshot.getPromise(luFilesState);
  const projectId = await snapshot.getPromise(projectIdState);

  luFiles.forEach((file) => {
    if (getBaseName(file.id) === getBaseName(id)) {
      luFileStatusStorage.removeFileStatus(projectId, id);
    }
  });

  luFiles = luFiles.filter((file) => getBaseName(file.id) !== id);
  set(luFilesState, luFiles);
};

export const luDispatcher = () => {
  const updateLuFile = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      content,
    }: {
      id: string;
      content: string;
      projectId: string;
    }) => {
      await updateLuFileState(callbackHelpers, { id, content });
    }
  );

  const updateLuIntent = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      intentName,
      intent,
    }: {
      id: string;
      intentName: string;
      intent: LuIntentSection;
    }) => {
      const luFiles = await callbackHelpers.snapshot.getPromise(luFilesState);
      const file = luFiles.find((temp) => temp.id === id);
      if (!file) return;
      const content = (await luWorker.updateIntent(file.content, intentName, intent)) as string;
      await updateLuFileState(callbackHelpers, { id: file.id, content });
    }
  );

  const createLuIntent = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ id, intent }: { id: string; intent: LuIntentSection }) => {
      const luFiles = await callbackHelpers.snapshot.getPromise(luFilesState);
      const file = luFiles.find((temp) => temp.id === id);
      if (!file) return;
      const content = (await luWorker.addIntent(file.content, intent)) as string;
      await updateLuFileState(callbackHelpers, { id: file.id, content });
    }
  );

  const removeLuIntent = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ id, intentName }: { id: string; intentName: string }) => {
      const luFiles = await callbackHelpers.snapshot.getPromise(luFilesState);
      const file = luFiles.find((temp) => temp.id === id);
      if (!file) return;
      const content = (await luWorker.removeIntent(file.content, intentName)) as string;
      await updateLuFileState(callbackHelpers, { id: file.id, content });
    }
  );

  const publishLuis = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (luisConfig, projectId: string) => {
      const dialogs = await snapshot.getPromise(dialogsState);
      try {
        const luFiles = await snapshot.getPromise(luFilesState);
        const referred = luUtil.checkLuisPublish(luFiles, dialogs);
        //TODO crosstrain should add locale
        const crossTrainConfig = luUtil.createCrossTrainConfig(dialogs, referred);
        await httpClient.post(`/projects/${projectId}/luFiles/publish`, {
          luisConfig,
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
