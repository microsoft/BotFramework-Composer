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
  botNameState,
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
  const setLocale = useRecoilCallback(({ set, snapshot }: CallbackInterface) => async (locale: string) => {
    const botName = await snapshot.getPromise(botNameState);

    set(localeState, locale);
    languageStorage.setLocale(botName, locale);
  });

  const addLanguages = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ languages, defaultLang, switchTo = false }) => {
      const { set, snapshot } = callbackHelpers;
      const botName = await snapshot.getPromise(botNameState);
      const prevlgFiles = await snapshot.getPromise(lgFilesState);
      const prevluFiles = await snapshot.getPromise(luFilesState);
      const prevSettings = await snapshot.getPromise(settingsState);
      const onAddLanguageDialogComplete = (await snapshot.getPromise(onAddLanguageDialogCompleteState)).func;

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
        set(localeState, switchToLocale);
        languageStorage.setLocale(botName, switchToLocale);
      }

      set(lgFilesState, [...prevlgFiles, ...lgFiles]);
      set(luFilesState, [...prevluFiles, ...luFiles]);
      set(settingsState, settings);

      if (typeof onAddLanguageDialogComplete === 'function') {
        onAddLanguageDialogComplete(languages);
      }

      set(showAddLanguageModalState, false);
      set(onAddLanguageDialogCompleteState, { func: undefined });
    }
  );

  const deleteLanguages = useRecoilCallback((callbackHelpers: CallbackInterface) => async ({ languages }) => {
    const { set, snapshot } = callbackHelpers;
    const prevlgFiles = await snapshot.getPromise(lgFilesState);
    const prevluFiles = await snapshot.getPromise(luFilesState);
    const prevSettings = await snapshot.getPromise(settingsState);
    const onDelLanguageDialogComplete = (await snapshot.getPromise(onDelLanguageDialogCompleteState)).func;

    // copy files from default language
    const { left: leftLgFiles } = deleteLanguageResources(prevlgFiles, languages);
    const { left: leftLuFiles } = deleteLanguageResources(prevluFiles, languages);

    const settings: any = cloneDeep(prevSettings);

    const leftLanguages = difference(settings.languages, languages);
    settings.languages = leftLanguages;

    set(lgFilesState, leftLgFiles);
    set(luFilesState, leftLuFiles);
    set(settingsState, settings);

    if (typeof onDelLanguageDialogComplete === 'function') {
      onDelLanguageDialogComplete(leftLanguages);
    }

    set(showDelLanguageModalState, false);
    set(onDelLanguageDialogCompleteState, { func: undefined });
  });

  const addLanguageDialogBegin = useRecoilCallback(({ set }: CallbackInterface) => async (onComplete) => {
    set(showAddLanguageModalState, true);
    set(onAddLanguageDialogCompleteState, { func: onComplete });
  });

  const addLanguageDialogCancel = useRecoilCallback(({ set }: CallbackInterface) => async () => {
    set(showAddLanguageModalState, false);
    set(onAddLanguageDialogCompleteState, { func: undefined });
  });

  const delLanguageDialogBegin = useRecoilCallback(({ set }: CallbackInterface) => async (onComplete) => {
    set(showDelLanguageModalState, true);
    set(onDelLanguageDialogCompleteState, { func: onComplete });
  });

  const delLanguageDialogCancel = useRecoilCallback(({ set }: CallbackInterface) => async () => {
    set(showDelLanguageModalState, false);
    set(onDelLanguageDialogCompleteState, { func: undefined });
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
