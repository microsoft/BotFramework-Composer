// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { SensitiveProperties, SensitivePropertiesManageGroup, DialogSetting, PublishTarget } from '@bfc/shared';
import get from 'lodash/get';
import has from 'lodash/has';

import settingStorage from '../../utils/dialogSettingStorage';
import { settingsState } from '../atoms/botState';
import { rootBotProjectIdSelector } from '../selectors/project';

import httpClient from './../../utils/httpUtil';
import { setError } from './shared';

export const setSettingState = async (
  callbackHelpers: CallbackInterface,
  projectId: string,
  settings: DialogSetting
) => {
  const { set, snapshot } = callbackHelpers;

  // set value in local storage
  for (const property of SensitiveProperties) {
    if (has(settings, property)) {
      const propertyValue = get(settings, property, '');
      settingStorage.setField(projectId, property, propertyValue);
    }
  }

  for (const property of SensitivePropertiesManageGroup) {
    const rootProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
    if (has(settings, property) && rootProjectId) {
      const propertyValue = get(settings, property, '');
      const groupPropertyValue = get(settingStorage.get(rootProjectId), property, '');
      let newGroupPropertyValue = {};
      if (projectId === rootProjectId) {
        newGroupPropertyValue = { ...groupPropertyValue, root: propertyValue };
      } else {
        newGroupPropertyValue = { ...groupPropertyValue, [projectId]: propertyValue };
      }
      settingStorage.setField(rootProjectId, property, newGroupPropertyValue);
    }
  }
  set(settingsState(projectId), settings);
};

export const settingsDispatcher = () => {
  const setSettings = useRecoilCallback<[string, DialogSetting], Promise<void>>(
    (callbackHelpers: CallbackInterface) => async (projectId: string, settings: DialogSetting) => {
      setSettingState(callbackHelpers, projectId, settings);
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

  const setRuntimeField = useRecoilCallback(
    ({ set }: CallbackInterface) => async (projectId: string, field: string, newValue: boolean) => {
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
    setCustomRuntime,
    setQnASettings,
  };
};
