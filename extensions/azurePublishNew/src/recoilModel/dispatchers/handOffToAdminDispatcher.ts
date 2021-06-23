// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';

import { ResourcesItem } from '../../types';
import { requiredHandOffResourcesState, enabledHandOffResourcesState } from '../atoms/handOffToAdminState';

export const handOffToAdminDispatcher = () => {
  const setEnabledHandOffResources = useRecoilCallback(({ set }: CallbackInterface) => (resources: ResourcesItem[]) => {
    set(enabledHandOffResourcesState, resources);
  });

  const setRequiredHandOffResources = useRecoilCallback(
    ({ set }: CallbackInterface) => (resources: ResourcesItem[]) => {
      set(requiredHandOffResourcesState, resources);
    }
  );

  return {
    setEnabledHandOffResources,
    setRequiredHandOffResources,
  };
};
