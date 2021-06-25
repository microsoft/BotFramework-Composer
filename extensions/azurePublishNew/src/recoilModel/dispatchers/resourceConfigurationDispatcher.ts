// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';

import {
  tenantState,
  subscriptionState,
  resourceGroupState,
  deployLocationState,
  luisRegionState,
  hostNameState,
  enabledResourcesState,
  requiredResourcesState,
  operatingSystemState,
} from '../atoms/resourceConfigurationState';
import { LuisRegion, ResourcesItem } from '../../types';

export const resourceConfigurationDispatcher = () => {
  const setTenantId = useRecoilCallback(({ set }: CallbackInterface) => (tenantId: string) => {
    set(tenantState, tenantId);
  });

  const setSubscriptionId = useRecoilCallback(({ set }: CallbackInterface) => (subscriptionId: string) => {
    set(subscriptionState, subscriptionId);
  });

  const setResourceGroup = useRecoilCallback(
    ({ set }: CallbackInterface) => (resourceGroupName: string, isNew: boolean) => {
      set(resourceGroupState, { name: resourceGroupName, isNew });
    }
  );

  const setDeployLocation = useRecoilCallback(({ set }: CallbackInterface) => (deployLocation: string) => {
    set(deployLocationState, deployLocation);
  });

  const setLuisRegion = useRecoilCallback(({ set }: CallbackInterface) => (luisRegion: LuisRegion) => {
    set(luisRegionState, luisRegion);
  });

  const setHostName = useRecoilCallback(({ set }: CallbackInterface) => (hostName: string) => {
    set(hostNameState, hostName);
  });

  const setEnabledResources = useRecoilCallback(({ set }: CallbackInterface) => (resources: ResourcesItem[]) => {
    set(enabledResourcesState, resources);
  });

  const setRequiredResources = useRecoilCallback(({ set }: CallbackInterface) => (resources: ResourcesItem[]) => {
    set(requiredResourcesState, resources);
  });

  const setAppServiceOperatingSystem = useRecoilCallback(({ set }: CallbackInterface) => (operatingSystem: string) => {
    set(operatingSystemState, operatingSystem);
  });

  return {
    setTenantId,
    setSubscriptionId,
    setResourceGroup,
    setDeployLocation,
    setLuisRegion,
    setHostName,
    setEnabledResources,
    setRequiredResources,
    setAppServiceOperatingSystem,
  };
};
