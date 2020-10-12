// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { LuFile, LuIntentSection, ILUFeaturesConfig } from '@bfc/shared';
import { useRecoilCallback, CallbackInterface } from 'recoil';
import differenceBy from 'lodash/differenceBy';
import formatMessage from 'format-message';

import luWorker from '../parsers/luWorker';
import { getBaseName, getExtension } from '../../utils/fileUtil';
import luFileStatusStorage from '../../utils/luFileStatusStorage';
import { luFilesState, localeState, settingsState } from '../atoms/botState';

import { setError } from './shared';

const intentIsNotEmpty = ({ Name, Body }) => {
  return !!Name && !!Body;
};
// fill other locale luFile new added intent with '- '
const initialBody = '- ';

const updateLuFileState = async (
  luFiles: LuFile[],
  updatedLuFile: LuFile,
  projectId: string,
  luFeatures: ILUFeaturesConfig
) => {
  const { id } = updatedLuFile;
  const dialogId = getBaseName(id);
  const locale = getExtension(id);
  const originLuFile = luFiles.find((file) => id === file.id);
  const sameIdOtherLocaleFiles = luFiles.filter((file) => {
    const fileDialogId = getBaseName(file.id);
    const fileLocale = getExtension(file.id);
    return fileDialogId === dialogId && locale !== fileLocale;
  });

  if (!originLuFile) {
    throw new Error(formatMessage('origin lu file not found in store'));
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
    for (const item of sameIdOtherLocaleFiles) {
      let newLuFile = (await luWorker.addIntents(item, addedIntents, luFeatures)) as LuFile;
      newLuFile = (await luWorker.removeIntents(
        newLuFile,
        deletedIntents.map(({ Name }) => Name),
        luFeatures
      )) as LuFile;
      changes.push(newLuFile);
    }
  }

  changes.forEach(({ id }) => {
    luFileStatusStorage.updateFileStatus(projectId, id);
  });

  return luFiles.map((file) => {
    const changedFile = changes.find(({ id }) => id === file.id);
    return changedFile ? changedFile : file;
  });
};

export const createLuFileState = async (
  callbackHelpers: CallbackInterface,
  { id, content, projectId }: { id: string; content: string; projectId: string }
) => {
  const { set, snapshot } = callbackHelpers;
  const luFiles = await snapshot.getPromise(luFilesState(projectId));
  const locale = await snapshot.getPromise(localeState(projectId));
  const { languages, luFeatures } = await snapshot.getPromise(settingsState(projectId));
  const createdLuId = `${id}.${locale}`;
  const createdLuFile = (await luWorker.parse(id, content, luFeatures)) as LuFile;
  if (luFiles.find((lu) => lu.id === createdLuId)) {
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

  set(luFilesState(projectId), [...luFiles, ...changes]);
};

export const removeLuFileState = async (
  callbackHelpers: CallbackInterface,
  { id, projectId }: { id: string; projectId: string }
) => {
  const { set, snapshot } = callbackHelpers;
  let luFiles = await snapshot.getPromise(luFilesState(projectId));

  luFiles.forEach((file) => {
    if (getBaseName(file.id) === getBaseName(id)) {
      luFileStatusStorage.removeFileStatus(projectId, id);
    }
  });

  luFiles = luFiles.filter((file) => getBaseName(file.id) !== id);
  set(luFilesState(projectId), luFiles);
};

export const luDispatcher = () => {
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
      const { set, snapshot } = callbackHelpers;
      const luFiles = await snapshot.getPromise(luFilesState(projectId));
      const { luFeatures } = await snapshot.getPromise(settingsState(projectId));

      try {
        const updatedFile = (await luWorker.parse(id, content, luFeatures)) as LuFile;
        const result = await updateLuFileState(luFiles, updatedFile, projectId, luFeatures);
        set(luFilesState(projectId), result);
      } catch (error) {
        setError(callbackHelpers, error);
      }
    }
  );

  const updateLuIntent = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      intentName,
      intent,
      projectId,
    }: {
      id: string;
      intentName: string;
      intent: LuIntentSection;
      projectId: string;
    }) => {
      const { set, snapshot } = callbackHelpers;
      const luFiles = await snapshot.getPromise(luFilesState(projectId));
      const { luFeatures } = await snapshot.getPromise(settingsState(projectId));

      const luFile = luFiles.find((temp) => temp.id === id);
      if (!luFile) return luFiles;

      // create need sync to multi locale file.
      const originIntent = luFile.intents.find(({ Name }) => Name === intentName);
      if (!originIntent) {
        await createLuIntent({ id, intent, projectId });
        return;
      }

      try {
        const sameIdOtherLocaleFiles = luFiles.filter((file) => getBaseName(file.id) === getBaseName(id));

        // name change, need update cross multi locale file.
        if (intent.Name !== intentName) {
          const changes: LuFile[] = [];
          for (const item of sameIdOtherLocaleFiles) {
            const updatedFile = (await luWorker.updateIntent(
              item,
              intentName,
              { Name: intent.Name },
              luFeatures
            )) as LuFile;
            changes.push(updatedFile);
          }

          set(luFilesState(projectId), (luFiles) => {
            return luFiles.map((file) => {
              const changedFile = changes.find(({ id }) => id === file.id);
              return changedFile ? changedFile : file;
            });
          });
          // body change, only update current locale file
        } else {
          const updatedFile = (await luWorker.updateIntent(
            luFile,
            intentName,
            { Body: intent.Body },
            luFeatures
          )) as LuFile;
          set(luFilesState(projectId), (luFiles) => {
            return luFiles.map((file) => {
              return file.id === id ? updatedFile : file;
            });
          });
        }
      } catch (error) {
        setError(callbackHelpers, error);
      }
    }
  );

  const createLuIntent = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      intent,
      projectId,
    }: {
      id: string;
      intent: LuIntentSection;
      projectId: string;
    }) => {
      const { set, snapshot } = callbackHelpers;
      const luFiles = await snapshot.getPromise(luFilesState(projectId));
      const { luFeatures } = await snapshot.getPromise(settingsState(projectId));

      const file = luFiles.find((temp) => temp.id === id);
      if (!file) return luFiles;
      try {
        const updatedFile = (await luWorker.addIntent(file, intent, luFeatures)) as LuFile;
        const result = await updateLuFileState(luFiles, updatedFile, projectId, luFeatures);
        set(luFilesState(projectId), result);
      } catch (error) {
        setError(callbackHelpers, error);
      }
    }
  );

  const removeLuIntent = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      intentName,
      projectId,
    }: {
      id: string;
      intentName: string;
      projectId: string;
    }) => {
      const { set, snapshot } = callbackHelpers;
      const luFiles = await snapshot.getPromise(luFilesState(projectId));
      const { luFeatures } = await snapshot.getPromise(settingsState(projectId));

      const file = luFiles.find((temp) => temp.id === id);
      if (!file) return luFiles;
      try {
        const updatedFile = (await luWorker.removeIntent(file, intentName, luFeatures)) as LuFile;
        const result = await updateLuFileState(luFiles, updatedFile, projectId, luFeatures);
        set(luFilesState(projectId), result);
      } catch (error) {
        setError(callbackHelpers, error);
      }
    }
  );

  return {
    updateLuFile,
    updateLuIntent,
    createLuIntent,
    removeLuIntent,
  };
};
