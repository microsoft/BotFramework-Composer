// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { SensitiveProperties, RootBotManagedProperties, DialogSetting, PublishTarget, LibraryRef } from '@bfc/shared';
import get from 'lodash/get';
import set from 'lodash/set';
import has from 'lodash/has';
import cloneDeep from 'lodash/cloneDeep';

import settingStorage from '../../utils/dialogSettingStorage';
import { settingsState } from '../atoms/botState';
import { rootBotProjectIdSelector, botProjectSpaceSelector } from '../selectors/project';

import httpClient from './../../utils/httpUtil';
import { setError } from './shared';

export const setRootBotSettingState = async (
  callbackHelpers: CallbackInterface,
  projectId: string,
  settings: DialogSetting
) => {
  const { set: recoilSet, snapshot } = callbackHelpers;
  // set value in local storage
  for (const property of SensitiveProperties) {
    if (!RootBotManagedProperties.includes(property) && has(settings, property)) {
      const propertyValue = get(settings, property, '');
      settingStorage.setField(projectId, property, propertyValue);
    }
  }

  const rootProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
  //store RootBotManagedProperties in browser localStorage
  for (const property of RootBotManagedProperties) {
    if (has(settings, property) && rootProjectId) {
      const propertyValue = get(settings, property, '');
      const groupPropertyValue = get(settingStorage.get(rootProjectId), property, '');
      const newGroupPropertyValue = { ...groupPropertyValue, root: propertyValue };
      settingStorage.setField(rootProjectId, property, newGroupPropertyValue);
    }
  }

  //sync skill bots' RootBotManagedProperties with root bot
  const botProjectSpaceData = await snapshot.getPromise(botProjectSpaceSelector);
  for (let i = 0; i < botProjectSpaceData.length; i++) {
    const botProject = botProjectSpaceData[i];
    if (!botProject.isRootBot && !botProject.isRemote && rootProjectId) {
      const skillSettings = await snapshot.getPromise(settingsState(botProject.projectId));
      const newSkillSettings = cloneDeep(skillSettings);
      const localStorageSettings = settingStorage.get(rootProjectId);
      for (const property of RootBotManagedProperties) {
        const propertyValue = get(settings, property, '');
        const skillBotValue = get(localStorageSettings, property, {})[botProject.projectId];
        const shouldUseRootProperty = !skillBotValue;
        if (shouldUseRootProperty) {
          set(newSkillSettings, property, propertyValue);
        } else {
          set(newSkillSettings, property, skillBotValue);
        }
      }
      recoilSet(settingsState(botProject.projectId), newSkillSettings);
    }
  }
  recoilSet(settingsState(projectId), settings);
};

export const setSkillBotSettingState = async (
  callbackHelpers: CallbackInterface,
  projectId: string,
  settings: DialogSetting
) => {
  const { set: recoilSet, snapshot } = callbackHelpers;
  // set value in local storage
  for (const property of SensitiveProperties) {
    if (!RootBotManagedProperties.includes(property) && has(settings, property)) {
      const propertyValue = get(settings, property, '');
      settingStorage.setField(projectId, property, propertyValue);
    }
  }

  const rootProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
  //store RootBotManagedProperties in browser localStorage
  for (const property of RootBotManagedProperties) {
    if (has(settings, property) && rootProjectId) {
      const propertyValue = get(settings, property, '');
      const groupPropertyValue = get(settingStorage.get(rootProjectId), property, '');
      const newGroupPropertyValue = { ...groupPropertyValue, [projectId]: propertyValue };
      settingStorage.setField(rootProjectId, property, newGroupPropertyValue);
    }
  }

  //Use root bot's RootBotManagedProperties value if those of the skill bot's are empty
  if (rootProjectId) {
    const rootSettings = await snapshot.getPromise(settingsState(rootProjectId));
    for (const property of RootBotManagedProperties) {
      const propertyValue = get(settings, property, '');
      const rootPropertyValue = get(rootSettings, property, '');
      if (!propertyValue) {
        set(settings, property, rootPropertyValue);
      }
    }
  }
  recoilSet(settingsState(projectId), settings);
};

export const settingsDispatcher = () => {
  const setSettings = useRecoilCallback<[string, DialogSetting], Promise<void>>(
    (callbackHelpers: CallbackInterface) => async (projectId: string, settings: DialogSetting) => {
      const { snapshot } = callbackHelpers;
      const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
      if (projectId === rootBotProjectId) {
        setRootBotSettingState(callbackHelpers, projectId, settings);
      } else {
        setSkillBotSettingState(callbackHelpers, projectId, settings);
      }
    }
  );

  const setPublishTargets = useRecoilCallback(
    ({ set }: CallbackInterface) => async (publishTargets: PublishTarget[], projectId: string) => {
      set(settingsState(projectId), (settings) => ({
        ...settings,
        publishTargets,
      }));
    }
  );

  const setRuntimeSettings = useRecoilCallback(
    ({ set }: CallbackInterface) => async (
      projectId: string,
      runtime: { path: string; command: string; key: string; name: string }
    ) => {
      set(settingsState(projectId), (currentSettingsState) => ({
        ...currentSettingsState,
        runtime: {
          ...runtime,
          customRuntime: true,
        },
      }));
    }
  );

  const setImportedLibraries = useRecoilCallback(
    ({ set }: CallbackInterface) => async (projectId: string, importedLibraries: LibraryRef[]) => {
      set(settingsState(projectId), (currentSettingsState) => ({
        ...currentSettingsState,
        importedLibraries,
      }));
    }
  );

  const setRuntimeField = useRecoilCallback(
    ({ set }: CallbackInterface) => async (projectId: string, field: string, newValue: boolean | string) => {
      set(settingsState(projectId), (currentValue) => ({
        ...currentValue,
        runtime: {
          ...currentValue.runtime,
          [field]: newValue,
        },
      }));
    }
  );

  const setCustomRuntime = useRecoilCallback(() => async (projectId: string, isOn: boolean) => {
    setRuntimeField(projectId, 'customRuntime', isOn);
  });

  const setQnASettings = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectId: string, subscriptionKey: string) => {
      const { set } = callbackHelpers;
      try {
        const response = await httpClient.post(`/projects/${projectId}/qnaSettings/set`, {
          projectId,
          subscriptionKey,
        });
        settingStorage.setField(projectId, 'qna.endpointKey', response.data);
        set(settingsState(projectId), (currentValue) => ({
          ...currentValue,
          qna: {
            ...currentValue.qna,
            endpointKey: response.data,
          },
        }));
      } catch (err) {
        setError(callbackHelpers, err);
      }
    }
  );

  return {
    setSettings,
    setRuntimeSettings,
    setPublishTargets,
    setRuntimeField,
    setImportedLibraries,
    setCustomRuntime,
    setQnASettings,
  };
};
