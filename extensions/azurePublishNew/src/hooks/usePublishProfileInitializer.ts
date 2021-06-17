// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { MutableSnapshot } from 'recoil';
import { useLocalStorage, usePublishApi } from '@bfc/extension-client';

import {
  tenantState,
  subscriptionState,
  luisRegionState,
  deployLocationState,
  resourceGroupState,
  hostNameState,
} from '../recoilModel/atoms/resourceConfigurationState';
import { PublishProfileConfiguration } from '../types';
import { importConfigurationState } from '../recoilModel/atoms/importConfigurationState';

const defaultConfig: PublishProfileConfiguration = {
  tenantId: '',
  subscriptionId: '',
  deployLocation: '',
  hostName: '',
  luisRegion: '',
  resourceGroup: { isNew: false, name: '' },
};

export const usePublishProfileInitializer = () => {
  const { getName, publishConfig, getSchema } = usePublishApi();
  const { getItem } = useLocalStorage();

  const initialize = ({ set }: MutableSnapshot) => {
    const profile = { ...defaultConfig, ...(getItem(getName()) as PublishProfileConfiguration) };
    set(tenantState, profile.tenantId);
    set(subscriptionState, profile.subscriptionId);
    set(luisRegionState, profile.luisRegion);
    set(deployLocationState, profile.deployLocation);
    set(resourceGroupState, profile.resourceGroup);
    set(hostNameState, profile.hostName);
    set(importConfigurationState, {
      config: publishConfig || JSON.stringify(getSchema().default, null, 2),
      isValidConfiguration: true,
    });
  };

  return initialize;
};
