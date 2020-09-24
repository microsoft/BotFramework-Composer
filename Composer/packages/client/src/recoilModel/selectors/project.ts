// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selector } from 'recoil';

import { dispatcherState } from '../DispatcherWrapper';
import { Dispatcher } from '../dispatchers';
import { botErrorState, botNameState, botProjectSpaceProjectIds, dialogsState, projectMetaDataState } from '../atoms';

// Actions
const projectLoadAction = (dispatcher: Dispatcher) => {
  return {
    createProject: async (
      templateId: string,
      name: string,
      description: string,
      location: string,
      schemaUrl?: string,
      locale?: string,
      qnaKbUrls?: string[]
    ) => {
      await dispatcher.createProject(templateId, name, description, location, schemaUrl, locale, qnaKbUrls);
    },
    openProject: async (path: string, storageId = 'default') => {
      await dispatcher.openProject(path, storageId);
    },
    saveProjectAs: async (projectId: string, name: string, description: string, location: string) => {
      await dispatcher.saveProjectAs(projectId, name, description, location);
    },
    fetchProjectById: async (projectId: string) => {
      await dispatcher.fetchProjectById(projectId);
    },
    addExistingSkillToBotProject: async (rootBotId: string, path: string, storageId = 'default') => {
      const skillId: string = await dispatcher.addExistingSkillToBotProject(path, storageId);
      await dispatcher.addSkillToBotProject(rootBotId, skillId, false);
    },
    addNewSkillToBotProject: async (
      rootBotId: string,
      templateId: string,
      name: string,
      description: string,
      location: string,
      schemaUrl?: string,
      locale?: string,
      qnaKbUrls?: string[]
    ) => {
      const skillId: string = await dispatcher.addNewSkillToBotProject(
        templateId,
        name,
        description,
        location,
        schemaUrl,
        locale,
        qnaKbUrls
      );
      await dispatcher.addSkillToBotProject(rootBotId, skillId, false);
    },
    addRemoteSkillToBotProject: async (rootBotId: string, manifestUrl: string, name: string, endpointName: string) => {
      const skillId = await dispatcher.addRemoteSkillToBotProject(manifestUrl, name, endpointName);
      await dispatcher.addSkillToBotProject(rootBotId, skillId, true);
    },
  };
};

export const projectLoadSelector = selector({
  key: 'projectLoadSelector',
  get: ({ get }) => {
    const dispatcher = get(dispatcherState);
    if (!dispatcher) {
      return {} as Dispatcher;
    }
    return projectLoadAction(dispatcher);
  },
});

export const botProjectsWithoutErrorsSelector = selector({
  key: 'botProjectsWithoutErrorsSelector',
  get: ({ get }) => {
    const botProjectIds = get(botProjectSpaceProjectIds);
    return botProjectIds
      .filter((projectId) => !get(botErrorState(projectId)))
      .map((projectId: string) => {
        const metaData = get(projectMetaDataState(projectId));
        return {
          projectId,
          ...metaData,
        };
      });
  },
});

export const botProjectSpaceSelector = selector({
  key: 'botProjectSpaceSelector',
  get: ({ get }) => {
    const botProjects = get(botProjectSpaceProjectIds);
    const result = botProjects.map((projectId: string) => {
      const dialogs = get(dialogsState(projectId));
      const metaData = get(projectMetaDataState(projectId));
      const botError = get(botErrorState(projectId));
      const name = get(botNameState(projectId));
      return { dialogs, projectId, name, ...metaData, error: botError };
    });
    return result;
  },
});
