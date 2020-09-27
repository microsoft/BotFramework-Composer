// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { useRecoilCallback, CallbackInterface } from 'recoil';
import cloneDeep from 'lodash/cloneDeep';
import difference from 'lodash/difference';

import languageStorage from '../../utils/languageStorage';
import { getExtension } from '../../utils/fileUtil';

import {
  lgFilesState,
  luFilesState,
  localeState,
  settingsState,
  showAddLanguageModalState,
  onAddLanguageDialogCompleteState,
  onDelLanguageDialogCompleteState,
  showDelLanguageModalState,
  botDisplayNameState,
} from './../atoms/botState';

const copyLanguageResources = (files: any[], fromLanguage: string, toLanguages: string[]): any[] => {
  const copiedFiles: any = [];
  const copyOriginFiles = files.filter(({ id }) => getExtension(id) === fromLanguage);

  for (const file of copyOriginFiles) {
    for (const toLanguage of toLanguages) {
      // eslint-disable-next-line security/detect-non-literal-regexp
      const id = file.id.replace(new RegExp(`${fromLanguage}$`), toLanguage);
      copiedFiles.push({
        ...file,
        id,
      });
    }
  }

  return copiedFiles;
};

// pull out target language file
const deleteLanguageResources = (
  files: any[],
  languages: string[]
): {
  left: any[];
  deletes: any[];
} => {
  const left = files.filter(({ id }) => !languages.includes(getExtension(id)));
  const deletes = files.filter(({ id }) => languages.includes(getExtension(id)));
  return {
    left,
    deletes,
  };
};

export const multilangDispatcher = () => {
  const setLocale = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (locale: string, projectId: string) => {
      const botName = await snapshot.getPromise(botDisplayNameState(projectId));

      set(localeState(projectId), locale);
      languageStorage.setLocale(botName, locale);
    }
  );

  const addLanguages = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ languages, defaultLang, switchTo = false, projectId }) => {
      const { set, snapshot } = callbackHelpers;
      const botName = await snapshot.getPromise(botDisplayNameState(projectId));
      const prevlgFiles = await snapshot.getPromise(lgFilesState(projectId));
      const prevluFiles = await snapshot.getPromise(luFilesState(projectId));
      const prevSettings = await snapshot.getPromise(settingsState(projectId));
      const onAddLanguageDialogComplete = (await snapshot.getPromise(onAddLanguageDialogCompleteState(projectId))).func;

      // copy files from default language
      const lgFiles = copyLanguageResources(prevlgFiles, defaultLang, languages);
      const luFiles = copyLanguageResources(prevluFiles, defaultLang, languages);

      const settings: any = cloneDeep(prevSettings);
      if (Array.isArray(settings.languages)) {
        settings.languages.push(...languages);
      } else {
        settings.languages = languages;
      }

      if (switchTo) {
        const switchToLocale = languages[0];
        set(localeState(projectId), switchToLocale);
        languageStorage.setLocale(botName, switchToLocale);
      }

      set(lgFilesState(projectId), [...prevlgFiles, ...lgFiles]);
      set(luFilesState(projectId), [...prevluFiles, ...luFiles]);
      set(settingsState(projectId), settings);

      if (typeof onAddLanguageDialogComplete === 'function') {
        onAddLanguageDialogComplete(languages);
      }

      set(showAddLanguageModalState(projectId), false);
      set(onAddLanguageDialogCompleteState(projectId), { func: undefined });
    }
  );

  const deleteLanguages = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ languages, projectId }) => {
      const { set, snapshot } = callbackHelpers;
      const prevlgFiles = await snapshot.getPromise(lgFilesState(projectId));
      const prevluFiles = await snapshot.getPromise(luFilesState(projectId));
      const prevSettings = await snapshot.getPromise(settingsState(projectId));
      const onDelLanguageDialogComplete = (await snapshot.getPromise(onDelLanguageDialogCompleteState(projectId))).func;

      // copy files from default language
      const { left: leftLgFiles } = deleteLanguageResources(prevlgFiles, languages);
      const { left: leftLuFiles } = deleteLanguageResources(prevluFiles, languages);

      const settings: any = cloneDeep(prevSettings);

      const leftLanguages = difference(settings.languages, languages);
      settings.languages = leftLanguages;

      set(lgFilesState(projectId), leftLgFiles);
      set(luFilesState(projectId), leftLuFiles);
      set(settingsState(projectId), settings);

      if (typeof onDelLanguageDialogComplete === 'function') {
        onDelLanguageDialogComplete(leftLanguages);
      }

      set(showDelLanguageModalState(projectId), false);
      set(onDelLanguageDialogCompleteState(projectId), { func: undefined });
    }
  );

  const addLanguageDialogBegin = useRecoilCallback(
    ({ set }: CallbackInterface) => async (projectId: string, onComplete) => {
      set(showAddLanguageModalState(projectId), true);
      set(onAddLanguageDialogCompleteState(projectId), { func: onComplete });
    }
  );

  const addLanguageDialogCancel = useRecoilCallback(({ set }: CallbackInterface) => async (projectId: string) => {
    set(showAddLanguageModalState(projectId), false);
    set(onAddLanguageDialogCompleteState(projectId), { func: undefined });
  });

  const delLanguageDialogBegin = useRecoilCallback(
    ({ set }: CallbackInterface) => async (projectId: string, onComplete) => {
      set(showDelLanguageModalState(projectId), true);
      set(onDelLanguageDialogCompleteState(projectId), { func: onComplete });
    }
  );

  const delLanguageDialogCancel = useRecoilCallback(({ set }: CallbackInterface) => async (projectId: string) => {
    set(showDelLanguageModalState(projectId), false);
    set(onDelLanguageDialogCompleteState(projectId), { func: undefined });
  });

  return {
    setLocale,
    addLanguages,
    deleteLanguages,
    addLanguageDialogBegin,
    addLanguageDialogCancel,
    delLanguageDialogBegin,
    delLanguageDialogCancel,
  };
};
