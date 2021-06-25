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
  operatingSystemState,
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
    setAppServiceOperatingSystem,
  } = useDispatcher();

  const tenantId = useRecoilValue(tenantState);

  const subscriptionId = useRecoilValue(subscriptionState);
  const { name: resourceGroupName, isNew } = useRecoilValue(resourceGroupState);
  const deployLocation = useRecoilValue(deployLocationState);
  const luisRegion = useRecoilValue(luisRegionState);
  const hostName = useRecoilValue(hostNameState);
  const appServiceOperatingSystem = useRecoilValue(operatingSystemState);

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

  const handleChangeTenant = React.useCallback((tenantId: string) => {
    setTenantId(tenantId);
    if (!tenantId) {
      setSubscriptionId('');
    }
  }, []);

  const handleChangeSubscription = React.useCallback((subscriptionId: string) => {
    setSubscriptionId(subscriptionId);
    if (!subscriptionId) {
      setResourceGroup('', false);
      setDeployLocation('');
      setLuisRegion(undefined);
    }
  }, []);

  const handleChangeResourceGroup = React.useCallback((resourceGroupId: string, isNew: boolean) => {
    setResourceGroup(resourceGroupId, isNew);
  }, []);

  const handleValidateResourceGroupName = React.useCallback(
    (isValid: boolean) => {
      setIsInvalidResourceGroupName(isValid);
    },
    [setIsInvalidResourceGroupName]
  );

  const handleChangeDeployLocation = React.useCallback((deployLocationId: string) => {
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
  }, []);

  const handleChangeLuisRegion = React.useCallback((luisRegion: LuisRegion) => {
    setLuisRegion(luisRegion);
  }, []);

  const handleChangeHostName = React.useCallback((hostName: string) => {
    setHostName(hostName);
  }, []);

  const handleValidateHostName = React.useCallback((isValid: boolean) => {
    setIsInvalidHostName(isValid);
  }, []);

  const stashWizardState = () => {
    setItem(getName(), {
      tenantId,
      subscriptionId,
      resourceGroup: { name: resourceGroupName, isNew },
      deployLocation,
      luisRegion,
      hostName,
      appServiceOperatingSystem,
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
      appServiceOperatingSystem,
    },
    handleChangeTenant,
    handleChangeSubscription,
    handleChangeResourceGroup,
    handleFetchDeployLocation: setDeployLocations,
    handleChangeOperatingSystem: setAppServiceOperatingSystem,
    handleValidateHostName,
    handleValidateResourceGroupName,
    handleChangeDeployLocation,
    handleChangeLuisRegion,
    stashWizardState,
    handleChangeHostName,
    isValidConfiguration,
    deployLocations,
    hasErrors,
  };
};
