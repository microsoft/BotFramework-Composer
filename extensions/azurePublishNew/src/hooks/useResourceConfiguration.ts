// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { useRecoilValue } from 'recoil';
import { usePublishApi, DeployLocation, useLocalStorage } from '@bfc/extension-client';

import { resourceConfigurationState } from '../recoilModel/atoms/resourceConfigurationState';
import { LuisAuthoringSupportLocation } from '../constants';

import { useDispatcher } from './useDispatcher';

export const useResourceConfiguration = () => {
  const { userShouldProvideTokens, getName } = usePublishApi();
  const [deployLocations, setDeployLocations] = React.useState<DeployLocation[]>([]);
  const [hasErrors, setHasErrors] = React.useState<boolean>(false);
  const {
    setTenantId,
    setSubscriptionId,
    setResourceGroupName,
    setDeployLocation,
    setLuisRegion,
    setHostName,
  } = useDispatcher();
  const {
    tenantId,
    subscriptionId,
    resourceGroupName,
    deployLocation,
    luisRegion,
    isNewResourceGroup,
  } = useRecoilValue(resourceConfigurationState);
  const { setItem } = useLocalStorage();

  const isValidConfiguration = React.useMemo(
    (): boolean =>
      !(
        !(userShouldProvideTokens() || tenantId) ||
        !subscriptionId ||
        !resourceGroupName ||
        hasErrors ||
        !deployLocation ||
        !luisRegion
      ),
    [tenantId, subscriptionId, resourceGroupName, hasErrors, deployLocation, luisRegion]
  );

  const handleTenantChange = React.useCallback(
    (tenantId: string) => {
      setTenantId(tenantId);
      if (!tenantId) {
        setSubscriptionId('');
      }
    },
    [setSubscriptionId, setTenantId]
  );

  const handleSubscriptionChange = React.useCallback(
    (subscriptionId: string) => {
      setSubscriptionId(subscriptionId);
      if (!subscriptionId) {
        setResourceGroupName('', false);
        setDeployLocation('');
        setLuisRegion('');
      }
    },
    [setResourceGroupName, setDeployLocation, setSubscriptionId]
  );

  const handleResourceGroupChange = React.useCallback(
    (resourceGroupId: string, isNew: boolean, hasErrors: boolean) => {
      setResourceGroupName(resourceGroupId, isNew);
      setHasErrors(hasErrors);
    },
    [setResourceGroupName]
  );

  const handleDeployLocationChange = React.useCallback(
    (deployLocationId: string) => {
      setDeployLocation(deployLocationId);
      if (!deployLocationId) {
        setLuisRegion('');
      } else {
        //Seed luis region with the deploy location or pick the first one
        setLuisRegion(
          LuisAuthoringSupportLocation.includes(deployLocation) ? deployLocation : LuisAuthoringSupportLocation[0]
        );
      }
    },
    [setDeployLocation]
  );

  const handleLuisRegionChange = React.useCallback(
    (luisRegion: string) => {
      setLuisRegion(luisRegion);
    },
    [setLuisRegion]
  );

  const handleHostNameChange = React.useCallback(
    (hostName: string) => {
      setHostName(hostName);
    },
    [setHostName]
  );

  const persistResourceConfiguration = React.useCallback(
    () =>
      setItem(getName(), {
        tenantId,
        subscriptionId,
        resourceGroupName,
        deployLocation,
        luisRegion,
      }),
    [tenantId, subscriptionId, resourceGroupName, deployLocation, luisRegion]
  );

  return {
    configuration: {
      tenantId,
      subscriptionId,
      resourceGroupName,
      deployLocation,
      luisRegion,
      isNewResourceGroup,
    },
    handleTenantChange,
    handleSubscriptionChange,
    handleResourceGroupChange,
    handleDeployLocationFetch: setDeployLocations,
    handleDeployLocationChange,
    handleLuisRegionChange,
    persistResourceConfiguration,
    handleHostNameChange,
    isValidConfiguration,
    deployLocations,
    hasErrors,
  };
};
