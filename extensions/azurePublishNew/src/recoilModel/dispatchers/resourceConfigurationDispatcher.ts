// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';

import { resourceConfigurationState } from '../atoms';

export const resourceConfigurationDispatcher = () => {
  const setTenantId = useRecoilCallback(({ set }: CallbackInterface) => (tenantId: string) => {
    set(resourceConfigurationState, (currentResourceConfig) => {
      return {
        ...currentResourceConfig,
        tenantId,
      };
    });
  });

  const setSubscriptionId = useRecoilCallback(({ set }: CallbackInterface) => (subscriptionId: string) => {
    set(resourceConfigurationState, (currentResourceConfig) => {
      return {
        ...currentResourceConfig,
        subscriptionId,
      };
    });
  });

  const setResourceGroupName = useRecoilCallback(({ set }: CallbackInterface) => (resourceGroupName: string) => {
    set(resourceConfigurationState, (currentResourceConfig) => {
      return {
        ...currentResourceConfig,
        resourceGroupName,
      };
    });
  });

  const setDeployLocation = useRecoilCallback(({ set }: CallbackInterface) => (deployLocation: string) => {
    set(resourceConfigurationState, (currentResourceConfig) => {
      return {
        ...currentResourceConfig,
        deployLocation,
      };
    });
  });

  const setLuisRegion = useRecoilCallback(({ set }: CallbackInterface) => (luisRegion: string) => {
    set(resourceConfigurationState, (currentResourceConfig) => {
      return {
        ...currentResourceConfig,
        luisRegion,
      };
    });
  });

  return {
    setTenantId,
    setSubscriptionId,
    setResourceGroupName,
    setDeployLocation,
    setLuisRegion,
  };
};
