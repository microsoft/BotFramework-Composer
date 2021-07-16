// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { MutableSnapshot } from 'recoil';
import { useLocalStorage, usePublishApi } from '@bfc/extension-client';
import mergeWith from 'lodash/mergeWith';

import {
  subscriptionState,
  luisRegionState,
  deployLocationState,
  resourceGroupState,
  hostNameState,
  appServiceOperatingSystemState,
} from '../recoilModel/atoms/resourceConfigurationState';
import { PublishProfileConfiguration } from '../types';
import { importConfigurationState } from '../recoilModel/atoms/importConfigurationState';

import { usePreferredAppServiceOS } from './usePreferredAppServiceOS';

const defaultConfig: PublishProfileConfiguration = {
  tenantId: '',
  subscriptionId: '',
  deployLocation: '',
  hostName: '',
  luisRegion: '',
  resourceGroup: { isNew: false, name: '' },
  appServiceOperatingSystem: '',
};

export const usePublishProfileInitializer = () => {
  const { getName, publishConfig, getSchema } = usePublishApi();
  const { getItem } = useLocalStorage();
  const preferredOS = usePreferredAppServiceOS();

  const currentPublishConfig: PublishProfileConfiguration = {
    deployLocation: publishConfig?.region,
    hostName: publishConfig?.hostname,
    luisRegion: publishConfig?.settings?.luis?.region,
    resourceGroup: { name: publishConfig?.resourceGroup, isNew: false },
    subscriptionId: publishConfig?.subscriptionId,
    tenantId: publishConfig?.tenantId,
    appServiceOperatingSystem: '',
  };

  const initialize = ({ set }: MutableSnapshot) => {
    //pick all the non-null values, publish config will only be populated when the exisiting profile is edited.
    const profile = mergeWith(defaultConfig, getItem(getName()), currentPublishConfig, (value, srcValue, key) => {
      if (key === 'resourceGroup') {
        return {
          name: value?.name || srcValue?.name,
          isNew: value?.isNew || srcValue?.isNew,
        };
      } else {
        return value || srcValue;
      }
    });

    set(subscriptionState, profile.subscriptionId);
    set(luisRegionState, profile.luisRegion);
    set(deployLocationState, profile.deployLocation);
    set(resourceGroupState, profile.resourceGroup);
    set(hostNameState, profile.hostName);
    set(importConfigurationState, {
      config: JSON.stringify(publishConfig || getSchema()?.default, null, 2),
      isValidConfiguration: true,
    });
    set(appServiceOperatingSystemState, preferredOS);
  };

  return initialize;
};
