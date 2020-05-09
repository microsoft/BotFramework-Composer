// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ShellApi, SDKKinds, ITriggerCondition, BaseSchema } from '@bfc/shared';
import get from 'lodash/get';

import { useActionApi } from './useActionApi';
import { useLuApi } from './useLuApi';

export const useTriggerApi = (shellAPi: ShellApi) => {
  const { deleteActions } = useActionApi(shellAPi);
  const { deleteLuIntent } = useLuApi(shellAPi);

  const deleteTrigger = (dialogId: string, trigger: ITriggerCondition) => {
    if (!trigger) return;

    // Clean the lu resource on intent trigger
    if (get(trigger, '$kind') === SDKKinds.OnIntent) {
      const triggerIntent = get(trigger, 'intent', '');
      deleteLuIntent(dialogId, triggerIntent);
    }

    // Clean action resources
    const actions = get(trigger, 'actions') as BaseSchema[];
    if (!actions || !Array.isArray(actions)) return;

    deleteActions(dialogId, actions);
  };

  return {
    deleteTrigger,
  };
};
