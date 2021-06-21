// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { useRecoilValue } from 'recoil';
import { usePublishApi, DeployLocation, useLocalStorage } from '@bfc/extension-client';

import {
  tenantState,
  subscriptionState,
  resourceGroupState,
  deployLocationState,
  luisRegionState,
  hostNameState,
} from '../recoilModel/atoms/resourceConfigurationState';
import { LuisAuthoringSupportLocation } from '../constants';
import { LuisRegion } from '../types';

import { useDispatcher } from './useDispatcher';

export const useResourceConfiguration = () => {
  const { userShouldProvideTokens, getName } = usePublishApi();
  const [deployLocations, setDeployLocations] = React.useState<DeployLocation[]>([]);
  const [isInvalidResourceGroupName, setIsInvalidResourceGroupName] = React.useState<boolean>(false);
  const [isInvalidHostName, setIsInvalidHostName] = React.useState<boolean>(false);
  const {
    setTenantId,
    setSubscriptionId,
    setResourceGroup,
    setDeployLocation,
    setLuisRegion,
    setHostName,
  } = useDispatcher();

  const tenantId = useRecoilValue(tenantState);

  const subscriptionId = useRecoilValue(subscriptionState);
  const { name: resourceGroupName, isNew } = useRecoilValue(resourceGroupState);
  const deployLocation = useRecoilValue(deployLocationState);
  const luisRegion = useRecoilValue(luisRegionState);
  const hostName = useRecoilValue(hostNameState);

  const { setItem } = useLocalStorage();

  const hasErrors = React.useMemo(() => isInvalidResourceGroupName || isInvalidHostName, [
    isInvalidHostName,
    isInvalidResourceGroupName,
  ]);

  const isValidConfiguration = React.useMemo(
    (): boolean =>
      !(
        !(userShouldProvideTokens() || tenantId) ||
        !subscriptionId ||
        !resourceGroupName ||
        hasErrors ||
        !deployLocation ||
        !luisRegion ||
        !hostName
      ),
    [tenantId, subscriptionId, resourceGroupName, hasErrors, deployLocation, luisRegion, hostName]
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
        setResourceGroup('', false);
        setDeployLocation('');
        setLuisRegion(undefined);
      }
    },
    [setResourceGroup, setDeployLocation, setSubscriptionId]
  );

  const handleResourceGroupChange = React.useCallback(
    (resourceGroupId: string, isNew: boolean) => {
      setResourceGroup(resourceGroupId, isNew);
    },
    [setResourceGroup]
  );

  const handleResourceGroupNameValidate = React.useCallback(
    (isValid: boolean) => {
      setIsInvalidResourceGroupName(isValid);
    },
    [setIsInvalidResourceGroupName]
  );

  const handleDeployLocationChange = React.useCallback(
    (deployLocationId: string) => {
      setDeployLocation(deployLocationId);
      if (!deployLocationId) {
        setLuisRegion(undefined);
      } else {
        //Seed luis region with the deploy location or pick the first one
        setLuisRegion(
          (LuisAuthoringSupportLocation.includes(deployLocation)
            ? deployLocation
            : LuisAuthoringSupportLocation[0]) as LuisRegion
        );
      }
    },
    [setDeployLocation]
  );

  const handleLuisRegionChange = React.useCallback(
    (luisRegion: LuisRegion) => {
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

  const handleHostNameValidate = React.useCallback(
    (isValid: boolean) => {
      setIsInvalidHostName(isValid);
    },
    [setIsInvalidHostName]
  );

  const stashWizardState = () => {
    setItem(getName(), {
      tenantId,
      subscriptionId,
      resourceGroup: { name: resourceGroupName, isNew },
      deployLocation,
      luisRegion,
      hostName,
    });
  };

  return {
    configuration: {
      tenantId,
      subscriptionId,
      resourceGroupName,
      deployLocation,
      luisRegion,
      isNewResourceGroup: isNew,
      hostName,
    },
    handleTenantChange,
    handleSubscriptionChange,
    handleResourceGroupChange,
    handleDeployLocationFetch: setDeployLocations,
    handleHostNameValidate,
    handleResourceGroupNameValidate,
    handleDeployLocationChange,
    handleLuisRegionChange,
    stashWizardState,
    handleHostNameChange,
    isValidConfiguration,
    deployLocations,
    hasErrors,
  };
};
