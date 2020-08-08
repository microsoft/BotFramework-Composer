// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { SensitiveProperties, DialogSetting, PublishTarget } from '@bfc/shared';
import get from 'lodash/get';
import has from 'lodash/has';

import settingStorage from '../../utils/dialogSettingStorage';
import { settingsState } from '../atoms/botState';

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
    ({ set }: CallbackInterface) => async (_, path: string, command: string) => {
      set(settingsState, (currentSettingsState) => ({
        ...currentSettingsState,
        runtime: {
          customRuntime: true,
          path,
          command,
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

  return {
    setSettings,
    setRuntimeSettings,
    setPublishTargets,
    setRuntimeField,
    setCustomRuntime,
  };
};
