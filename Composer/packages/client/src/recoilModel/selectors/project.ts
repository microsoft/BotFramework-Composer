// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selector } from 'recoil';

import { dispatcherState } from '../DispatcherWrapper';
import { Dispatcher } from '../dispatchers';
import { botErrorState, botProjectSpaceProjectIds, projectMetaDataState } from '../atoms';

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
    addExistingSkillToBotProject: async (path: string, storageId = 'default') => {
      const projectId: string = await dispatcher.addExistingSkillToBotProject(path, storageId);

      await dispatcher.addSkillToBotProject(projectId);
    },
    addNewSkillToBotProject: async (
      templateId: string,
      name: string,
      description: string,
      location: string,
      schemaUrl?: string,
      locale?: string,
      qnaKbUrls?: string[]
    ) => {
      await dispatcher.addNewSkillToBotProject(templateId, name, description, location, schemaUrl, locale, qnaKbUrls);
    },
    addRemoteSkillToBotProject: async (manifestUrl: string, name: string, endpointName: string) => {
      await dispatcher.addRemoteSkillToBotProject(manifestUrl, name, endpointName);
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

export const botProjectsDataSelector = selector({
  key: 'botProjectsDataSelector',
  get: ({ get }) => {
    const botProjectIds = get(botProjectSpaceProjectIds);
    return botProjectIds.map((projectId: string) => {
      const metaData = get(projectMetaDataState(projectId));
      return {
        projectId,
        ...metaData,
      };
    });
  },
});
