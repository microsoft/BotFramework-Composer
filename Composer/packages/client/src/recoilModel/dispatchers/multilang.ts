// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { useRecoilCallback, CallbackInterface } from 'recoil';
import cloneDeep from 'lodash/cloneDeep';
import difference from 'lodash/difference';

import languageStorage from '../../utils/languageStorage';
import { getExtension } from '../../utils/fileUtil';
import { localBotsDataSelector, rootBotProjectIdSelector } from '../selectors/project';
import { lgFilesSelectorFamily } from '../selectors/lg';
import { luFilesSelectorFamily, qnaFilesSelectorFamily } from '../selectors';

import {
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
  // When skill bot do not have the locale to be set in root bot, create it for skill bot.
  const setLocale = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (locale: string, projectId: string) => {
      const botName = await snapshot.getPromise(botDisplayNameState(projectId));
      const botProjects = await snapshot.getPromise(localBotsDataSelector);
      const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
      if (projectId === rootBotProjectId) {
        for (let i = 0; i < botProjects.length; i++) {
          if (!botProjects[i].isRootBot && !botProjects[i].isRemote) {
            const skillBotProjectId = botProjects[i].projectId;
            const settings = await snapshot.getPromise(settingsState(skillBotProjectId));
            const languages = settings.languages;
            const defaultLang = settings.defaultLanguage;
            if (!languages.includes(locale)) {
              addLanguages({
                languages: [locale],
                projectId: skillBotProjectId,
                defaultLang: defaultLang,
                switchTo: true,
              });
            }
          }
        }
      }
      set(localeState(projectId), locale);
      languageStorage.setLocale(botName, locale);
    }
  );

  const addLanguages = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ languages, defaultLang, switchTo = false, projectId }) => {
      const { set, snapshot } = callbackHelpers;
      const onAddLanguageDialogComplete = (await snapshot.getPromise(onAddLanguageDialogCompleteState(projectId))).func;

      // copy files from default language
      set(lgFilesSelectorFamily(projectId), (oldLgFiles) => {
        const addedLgFiles = copyLanguageResources(oldLgFiles, defaultLang, languages);
        return [...oldLgFiles, ...addedLgFiles];
      });
      set(luFilesSelectorFamily(projectId), (prevluFiles) => {
        const addedLuFiles = copyLanguageResources(prevluFiles, defaultLang, languages);
        return [...prevluFiles, ...addedLuFiles];
      });
      set(qnaFilesSelectorFamily(projectId), (prevQnAFiles) => {
        const addedQnAFiles = copyLanguageResources(prevQnAFiles, defaultLang, languages);
        return [...prevQnAFiles, ...addedQnAFiles];
      });
      set(settingsState(projectId), (prevSettings) => {
        const settings: any = cloneDeep(prevSettings);
        if (Array.isArray(settings.languages)) {
          settings.languages.push(...languages);
        } else {
          settings.languages = languages;
        }
        if (typeof onAddLanguageDialogComplete === 'function') {
          onAddLanguageDialogComplete(languages);
        }
        return settings;
      });

      //Set active language and update skill bot's active language
      if (switchTo) {
        const switchToLocale = languages[0];
        setLocale(switchToLocale, projectId);
      }

      set(showAddLanguageModalState(projectId), false);
      set(onAddLanguageDialogCompleteState(projectId), { func: undefined });
    }
  );

  const deleteLanguages = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ languages, projectId }) => {
      const { set, snapshot } = callbackHelpers;
      const onDelLanguageDialogComplete = (await snapshot.getPromise(onDelLanguageDialogCompleteState(projectId))).func;

      // copy files from default language
      set(lgFilesSelectorFamily(projectId), (prevLgFiles) => {
        const { left: leftLgFiles } = deleteLanguageResources(prevLgFiles, languages);
        return leftLgFiles;
      });
      set(luFilesSelectorFamily(projectId), (prevLuFiles) => {
        const { left: leftLuFiles } = deleteLanguageResources(prevLuFiles, languages);
        return leftLuFiles;
      });
      set(qnaFilesSelectorFamily(projectId), (prevQnAFiles) => {
        const { left: leftQnAFiles } = deleteLanguageResources(prevQnAFiles, languages);
        return leftQnAFiles;
      });
      set(settingsState(projectId), (prevSettings) => {
        const settings: any = cloneDeep(prevSettings);

        const leftLanguages = difference(settings.languages, languages);
        settings.languages = leftLanguages;
        if (typeof onDelLanguageDialogComplete === 'function') {
          onDelLanguageDialogComplete(leftLanguages);
        }
        return settings;
      });

      set(showDelLanguageModalState(projectId), false);
      set(onDelLanguageDialogCompleteState(projectId), { func: undefined });

      //use default language as active language if active language is deleted
      const botName = await snapshot.getPromise(botDisplayNameState(projectId));
      const currentActiveLanguage = languageStorage.get(botName)?.locale;
      if (languages.includes(currentActiveLanguage)) {
        const { defaultLanguage } = await snapshot.getPromise(settingsState(projectId));
        set(localeState(projectId), defaultLanguage);
        languageStorage.setLocale(botName, defaultLanguage);
      }
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
