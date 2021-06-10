// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { useRecoilValue } from 'recoil';

import { resourceConfigurationState } from '../recoilModel/atoms';

import { useDispatcher } from './useDispatcher';

export const useResourceConfiguration = () => {
  const { setTenantId, setSubscriptionId, setResourceGroupName, setDeployLocation, setLuisRegion } = useDispatcher();
  const { tenantId, subscriptionId, resourceGroupName, deployLocation, luisRegion } = useRecoilValue(
    resourceConfigurationState
  );

  const isValidConfiguration = React.useMemo((): boolean => !(!tenantId || !subscriptionId || !resourceGroupName), [
    tenantId,
    subscriptionId,
    resourceGroupName,
  ]);

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
        setResourceGroupName('');
        setDeployLocation('');
      }
    },
    [setResourceGroupName, setDeployLocation, setSubscriptionId]
  );

  const handleResourceGroupChange = React.useCallback(
    (resourceGroupId: string) => {
      setResourceGroupName(resourceGroupId);
    },
    [setResourceGroupName]
  );

  const handleDeployLocationChange = React.useCallback(
    (deployLocationId: string) => {
      setDeployLocation(deployLocationId);
    },
    [setDeployLocation]
  );

  const handleLuisRegionChange = React.useCallback(
    (luisRegion: string) => {
      setLuisRegion(luisRegion);
    },
    [setLuisRegion]
  );

  return {
    configuration: { tenantId, subscriptionId, resourceGroupName, deployLocation, luisRegion },
    handleTenantChange,
    handleSubscriptionChange,
    handleResourceGroupChange,
    handleDeployLocationChange,
    handleLuisRegionChange,
    isValidConfiguration,
  };
};
