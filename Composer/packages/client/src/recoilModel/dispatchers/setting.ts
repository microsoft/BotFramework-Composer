// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { SensitiveProperties } from '@bfc/shared';
import get from 'lodash/get';
import has from 'lodash/has';

import settingStorage from '../../utils/dialogSettingStorage';
import { settingsState } from '../atoms/botState';
import { DialogSetting } from '../../store/types';

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

  return {
    setSettings,
  };
};
