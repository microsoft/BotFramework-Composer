// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { SensitiveProperties, DialogSetting, PublishTarget, Skill } from '@bfc/shared';
import { skillIndexer } from '@bfc/indexers';
import get from 'lodash/get';
import has from 'lodash/has';
import isEqual from 'lodash/isEqual';
import keys from 'lodash/keys';

import settingStorage from '../../utils/dialogSettingStorage';
import { settingsState, skillsState } from '../atoms/botState';

import httpClient from './../../utils/httpUtil';
import { setError } from './shared';

export const setSettingState = async (
  callbackHelpers: CallbackInterface,
  projectId: string,
  settings: DialogSetting
) => {
  const { set, snapshot } = callbackHelpers;
  const previousSettings = await snapshot.getPromise(settingsState);

  if (!isEqual(settings.skill, previousSettings.skill)) {
    const skills = await snapshot.getPromise(skillsState);
    const skillContent = await Promise.all(
      keys(settings.skill).map(async (id) => {
        if (settings?.skill?.[id]?.manifestUrl !== previousSettings?.skill?.[id]?.manifestUrl) {
          try {
            const { data: content } = await httpClient.post(`/projects/${projectId}/skill/retrieve-skill-manifest`, {
              url: settings?.skill?.[id]?.manifestUrl,
            });
            return { id, content };
          } catch (error) {
            return { id };
          }
        }

        const { content = {} } = skills.find(({ id: key }) => id === key) || ({} as Skill);

        return { id, content };
      })
    );

    set(skillsState, skillIndexer.index(skillContent, settings.skill));
  }

  // set value in local storage
  for (const property of SensitiveProperties) {
    if (has(settings, property)) {
      const propertyValue = get(settings, property, '');
      settingStorage.setField(projectId, property, propertyValue);
    }
  }
  set(settingsState, settings);
};

export const settingsDispatcher = () => {
  const setSettings = useRecoilCallback<[string, DialogSetting], Promise<void>>(
    (callbackHelpers: CallbackInterface) => async (projectId: string, settings: DialogSetting) => {
      setSettingState(callbackHelpers, projectId, settings);
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

  return {
    setSettings,
    setRuntimeSettings,
    setPublishTargets,
    setRuntimeField,
    setCustomRuntime,
    setQnASettings,
  };
};
