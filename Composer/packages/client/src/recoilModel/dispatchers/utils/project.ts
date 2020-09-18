// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import { SensitiveProperties, convertSkillsToDictionary, DialogSetting, BotProjectSpaceSkill } from '@bfc/shared';
import objectGet from 'lodash/get';
import objectSet from 'lodash/set';
import { BotProjectSpace } from '@bfc/shared/src/types';
import { indexer } from '@bfc/indexers';

import languageStorage from '../../../utils/languageStorage';
import settingStorage from '../../../utils/dialogSettingStorage';
import { botProjectsSpaceState, filePersistenceState } from '../../atoms';
import lgWorker from '../../parsers/lgWorker';
import luWorker from '../../parsers/luWorker';
import qnaWorker from '../../parsers/qnaWorker';
import FilePersistence from '../../persistence/FilePersistence';
import { navigateTo } from '../../../utils/navigation';
import { QnABotTemplateId } from '../../../constants';
import httpClient from '../../../utils/httpUtil';

export const flushExistingTasks = async (callbackHelpers) => {
  const { snapshot } = callbackHelpers;
  const botProjectSpace = await snapshot.getPromise(botProjectsSpaceState);
  const filePersistenceHandlers: FilePersistence[] = [];
  for (const projectId of botProjectSpace) {
    const fp = await snapshot.getPromise(filePersistenceState(projectId));
    filePersistenceHandlers.push(fp);
  }
  const workers = [lgWorker, luWorker, qnaWorker, ...filePersistenceHandlers];
  return Promise.all(workers.map((w) => w.flush()));
};

// merge sensitive values in localStorage
const mergeLocalStorage = (projectId: string, settings: DialogSetting) => {
  const localSetting = settingStorage.get(projectId);
  const mergedSettings = { ...settings };
  if (localSetting) {
    for (const property of SensitiveProperties) {
      const value = objectGet(localSetting, property);
      if (value) {
        objectSet(mergedSettings, property, value);
      } else {
        objectSet(mergedSettings, property, ''); // set those key back, because that were omit after persisited
      }
    }
  }
  return mergedSettings;
};

export const getMergedSettings = (projectId, settings): DialogSetting => {
  const mergedSettings = mergeLocalStorage(projectId, settings);
  if (Array.isArray(mergedSettings.skill)) {
    const skillsArr = mergedSettings.skill.map((skillData) => ({ ...skillData }));
    mergedSettings.skill = convertSkillsToDictionary(skillsArr);
  }
  return mergedSettings;
};

export const navigateToBot = (projectId: string, mainDialog: string, qnaKbUrls?: string[], templateId?: string) => {
  if (projectId) {
    let url = `/bot/${projectId}/dialogs/${mainDialog}`;
    if (templateId === QnABotTemplateId) {
      url = `/bot/${projectId}/knowledge-base/${mainDialog}`;
      navigateTo(url, { state: { qnaKbUrls } });
      return;
    }
    navigateTo(url);
  }
};

const loadProjectData = (response) => {
  const { files, botName, settings, skills: skillContent, id: projectId } = response.data;
  const mergedSettings = getMergedSettings(projectId, settings);
  const storedLocale = languageStorage.get(botName)?.locale;
  const locale = settings.languages.includes(storedLocale) ? storedLocale : settings.defaultLanguage;
  const indexedFiles = indexer.index(files, botName, locale, skillContent, mergedSettings);
  return {
    botFiles: { ...indexedFiles, mergedSettings },
    projectData: response.data,
    error: undefined,
  };
};

export const fetchProjectDataByPath = async (
  path,
  storageId
): Promise<{ botFiles: any; projectData: any; error: any }> => {
  try {
    const response = await httpClient.put(`/projects/open`, { path, storageId });
    const projectData = loadProjectData(response);
    return projectData;
  } catch (ex) {
    return {
      botFiles: undefined,
      projectData: undefined,
      error: ex,
    };
  }
};

export const fetchProjectDataById = async (projectId): Promise<{ botFiles: any; projectData: any; error: any }> => {
  try {
    const response = await httpClient.get(`/projects/${projectId}`);
    const projectData = loadProjectData(response);
    return projectData;
  } catch (ex) {
    return {
      botFiles: undefined,
      projectData: undefined,
      error: ex,
    };
  }
};

export const parseSkillPaths = (botProjectSpace: BotProjectSpace): { path: string; remote: boolean }[] => {
  const rootBotPath = botProjectSpace.workspace.replace('file://', '');
  const result = botProjectSpace.skills.map((skill: BotProjectSpaceSkill) => {
    if (skill.workspace) {
      const { protocol } = new URL(skill.workspace);
      if (protocol === 'file:') {
        const relativeSkillPath = skill.workspace.replace('file://', '');
        const skillPath = path.resolve(rootBotPath, relativeSkillPath);
        return {
          path: path.normalize(skillPath),
          remote: false,
        };
      }
    }
    return {
      path: skill.manifest,
      remote: false,
    };
  });
  return result;
};
