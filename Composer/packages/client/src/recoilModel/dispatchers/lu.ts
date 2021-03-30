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
import { localeState, settingsState, luFileIdsState } from '../atoms/botState';
import { luFilesSelectorFamily } from '../selectors/lu';

import { luFileState } from './../atoms/botState';
import { setError } from './shared';

const intentIsNotEmpty = ({ Name, Body }) => {
  return !!Name && !!Body;
};
// fill other locale luFile new added intent with '- '
const initialBody = '- ';

/**
 * Recoil state from snapshot can be expired, use updater can make fine-gained operations.
 *
 * @param changes files need to update/add/delete
 * @param filter drop some expired changes.
 *
 */

const updateLuFiles = (
  { set }: CallbackInterface,
  projectId: string,
  changes: {
    adds?: LuFile[];
    deletes?: LuFile[];
    updates?: LuFile[];
  },
  getLatestFile?: (current: LuFile, changed: LuFile) => LuFile
) => {
  const { updates, adds, deletes } = changes;

  // updates
  updates?.forEach((luFile) => {
    set(luFileState({ projectId, luFileId: luFile.id }), (oldLuFile) =>
      getLatestFile ? getLatestFile(oldLuFile, luFile) : luFile
    );
  });

  // deletes
  if (deletes?.length) {
    const deletedIds = deletes.map((file) => file.id);
    set(luFileIdsState(projectId), (ids) => ids.filter((id) => !deletedIds.includes(id)));
  }

  // adds
  if (adds?.length) {
    const addedIds = adds.map((file) => file.id);
    adds.forEach((luFile) => {
      set(luFileState({ projectId, luFileId: luFile.id }), (oldLuFile) =>
        getLatestFile ? getLatestFile(oldLuFile, luFile) : luFile
      );
    });
    set(luFileIdsState(projectId), (ids) => [...ids, ...addedIds]);
  }
};
const getRelatedLuFileChanges = async (
  luFiles: LuFile[],
  updatedLuFile: LuFile,
  projectId: string,
  luFeatures: ILUFeaturesConfig
): Promise<LuFile[]> => {
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
      let newLuFile = (await luWorker.addIntents(item, addedIntents, luFeatures, luFiles)) as LuFile;
      newLuFile = (await luWorker.removeIntents(
        newLuFile,
        deletedIntents.map(({ Name }) => Name),
        luFeatures,
        luFiles
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
  const { snapshot } = callbackHelpers;
  const luFiles = await snapshot.getPromise(luFilesSelectorFamily(projectId));
  const locale = await snapshot.getPromise(localeState(projectId));
  const { languages, luFeatures } = await snapshot.getPromise(settingsState(projectId));
  const createdLuId = `${id}.${locale}`;
  const createdLuFile = (await luWorker.parse(id, content, luFeatures, luFiles)) as LuFile;
  if (luFiles.find((lu) => lu.id === createdLuId)) {
    setError(callbackHelpers, new Error(formatMessage('lu file already exist')));
    return;
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

  updateLuFiles(callbackHelpers, projectId, { adds: changes });
};

export const removeLuFileState = async (
  callbackHelpers: CallbackInterface,
  { id, projectId }: { id: string; projectId: string }
) => {
  const { snapshot } = callbackHelpers;
  const luFiles = await snapshot.getPromise(luFilesSelectorFamily(projectId));
  const locale = await snapshot.getPromise(localeState(projectId));

  const targetLuFile = luFiles.find((item) => item.id === id) || luFiles.find((item) => item.id === `${id}.${locale}`);
  if (!targetLuFile) {
    // eslint-disable-next-line format-message/literal-pattern
    setError(callbackHelpers, new Error(formatMessage(`remove lu file ${id} not exist`)));
    return;
  }

  luFiles.forEach((file) => {
    if (file.id === targetLuFile.id) {
      luFileStatusStorage.removeFileStatus(projectId, targetLuFile.id);
    }
  });
  updateLuFiles(callbackHelpers, projectId, { deletes: [targetLuFile] });
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
      //set content first
      set(luFileState({ projectId, luFileId: id }), (prevLuFile) => {
        return {
          ...prevLuFile,
          content,
        };
      });

      const luFiles = await snapshot.getPromise(luFilesSelectorFamily(projectId));
      const { luFeatures } = await snapshot.getPromise(settingsState(projectId));

      try {
        const updatedFile = (await luWorker.parse(id, content, luFeatures, luFiles)) as LuFile;
        const updatedFiles = await getRelatedLuFileChanges(luFiles, updatedFile, projectId, luFeatures);
        // compare to drop expired change on current id file.
        /**
         * Why other methods do not need double check content?
         * Because this method already did set content before call luFilesAtomUpdater.
         */
        updateLuFiles(callbackHelpers, projectId, { updates: updatedFiles }, (current, changed) => {
          // compare to drop expired content already setted above.
          if (current.id === id && current?.content !== changed?.content) return current;
          return changed;
        });
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
      const { snapshot } = callbackHelpers;
      const luFiles = await snapshot.getPromise(luFilesSelectorFamily(projectId));
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
              luFeatures,
              luFiles
            )) as LuFile;
            changes.push(updatedFile);
          }
          updateLuFiles(callbackHelpers, projectId, { updates: changes });
          // body change, only update current locale file
        } else {
          const updatedFile = (await luWorker.updateIntent(
            luFile,
            intentName,
            { Body: intent.Body },
            luFeatures,
            luFiles
          )) as LuFile;
          updateLuFiles(callbackHelpers, projectId, { updates: [updatedFile] });
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
      const { snapshot } = callbackHelpers;
      const luFiles = await snapshot.getPromise(luFilesSelectorFamily(projectId));
      const { luFeatures } = await snapshot.getPromise(settingsState(projectId));

      const file = luFiles.find((temp) => temp.id === id);
      if (!file) return luFiles;
      try {
        const updatedFile = (await luWorker.addIntent(file, intent, luFeatures, luFiles)) as LuFile;
        const updatedFiles = await getRelatedLuFileChanges(luFiles, updatedFile, projectId, luFeatures);
        updateLuFiles(callbackHelpers, projectId, { updates: updatedFiles });
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
      const { snapshot } = callbackHelpers;
      const luFiles = await snapshot.getPromise(luFilesSelectorFamily(projectId));
      const { luFeatures } = await snapshot.getPromise(settingsState(projectId));

      const file = luFiles.find((temp) => temp.id === id);
      if (!file) return luFiles;
      try {
        const updatedFile = (await luWorker.removeIntent(file, intentName, luFeatures, luFiles)) as LuFile;
        const updatedFiles = await getRelatedLuFileChanges(luFiles, updatedFile, projectId, luFeatures);
        updateLuFiles(callbackHelpers, projectId, { updates: updatedFiles });
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
