// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { SensitiveProperties } from '@bfc/shared';
import get from 'lodash/get';
import has from 'lodash/has';

import settingStorage from '../../utils/dialogSettingStorage';
import { settingsState, publishTargetsState } from '../atoms/botState';
import { DialogSetting, PublishTarget } from '../../store/types';

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

  const setPublishTargets = useRecoilCallback<[PublishTarget[]], Promise<void>>(
    ({ set }: CallbackInterface) => async (publishTargets) => {
      set(publishTargetsState, publishTargets);
    }
  );

  const setRuntimeSettings = useRecoilCallback<[boolean, string, string], Promise<void>>(
    ({ set }: CallbackInterface) => async (_, path, command) => {
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

  const setRuntimeField = useRecoilCallback<[string, string, boolean], void>(
    ({ set }: CallbackInterface) => async (projectId, field, newValue) => {
      set(settingsState, (currentValue) => ({
        ...currentValue,
        runtime: {
          ...currentValue.runtime,
          [field]: newValue,
        },
      }));
    }
  );

  const setCustomRuntime = useRecoilCallback<[string, boolean], void>(() => async (_, isOn) => {
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
