// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { SensitiveProperties, DialogSetting, PublishTarget, Skill } from '@bfc/shared';
import get from 'lodash/get';
import has from 'lodash/has';

import settingStorage from '../../utils/dialogSettingStorage';
import { settingsState } from '../atoms/botState';

import httpClient from './../../utils/httpUtil';
import { setError } from './shared';

export const settingsDispatcher = () => {
  const setSettings = useRecoilCallback<[string, DialogSetting], Promise<void>>(
    ({ set }: CallbackInterface) => async (projectId: string, settings: DialogSetting) => {
      // set value in local storage
      for (const property of SensitiveProperties) {
        if (has(settings, property)) {
          const propertyValue = get(settings, property, '');
          settingStorage.setField(projectId, property, propertyValue);
        }
      }
      set(settingsState, settings);
    }
  );

  const setPublishTargets = useRecoilCallback(
    ({ set }: CallbackInterface) => async (publishTargets: PublishTarget[]) => {
      set(settingsState, (settings) => ({
        ...settings,
        publishTargets,
      }));
    }
  );

  const setRuntimeSettings = useRecoilCallback(
    ({ set }: CallbackInterface) => async (
      _,
      runtime: { path: string; command: string; key: string; name: string }
    ) => {
      set(settingsState, (currentSettingsState) => ({
        ...currentSettingsState,
        runtime: {
          ...runtime,
          customRuntime: true,
        },
      }));
    }
  );

  const setRuntimeField = useRecoilCallback(
    ({ set }: CallbackInterface) => async (_, field: string, newValue: boolean) => {
      set(settingsState, (currentValue) => ({
        ...currentValue,
        runtime: {
          ...currentValue.runtime,
          [field]: newValue,
        },
      }));
    }
  );

  const setCustomRuntime = useRecoilCallback(() => async (_, isOn: boolean) => {
    setRuntimeField('', 'customRuntime', isOn);
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
        set(settingsState, (currentValue) => ({
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

  const updateSkillsInSetting = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (skillName: string, skillInfo: Partial<Skill>) => {
      const currentSettings: DialogSetting = await snapshot.getPromise(settingsState);
      const matchedSkill = get(currentSettings, `skill[${skillName}]`, {});
      if (matchedSkill) {
        set(settingsState, {
          ...currentSettings,
          skill: {
            ...currentSettings.skill,
            [skillName]: {
              ...matchedSkill,
              ...skillInfo,
            },
          },
        });
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
    updateSkillsInSetting,
  };
};
