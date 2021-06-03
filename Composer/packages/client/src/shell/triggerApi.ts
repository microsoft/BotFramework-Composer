// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useState } from 'react';
import { ITriggerCondition } from '@botframework-composer/types';
import { useRecoilValue } from 'recoil';

import { TriggerFormData } from '../utils/dialogUtil';
import { Dispatcher } from '../recoilModel/dispatchers';
import { dispatcherState } from '../recoilModel/atoms';

function createTriggerApi(projectId: string, dispatchers: Dispatcher) {
  return {
    createTrigger: (dialogId: string, formData: TriggerFormData, autoSelected = true) =>
      dispatchers.createTrigger(projectId, dialogId, formData, autoSelected),
    deleteTrigger: (dialogId: string, trigger: ITriggerCondition) =>
      dispatchers.deleteTrigger(projectId, dialogId, trigger),
    createQnATrigger: (dialogId: string) => dispatchers.createQnATrigger(projectId, dialogId),
  };
}

export function useTriggerApi(projectId: string) {
  const dispatchers = useRecoilValue(dispatcherState);
  const [api, setApi] = useState(createTriggerApi(projectId, dispatchers));

  useEffect(() => {
    const newApi = createTriggerApi(projectId, dispatchers);
    setApi(newApi);
    return () => {
      Object.keys(newApi).forEach((apiName) => {
        if (typeof newApi[apiName].flush === 'function') {
          newApi[apiName].flush();
        }
      });
    };
  }, [projectId]);

  return api;
}
