// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { usePublishApi } from '@bfc/extension-client';
import { selectorFamily } from 'recoil';

import { resourceConfigurationState } from '../atoms/resourceConfigurationState';

export const tenantIdSelectorFamily = selectorFamily<string, string>({
  key: 'tenantIdSelector',
  get: () => ({ get }) => {
    const { userShouldProvideTokens, getTenantIdFromCache } = usePublishApi();
    if (!userShouldProvideTokens()) {
      return get(resourceConfigurationState)?.tenantId ?? getTenantIdFromCache();
    } else return '';
  },
  set: () => ({ set, get }, newTenantId) => {
    const { setTenantId } = usePublishApi();
    setTenantId(newTenantId);
    set(resourceConfigurationState, { ...get(resourceConfigurationState), tenantId: newTenantId });
  },
});
