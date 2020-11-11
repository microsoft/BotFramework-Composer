/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import findIndex from 'lodash/findIndex';
import { CallbackInterface, useRecoilCallback } from 'recoil';

import { BotStatus } from '../../constants';
import settingStorage from '../../utils/dialogSettingStorage';
import { getFileNameFromPath } from '../../utils/fileUtil';
import httpClient from '../../utils/httpUtil';
import luFileStatusStorage from '../../utils/luFileStatusStorage';
import { navigateTo } from '../../utils/navigation';
import { projectIdCache } from '../../utils/projectCache';
import qnaFileStatusStorage from '../../utils/qnaFileStatusStorage';
import {
  botErrorState,
  botNameIdentifierState,
  botOpeningState,
  botProjectIdsState,
  botProjectSpaceLoadedState,
  botStatusState,
  currentProjectIdState,
  filePersistenceState,
  projectMetaDataState,
} from '../atoms';
import { dispatcherState } from '../DispatcherWrapper';

import { announcementState, boilerplateVersionState, recentProjectsState, templateIdState } from './../atoms';
import { logMessage, setError } from './../dispatchers/shared';
import {
  checkIfBotExistsInBotProjectFile,
  createNewBotFromTemplate,
  fetchProjectDataById,
  flushExistingTasks,
  getSkillNameIdentifier,
  handleProjectFailure,
  initBotState,
  loadProjectData,
  navigateToBot,
  openLocalSkill,
  openRemoteSkill,
  openRootBotAndSkillsByPath,
  openRootBotAndSkillsByProjectId,
  removeRecentProject,
  resetBotStates,
  saveProject,
} from './utils/project';

export const projectDispatcher = () => {
  const removeSkillFromBotProject = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectIdToRemove: string) => {
      try {
        const { set, snapshot } = callbackHelpers;
        const dispatcher = await snapshot.getPromise(dispatcherState);
        await dispatcher.removeSkillFromBotProjectFile(projectIdToRemove);

        set(botProjectIdsState, (currentProjects) => {
          const filtered = currentProjects.filter((id) => id !== projectIdToRemove);
          return filtered;
        });
        resetBotStates(callbackHelpers, projectIdToRemove);
      } catch (ex) {
        setError(callbackHelpers, ex);
      }
    }
  );

  const replaceSkillInBotProject = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectIdToRemove: string, path: string, storageId = 'default') => {
      try {
        const { snapshot } = callbackHelpers;
        const dispatcher = await snapshot.getPromise(dispatcherState);
        const projectIds = await snapshot.getPromise(botProjectIdsState);
        const indexToReplace = findIndex(projectIds, (id) => id === projectIdToRemove);
        if (indexToReplace === -1) {
          return;
        }
        await dispatcher.removeSkillFromBotProject(projectIdToRemove);
        await dispatcher.addExistingSkillToBotProject(path, storageId);
      } catch (ex) {
        setError(callbackHelpers, ex);
      }
    }
  );

  const addExistingSkillToBotProject = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (path: string, storageId = 'default'): Promise<void> => {
      const { set, snapshot } = callbackHelpers;
      try {
        set(botOpeningState, true);
        const dispatcher = await snapshot.getPromise(dispatcherState);
        const botExists = await checkIfBotExistsInBotProjectFile(callbackHelpers, path);
        if (botExists) {
          throw new Error(
            formatMessage('This operation cannot be completed. The skill is already part of the Bot Project')
          );
        }
        const skillNameIdentifier: string = await getSkillNameIdentifier(callbackHelpers, getFileNameFromPath(path));

        const { projectId, mainDialog } = await openLocalSkill(callbackHelpers, path, storageId, skillNameIdentifier);
        if (!mainDialog) {
          const error = await snapshot.getPromise(botErrorState(projectId));
          throw error;
        }

        set(botProjectIdsState, (current) => [...current, projectId]);
        await dispatcher.addLocalSkillToBotProjectFile(projectId);
      } catch (ex) {
        handleProjectFailure(callbackHelpers, ex);
      } finally {
        set(botOpeningState, false);
      }
    }
  );

  const addRemoteSkillToBotProject = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (manifestUrl: string, endpointName: string) => {
      const { set, snapshot } = callbackHelpers;
      try {
        const dispatcher = await snapshot.getPromise(dispatcherState);
        const botExists = await checkIfBotExistsInBotProjectFile(callbackHelpers, manifestUrl, true);
        if (botExists) {
          throw new Error(
            formatMessage('This operation cannot be completed. The skill is already part of the Bot Project')
          );
        }

        set(botOpeningState, true);
        const { projectId } = await openRemoteSkill(callbackHelpers, manifestUrl);
        set(botProjectIdsState, (current) => [...current, projectId]);
        await dispatcher.addRemoteSkillToBotProjectFile(projectId, manifestUrl, endpointName);
      } catch (ex) {
        handleProjectFailure(callbackHelpers, ex);
      } finally {
        set(botOpeningState, false);
      }
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
        const skillNameIdentifier: string = await getSkillNameIdentifier(callbackHelpers, getFileNameFromPath(name));
        set(botNameIdentifierState(projectId), skillNameIdentifier);
        set(projectMetaDataState(projectId), {
          isRemote: false,
          isRootBot: false,
        });
        set(botProjectIdsState, (current) => [...current, projectId]);
        await dispatcher.addLocalSkillToBotProjectFile(projectId);
        navigateToBot(callbackHelpers, projectId, mainDialog, qnaKbUrls, templateId);
        return projectId;
      } catch (ex) {
        handleProjectFailure(callbackHelpers, ex);
      } finally {
        set(botOpeningState, false);
      }
    }
  );

  const openProject = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (path: string, storageId = 'default', navigate = true) => {
      const { set } = callbackHelpers;
      try {
        set(botOpeningState, true);
        await flushExistingTasks(callbackHelpers);
        const { projectId, mainDialog } = await openRootBotAndSkillsByPath(callbackHelpers, path, storageId);

        // Post project creation
        set(projectMetaDataState(projectId), {
          isRootBot: true,
          isRemote: false,
        });
        projectIdCache.set(projectId);
        if (navigate) {
          navigateToBot(callbackHelpers, projectId, mainDialog);
        }
      } catch (ex) {
        set(botProjectIdsState, []);
        removeRecentProject(callbackHelpers, path);
        handleProjectFailure(callbackHelpers, ex);
        navigateTo('/home');
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

      // Post project creation
      set(projectMetaDataState(projectId), {
        isRootBot: true,
        isRemote: false,
      });
      projectIdCache.set(projectId);
    } catch (ex) {
      set(botProjectIdsState, []);
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
      const {
        templateId,
        name,
        description,
        location,
        schemaUrl,
        locale,
        qnaKbUrls,
        templateDir,
        eTag,
        urlSuffix,
        alias,
        preserveRoot,
      } = newProjectData;
      const { projectId, mainDialog } = await createNewBotFromTemplate(
        callbackHelpers,
        templateId,
        name,
        description,
        location,
        schemaUrl,
        locale,
        templateDir,
        eTag,
        alias,
        preserveRoot
      );
      set(botProjectIdsState, [projectId]);

      // Post project creation
      set(projectMetaDataState(projectId), {
        isRootBot: true,
        isRemote: false,
      });
      projectIdCache.set(projectId);
      navigateToBot(callbackHelpers, projectId, mainDialog, qnaKbUrls, templateId, urlSuffix);
    } catch (ex) {
      set(botProjectIdsState, []);
      handleProjectFailure(callbackHelpers, ex);
      navigateTo('/home');
    } finally {
      set(botOpeningState, false);
    }
  });

  const saveProjectAs = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (oldProjectId, name, description, location) => {
      const { set } = callbackHelpers;
      try {
        await flushExistingTasks(callbackHelpers);
        set(botOpeningState, true);
        const { projectId, mainDialog } = await saveProject(callbackHelpers, {
          oldProjectId,
          name,
          description,
          location,
        });

        // Post project creation
        set(projectMetaDataState(projectId), {
          isRootBot: true,
          isRemote: false,
        });
        projectIdCache.set(projectId);
        navigateToBot(callbackHelpers, projectId, mainDialog);
      } catch (ex) {
        set(botProjectIdsState, []);
        handleProjectFailure(callbackHelpers, ex);
        navigateTo('/home');
      } finally {
        set(botOpeningState, false);
      }
    }
  );

  const deleteBot = useRecoilCallback((callbackHelpers: CallbackInterface) => async (projectId: string) => {
    try {
      const { reset } = callbackHelpers;
      await httpClient.delete(`/projects/${projectId}`);
      luFileStatusStorage.removeAllStatuses(projectId);
      qnaFileStatusStorage.removeAllStatuses(projectId);
      settingStorage.remove(projectId);
      projectIdCache.clear();
      resetBotStates(callbackHelpers, projectId);
      reset(botProjectIdsState);
      reset(currentProjectIdState);
      reset(botProjectSpaceLoadedState);
    } catch (e) {
      logMessage(callbackHelpers, e.message);
    }
  });

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

  const reloadProject = async (callbackHelpers: CallbackInterface, response: any) => {
    callbackHelpers.reset(filePersistenceState(response.data.id));
    const { projectData, botFiles } = loadProjectData(response);

    await initBotState(callbackHelpers, projectData, botFiles);
  };

  /** Resets the file persistence of a project, and then reloads the bot state. */
  const reloadExistingProject = useRecoilCallback((callbackHelpers: CallbackInterface) => async (projectId: string) => {
    callbackHelpers.reset(filePersistenceState(projectId));
    const { projectData, botFiles } = await fetchProjectDataById(projectId);
    await initBotState(callbackHelpers, projectData, botFiles);
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
    replaceSkillInBotProject,
    reloadProject,
    reloadExistingProject,
  };
};
