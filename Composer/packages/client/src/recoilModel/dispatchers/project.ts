/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilCallback, CallbackInterface } from 'recoil';
import formatMessage from 'format-message';

import httpClient from '../../utils/httpUtil';
import { BotStatus } from '../../constants';
import luFileStatusStorage from '../../utils/luFileStatusStorage';
import qnaFileStatusStorage from '../../utils/qnaFileStatusStorage';
import settingStorage from '../../utils/dialogSettingStorage';
import { navigateTo } from '../../utils/navigation';
import { projectIdCache } from '../../utils/projectCache';
import { botProjectSpaceProjectIds, currentProjectIdState, botStatusState } from '../atoms';

import { recentProjectsState, templateIdState, announcementState, boilerplateVersionState } from './../atoms';
import { logMessage, setError } from './../dispatchers/shared';
import {
  fetchProjectDataById,
  fetchProjectDataByPath,
  flushExistingTasks,
  handleProjectFailure,
  navigateToBot,
  openLocalSkill,
  initBotState,
  removeRecentProject,
  openRootBotAndSkills,
  createNewBotFromTemplate,
  resetBotStates,
  openRemoteSkill,
} from './utils/project';

export const projectDispatcher = () => {
  const removeSkillFromBotProject = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectId: string) => {
      try {
        const { set } = callbackHelpers;
        set(botProjectSpaceProjectIds, (currentProjects) => currentProjects.filter((id) => id !== projectId));
      } catch (ex) {
        setError(callbackHelpers, ex);
      }
    }
  );

  const addExistingSkillToBotProject = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (path: string, storageId = 'default') => {
      const { set } = callbackHelpers;
      const projectId = await openLocalSkill(callbackHelpers, path, storageId);
      set(botProjectSpaceProjectIds, (current) => [...current, projectId]);
    }
  );

  const addRemoteSkillToBotProject = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (manifestUrl: string, name: string, endpointName: string) => {
      try {
        openRemoteSkill(callbackHelpers, manifestUrl, name, endpointName);
      } catch (ex) {
        // Handle exception
      }
    }
  );

  const addNewSkillToBotProject = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (
      templateId: string,
      name: string,
      description: string,
      location: string,
      schemaUrl?: string,
      locale?: string,
      qnaKbUrls?: string[]
    ) => {
      try {
        const { set } = callbackHelpers;
        const { projectId, mainDialog } = await createNewBotFromTemplate(
          callbackHelpers,
          templateId,
          name,
          description,
          location,
          schemaUrl,
          locale
        );
        set(botProjectSpaceProjectIds, (current) => [...current, projectId]);
        navigateToBot(projectId, mainDialog, qnaKbUrls, templateId);
      } catch (ex) {
        // Handle exception in opening a skill
      }
    }
  );

  const openProject = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (path: string, storageId = 'default') => {
      const { set } = callbackHelpers;
      try {
        await flushExistingTasks(callbackHelpers);
        const { projectData, botFiles } = await fetchProjectDataByPath(path, storageId);
        openRootBotAndSkills(callbackHelpers, projectData, botFiles, 'default');
      } catch (ex) {
        set(botProjectSpaceProjectIds, []);
        removeRecentProject(callbackHelpers, path);
        handleProjectFailure(callbackHelpers, ex);
      }
    }
  );

  const fetchProjectById = useRecoilCallback((callbackHelpers: CallbackInterface) => async (projectId: string) => {
    try {
      const { set } = callbackHelpers;
      await flushExistingTasks(callbackHelpers);
      set(botProjectSpaceProjectIds, []);
      const { projectData, botFiles } = await fetchProjectDataById(projectId);
      openRootBotAndSkills(callbackHelpers, projectData, botFiles, 'default');
    } catch (ex) {
      handleProjectFailure(callbackHelpers, ex);
      navigateTo('/home');
    }
  });

  const createProject = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (
      templateId: string,
      name: string,
      description: string,
      location: string,
      schemaUrl?: string,
      locale?: string,
      qnaKbUrls?: string[]
    ) => {
      const { set } = callbackHelpers;
      try {
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
        set(botProjectSpaceProjectIds, [projectId]);
        set(currentProjectIdState, projectId);
        navigateToBot(projectId, mainDialog, qnaKbUrls, templateId);
        return projectId;
      } catch (ex) {
        set(botProjectSpaceProjectIds, []);
        removeRecentProject(callbackHelpers, path);
        handleProjectFailure(callbackHelpers, ex);
        navigateTo('/home');
      }
    }
  );

  const deleteBotProject = useRecoilCallback((callbackHelpers: CallbackInterface) => async (projectId: string) => {
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
    (callbackHelpers: CallbackInterface) => async (projectId, name, description, location) => {
      try {
        await flushExistingTasks(callbackHelpers);
        const response = await httpClient.post(`/projects/${projectId}/project/saveAs`, {
          storageId: 'default',
          name,
          description,
          location,
        });
        await initBotState(callbackHelpers, response.data, true);
        return response.data.id;
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
    createProject,
    deleteBotProject,
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
