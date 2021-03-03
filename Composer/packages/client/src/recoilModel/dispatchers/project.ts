/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import findIndex from 'lodash/findIndex';
import { QnABotTemplateId, RootBotManagedProperties } from '@bfc/shared';
import get from 'lodash/get';
import { CallbackInterface, useRecoilCallback } from 'recoil';

import { BotStatus } from '../../constants';
import settingStorage from '../../utils/dialogSettingStorage';
import { getFileNameFromPath } from '../../utils/fileUtil';
import httpClient from '../../utils/httpUtil';
import luFileStatusStorage from '../../utils/luFileStatusStorage';
import { navigateTo } from '../../utils/navigation';
import { getPublishProfileFromPayload } from '../../utils/electronUtil';
import { projectIdCache } from '../../utils/projectCache';
import qnaFileStatusStorage from '../../utils/qnaFileStatusStorage';
import {
  botErrorState,
  botNameIdentifierState,
  botOpeningMessage,
  botOpeningState,
  botProjectIdsState,
  botProjectSpaceLoadedState,
  botStatusState,
  createQnAOnState,
  currentProjectIdState,
  dispatcherState,
  fetchReadMePendingState,
  filePersistenceState,
  projectMetaDataState,
  selectedTemplateReadMeState,
  showCreateQnAFromUrlDialogState,
} from '../atoms';
import { botRuntimeOperationsSelector, rootBotProjectIdSelector } from '../selectors';
import { mergePropertiesManagedByRootBot } from '../../recoilModel/dispatchers/utils/project';

import { announcementState, boilerplateVersionState, recentProjectsState, templateIdState } from './../atoms';
import { logMessage, setError } from './../dispatchers/shared';
import {
  checkIfBotExistsInBotProjectFile,
  createNewBotFromTemplate,
  createNewBotFromTemplateV2,
  fetchProjectDataById,
  flushExistingTasks,
  getSkillNameIdentifier,
  handleProjectFailure,
  initBotState,
  loadProjectData,
  navigateToBot,
  navigateToSkillBot,
  openLocalSkill,
  openRemoteSkill,
  openRootBotAndSkills,
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
        const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
        const botRuntimeOperations = await snapshot.getPromise(botRuntimeOperationsSelector);

        set(botProjectIdsState, (currentProjects) => {
          const filtered = currentProjects.filter((id) => id !== projectIdToRemove);
          return filtered;
        });
        resetBotStates(callbackHelpers, projectIdToRemove);
        if (rootBotProjectId) {
          navigateToBot(callbackHelpers, rootBotProjectId, '');
        }
        botRuntimeOperations?.stopBot(projectIdToRemove);
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
        const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
        if (!rootBotProjectId) return;

        const botExists = await checkIfBotExistsInBotProjectFile(callbackHelpers, path);
        if (botExists) {
          throw new Error(
            formatMessage('This operation cannot be completed. The bot is already part of the Bot Project')
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
        navigateToSkillBot(rootBotProjectId, projectId, mainDialog);
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
        const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
        if (!rootBotProjectId) return;

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
        navigateToSkillBot(rootBotProjectId, projectId);
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
        const { templateId, name, description, location, schemaUrl, locale } = newProjectData;
        set(botOpeningState, true);
        const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
        if (!rootBotProjectId) return;
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
        navigateToSkillBot(rootBotProjectId, projectId, mainDialog);
        return projectId;
      } catch (ex) {
        handleProjectFailure(callbackHelpers, ex);
      } finally {
        set(botOpeningState, false);
      }
    }
  );

  const openProject = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (
      path: string,
      storageId = 'default',
      navigate = true,
      callback?: (projectId: string) => void
    ) => {
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

        //migration on some sensitive property in browser local storage
        for (const property of RootBotManagedProperties) {
          const settings = settingStorage.get(projectId);
          const value = get(settings, property, '');
          if (!value.root && value.root !== '') {
            const newValue = { root: value };
            settingStorage.setField(projectId, property, newValue);
          }
        }

        if (navigate) {
          navigateToBot(callbackHelpers, projectId, mainDialog);
        }

        if (typeof callback === 'function') {
          callback(projectId);
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
      if (projectId === projectIdCache.get()) {
        projectIdCache.clear();
      }
      set(botProjectIdsState, []);
      handleProjectFailure(callbackHelpers, ex);
      navigateTo('/home');
    } finally {
      set(botOpeningState, false);
    }
  });

  const createNewBot = useRecoilCallback((callbackHelpers: CallbackInterface) => async (newProjectData: any) => {
    const { set, snapshot } = callbackHelpers;
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
        templateDir,
        eTag,
        urlSuffix,
        alias,
        preserveRoot,
        profile,
        source,
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

      if (profile) {
        // ABS Create Flow, update publishProfile after create project
        const dispatcher = await snapshot.getPromise(dispatcherState);
        const newProfile = getPublishProfileFromPayload(profile, source);

        newProfile && dispatcher.setPublishTargets([newProfile], projectId);
      }
      // Post project creation
      set(projectMetaDataState(projectId), {
        isRootBot: true,
        isRemote: false,
      });
      projectIdCache.set(projectId);
      navigateToBot(callbackHelpers, projectId, mainDialog, urlSuffix);
    } catch (ex) {
      set(botProjectIdsState, []);
      handleProjectFailure(callbackHelpers, ex);
      navigateTo('/home');
    } finally {
      set(botOpeningState, false);
    }
  });

  const createNewBotV2 = useRecoilCallback((callbackHelpers: CallbackInterface) => async (newProjectData: any) => {
    const { set, snapshot } = callbackHelpers;
    try {
      await flushExistingTasks(callbackHelpers);
      const dispatcher = await snapshot.getPromise(dispatcherState);
      set(botOpeningState, true);
      const {
        templateId,
        templateVersion,
        name,
        description,
        location,
        schemaUrl,
        locale,
        templateDir,
        eTag,
        urlSuffix,
        alias,
        preserveRoot,
      } = newProjectData;
      // starts the creation process and stores the jobID in state for tracking
      const response = await createNewBotFromTemplateV2(
        callbackHelpers,
        templateId,
        templateVersion,
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
      if (response.data.jobId) {
        dispatcher.updateCreationMessage(response.data.jobId, templateId, urlSuffix);
      }
    } catch (ex) {
      set(botProjectIdsState, []);
      handleProjectFailure(callbackHelpers, ex);
      navigateTo('/home');
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
      reset(filePersistenceState(projectId));
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

  const setBotStatus = useRecoilCallback<[string, BotStatus], void>(
    ({ set }: CallbackInterface) => (projectId: string, status: BotStatus) => {
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

  /** Resets the file persistence of a project, and then reloads the bot state. */
  const reloadProject = useRecoilCallback((callbackHelpers: CallbackInterface) => async (projectId: string) => {
    const { snapshot } = callbackHelpers;
    callbackHelpers.reset(filePersistenceState(projectId));
    const { projectData, botFiles } = await fetchProjectDataById(projectId);

    const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
    // Reload needs to pull the settings from the local storage persisted in the current settingsState of the project
    botFiles.mergedSettings = mergePropertiesManagedByRootBot(projectId, rootBotProjectId, botFiles.mergedSettings);
    await initBotState(callbackHelpers, projectData, botFiles);
  });

  const updateCreationMessage = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (jobId: string, templateId: string, urlSuffix: string) => {
      const timer = setInterval(async () => {
        try {
          const response = await httpClient.get(`/status/${jobId}`);
          if (response.data?.httpStatusCode === 200 && response.data.result) {
            // Bot creation successful
            clearInterval(timer);
            callbackHelpers.set(botOpeningMessage, response.data.latestMessage);
            const { botFiles, projectData } = loadProjectData(response.data.result);
            const projectId = response.data.result.id;
            if (settingStorage.get(projectId)) {
              settingStorage.remove(projectId);
            }

            const { mainDialog } = await openRootBotAndSkills(callbackHelpers, { botFiles, projectData });

            // Post project creation
            callbackHelpers.set(projectMetaDataState(projectId), {
              isRootBot: true,
              isRemote: false,
            });
            // if create from QnATemplate, continue creation flow.
            if (templateId === QnABotTemplateId) {
              callbackHelpers.set(createQnAOnState, { projectId, dialogId: mainDialog });
              callbackHelpers.set(showCreateQnAFromUrlDialogState(projectId), true);
            }

            projectIdCache.set(projectId);

            // navigate to the new get started section
            navigateToBot(callbackHelpers, projectId, undefined, btoa('botProjectsSettings'));
            callbackHelpers.set(botOpeningMessage, '');
            callbackHelpers.set(botOpeningState, false);
          } else {
            if (response.data.httpStatusCode !== 500) {
              // pending
              callbackHelpers.set(botOpeningMessage, response.data.latestMessage);
            } else {
              // failure
              callbackHelpers.set(botOpeningState, false);
              callbackHelpers.set(botOpeningMessage, response.data.latestMessage);
              clearInterval(timer);
            }
          }
        } catch (err) {
          clearInterval(timer);
          callbackHelpers.set(botProjectIdsState, []);
          handleProjectFailure(callbackHelpers, err);
          callbackHelpers.set(botOpeningState, false);
          navigateTo('/home');
        }
      }, 5000);
    }
  );

  const setCurrentProjectId = useRecoilCallback(({ set }: CallbackInterface) => async (projectId: string) => {
    set(currentProjectIdState, projectId);
  });

  const fetchReadMe = useRecoilCallback((callbackHelpers: CallbackInterface) => async (moduleName: string) => {
    try {
      callbackHelpers.set(fetchReadMePendingState, true);
      const response = await httpClient.get(`/assets/templateReadme`, {
        params: { moduleName: encodeURIComponent(moduleName) },
      });

      if (response.data) {
        callbackHelpers.set(selectedTemplateReadMeState, response.data);
      }
    } catch (err) {
      handleProjectFailure(callbackHelpers, err);
      callbackHelpers.set(
        selectedTemplateReadMeState,
        formatMessage('### Error encountered when getting template readMe')
      );
    } finally {
      callbackHelpers.set(fetchReadMePendingState, false);
    }
  });

  const setProjectError = useRecoilCallback((callbackHelpers: CallbackInterface) => (error) => {
    setError(callbackHelpers, error);
  });

  return {
    openProject,
    createNewBot,
    createNewBotV2,
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
    updateCreationMessage,
    setCurrentProjectId,
    setProjectError,
    fetchReadMe,
  };
};
