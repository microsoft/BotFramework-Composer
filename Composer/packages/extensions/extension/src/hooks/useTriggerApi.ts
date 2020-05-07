// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ShellApi, SDKKinds } from '@bfc/shared';
import get from 'lodash/get';

import { useActionApi } from './useActionApi';
import { useLuApi } from './useLuApi';

export const useTriggerApi = (shellAPi: ShellApi) => {
  const { deleteActions } = useActionApi(shellAPi);
  const { deleteLuIntent } = useLuApi(shellAPi);

  const deleteTrigger = (dialogId: string, trigger) => {
    // Clean the lu resource on intent trigger
    if (trigger.$kind === SDKKinds.OnIntent) {
      const triggerIntent = get(trigger, 'intent', '');
      deleteLuIntent(dialogId, triggerIntent);
    }

    // Clean action resources
    const actions = get(trigger, 'actions');
    if (!actions || !Array.isArray(actions)) return;

    deleteActions(dialogId, actions);
  };

  return {
    deleteTrigger,
  };
};
