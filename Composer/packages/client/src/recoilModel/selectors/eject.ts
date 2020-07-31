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
    onAction: async (projectId: string, name: string) => {
      try {
        const response = await httpClient.post(`/runtime/eject/${projectId}/${name}`);
        if (!lodashGet(response, 'data.settings.path', '') || !lodashGet(response, 'data.settings.startCommand', '')) {
          throw new Error('Runtime cannot be ejected');
        }
        const path = response.data.settings.path;
        const command = response.data.settings.startCommand;
        dispatcher.setRuntimeSettings(projectId, path, command);
      } catch (ex) {
        const errorToShow: StateError = {
          message: ex.response?.data?.message || ex.message,
          summary: formatMessage('Error occured ejecting runtime!'),
          status: ex.response?.data?.status || ex.status,
        };
        dispatcher.setApplicationLevelError(errorToShow);
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
