/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilCallback, CallbackInterface } from 'recoil';
import formatMessage from 'format-message';
import isNumber from 'lodash/isNumber';

import httpClient from '../../utils/httpUtil';
import { BotStatus } from '../../constants';
import luFileStatusStorage from '../../utils/luFileStatusStorage';
import qnaFileStatusStorage from '../../utils/qnaFileStatusStorage';
import settingStorage from '../../utils/dialogSettingStorage';
import { navigateTo } from '../../utils/navigation';
import { projectIdCache } from '../../utils/projectCache';
import {
  botProjectIdsState,
  currentProjectIdState,
  botStatusState,
  botOpeningState,
  projectMetaDataState,
} from '../atoms';
import { dispatcherState } from '../DispatcherWrapper';

import { recentProjectsState, templateIdState, announcementState, boilerplateVersionState } from './../atoms';
import { logMessage, setError } from './../dispatchers/shared';
import {
  flushExistingTasks,
  handleProjectFailure,
  navigateToBot,
  openLocalSkill,
  saveProject,
  removeRecentProject,
  createNewBotFromTemplate,
  resetBotStates,
  openRemoteSkill,
  openRootBotAndSkillsByProjectId,
  openRootBotAndSkillsByPath,
} from './utils/project';

export const projectDispatcher = () => {
  const removeSkillFromBotProject = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectId: string) => {
      try {
        const { set } = callbackHelpers;
        set(botProjectIdsState, (currentProjects) => currentProjects.filter((id) => id !== projectId));
        resetBotStates(callbackHelpers, projectId);
      } catch (ex) {
        setError(callbackHelpers, ex);
      }
    }
  );

  const addExistingSkillToBotProject = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (
      path: string,
      storageId = 'default',
      pushIndex?: number
    ): Promise<string> => {
      const { set, snapshot } = callbackHelpers;
      const dispatcher = await snapshot.getPromise(dispatcherState);
      set(botOpeningState, true);
      const { projectId } = await openLocalSkill(callbackHelpers, path, storageId);
      if (isNumber(pushIndex)) {
        set(botProjectIdsState, (current: string[]) => {
          const mutated = [...current];
          mutated.splice(pushIndex, 0, projectId);
          return mutated;
        });
      } else {
        set(botProjectIdsState, (current) => [...current, projectId]);
      }
      await dispatcher.addSkillToBotProjectFile(projectId);
      set(botOpeningState, false);
      return projectId;
    }
  );

  const addRemoteSkillToBotProject = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (
      manifestUrl: string,
      name: string,
      endpointName: string,
      pushIndex?: number
    ) => {
      const { set, snapshot } = callbackHelpers;
      const dispatcher = await snapshot.getPromise(dispatcherState);

      set(botOpeningState, true);
      const { projectId } = await openRemoteSkill(callbackHelpers, manifestUrl, name);
      if (isNumber(pushIndex)) {
        set(botProjectIdsState, (current: string[]) => {
          const mutated = [...current];
          mutated.splice(pushIndex, 0, projectId);
          return mutated;
        });
      } else {
        set(botProjectIdsState, (current) => [...current, projectId]);
      }
      await dispatcher.addSkillToBotProjectFile(projectId);
      set(botOpeningState, false);
    }
  );

  const addNewSkillToBotProject = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (newProjectData: any) => {
      const { set, snapshot } = callbackHelpers;
      const dispatcher = await snapshot.getPromise(dispatcherState);
      try {
        const { templateId, name, description, location, schemaUrl, locale, qnaKbUrls } = newProjectData;
        set(botOpeningState, true);
        const { projectId, mainDialog } = await createNewBotFromTemplate(
          callbackHelpers,
          templateId,
          name,
          description,
          location,
          schemaUrl,
          locale
        );
        set(projectMetaDataState(projectId), {
          isRemote: false,
          isRootBot: false,
        });
        set(botProjectIdsState, (current) => [...current, projectId]);
        await dispatcher.addSkillToBotProjectFile(projectId);
        navigateToBot(projectId, mainDialog, qnaKbUrls, templateId);
        return projectId;
      } catch (ex) {
        set(botProjectIdsState, []);
        handleProjectFailure(callbackHelpers, ex);
      } finally {
        set(botOpeningState, false);
      }
    }
  );

  const openProject = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (path: string, storageId = 'default') => {
      const { set } = callbackHelpers;
      try {
        await flushExistingTasks(callbackHelpers);
        set(botOpeningState, true);
        const { projectId, mainDialog } = await openRootBotAndSkillsByPath(callbackHelpers, path, storageId);
        set(projectMetaDataState(projectId), {
          isRootBot: true,
          isRemote: false,
        });
        projectIdCache.set(projectId);
        navigateToBot(projectId, mainDialog);
      } catch (ex) {
        set(botProjectIdsState, []);
        projectIdCache.clear();
        removeRecentProject(callbackHelpers, path);
        handleProjectFailure(callbackHelpers, ex);
      } finally {
        set(botOpeningState, false);
      }
    }
  );

  const fetchProjectById = useRecoilCallback((callbackHelpers: CallbackInterface) => async (projectId: string) => {
    const { set } = callbackHelpers;
    try {
      await flushExistingTasks(callbackHelpers);
      set(botOpeningState, true);
      await openRootBotAndSkillsByProjectId(callbackHelpers, projectId);
      set(projectMetaDataState(projectId), {
        isRootBot: true,
        isRemote: false,
      });
    } catch (ex) {
      set(botProjectIdsState, []);
      projectIdCache.clear();
      handleProjectFailure(callbackHelpers, ex);
      navigateTo('/home');
    } finally {
      set(botOpeningState, false);
    }
  });

  const createNewBot = useRecoilCallback((callbackHelpers: CallbackInterface) => async (newProjectData: any) => {
    const { set } = callbackHelpers;
    try {
      await flushExistingTasks(callbackHelpers);
      set(botOpeningState, true);
      const { templateId, name, description, location, schemaUrl, locale, qnaKbUrls } = newProjectData;
      const { projectId, mainDialog } = await createNewBotFromTemplate(
        callbackHelpers,
        templateId,
        name,
        description,
        location,
        schemaUrl,
        locale
      );
      projectIdCache.set(projectId);
      set(projectMetaDataState(projectId), {
        isRootBot: true,
        isRemote: false,
      });
      set(botProjectIdsState, [projectId]);
      set(currentProjectIdState, projectId);
      navigateToBot(projectId, mainDialog, qnaKbUrls, templateId);
      return projectId;
    } catch (ex) {
      set(botProjectIdsState, []);
      projectIdCache.clear();
      handleProjectFailure(callbackHelpers, ex);
      navigateTo('/home');
    } finally {
      set(botOpeningState, false);
    }
  });

  const deleteBot = useRecoilCallback((callbackHelpers: CallbackInterface) => async (projectId: string) => {
    try {
      await httpClient.delete(`/projects/${projectId}`);
      luFileStatusStorage.removeAllStatuses(projectId);
      qnaFileStatusStorage.removeAllStatuses(projectId);
      settingStorage.remove(projectId);
      projectIdCache.clear();
      resetBotStates(callbackHelpers, projectId);
    } catch (e) {
      logMessage(callbackHelpers, e.message);
    }
  });

  const saveProjectAs = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (oldProjectId, name, description, location) => {
      try {
        const { set } = callbackHelpers;
        set(botOpeningState, true);
        await flushExistingTasks(callbackHelpers);
        const { projectId, mainDialog } = await saveProject(callbackHelpers, {
          oldProjectId,
          name,
          description,
          location,
        });
        projectIdCache.set(projectId);
        set(projectMetaDataState(projectId), {
          isRootBot: true,
          isRemote: false,
        });
        set(botProjectIdsState, [projectId]);
        set(currentProjectIdState, projectId);
        navigateToBot(projectId, mainDialog);
        set(botOpeningState, false);
        return projectId;
      } catch (ex) {
        handleProjectFailure(callbackHelpers, ex);
        logMessage(callbackHelpers, ex.message);
      }
    }
  );

  const fetchRecentProjects = useRecoilCallback((callbackHelpers: CallbackInterface) => async () => {
    const { set } = callbackHelpers;
    try {
      const response = await httpClient.get(`/projects/recent`);
      set(recentProjectsState, response.data);
    } catch (ex) {
      set(recentProjectsState, []);
      logMessage(callbackHelpers, `Error in fetching recent projects: ${ex}`);
    }
  });

  const setBotStatus = useRecoilCallback<[BotStatus, string], void>(
    ({ set }: CallbackInterface) => (status: BotStatus, projectId: string) => {
      set(botStatusState(projectId), status);
    }
  );

  const saveTemplateId = useRecoilCallback<[string], void>(({ set }: CallbackInterface) => (templateId) => {
    if (templateId) {
      set(templateIdState, templateId);
    }
  });

  const updateBoilerplate = useRecoilCallback((callbackHelpers: CallbackInterface) => async (projectId: string) => {
    try {
      await httpClient.post(`/projects/${projectId}/updateBoilerplate`);
      callbackHelpers.set(announcementState, formatMessage('Scripts successfully updated.'));
    } catch (ex) {
      setError(callbackHelpers, ex);
    }
  });

  const getBoilerplateVersion = useRecoilCallback((callbackHelpers: CallbackInterface) => async (projectId: string) => {
    try {
      const response = await httpClient.get(`/projects/${projectId}/boilerplateVersion`);
      const { updateRequired, latestVersion, currentVersion } = response.data;
      callbackHelpers.set(boilerplateVersionState, { updateRequired, latestVersion, currentVersion });
    } catch (ex) {
      setError(callbackHelpers, ex);
    }
  });

  return {
    openProject,
    createNewBot,
    deleteBot,
    saveProjectAs,
    fetchProjectById,
    fetchRecentProjects,
    setBotStatus,
    saveTemplateId,
    updateBoilerplate,
    getBoilerplateVersion,
    removeSkillFromBotProject,
    addNewSkillToBotProject,
    addExistingSkillToBotProject,
    addRemoteSkillToBotProject,
  };
};
