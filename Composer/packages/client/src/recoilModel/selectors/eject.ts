// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selector } from 'recoil';
import formatMessage from 'format-message';
import lodashGet from 'lodash/get';

import { dispatcherState } from '../DispatcherWrapper';
import httpClient from '../../utils/httpUtil';
import { Dispatcher } from '../dispatchers';
import { StateError } from '../../recoilModel/types';

// Actions
const ejectRuntimeAction = (dispatcher: Dispatcher) => {
  return {
    onAction: async (projectId: string, name: string, replace = false) => {
      try {
        dispatcher.setEjectRuntimeExist(false);
        const response = await httpClient.post(`/runtime/eject/${projectId}/${name}`, { isReplace: replace });
        if (!lodashGet(response, 'data.settings.path', '') || !lodashGet(response, 'data.settings.startCommand', '')) {
          throw new Error('Runtime cannot be ejected');
        }
        const runtimeSetting = response.data.settings;
        runtimeSetting.command = response.data.settings.startCommand;
        delete runtimeSetting.startCommand;
        dispatcher.setRuntimeSettings(projectId, runtimeSetting);
      } catch (ex) {
        if (
          ex.response?.data?.message &&
          typeof ex.response.data.message === 'string' &&
          ex.response.data.message.includes('Runtime already exists')
        ) {
          dispatcher.setEjectRuntimeExist(true);
        } else {
          const errorToShow: StateError = {
            message: ex.response?.data?.message || ex.response?.data || ex.message,
            summary: formatMessage('Error occured ejecting runtime!'),
            status: ex.response?.data?.status || ex.status,
          };
          dispatcher.setApplicationLevelError(errorToShow);
        }
      }
    },
  };
};

export const ejectRuntimeSelector = selector({
  key: 'ejectRuntimeSelector',
  get: ({ get }) => {
    const dispatcher = get(dispatcherState);
    if (!dispatcher) {
      return undefined;
    }
    return ejectRuntimeAction(dispatcher);
  },
});
