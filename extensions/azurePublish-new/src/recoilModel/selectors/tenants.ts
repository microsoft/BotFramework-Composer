// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { usePublishApi } from '@bfc/extension-client';
import { selector } from 'recoil';

export const tenantIdSelector = selector({
  key: 'tenantIdSelector',
  get: () => {
    const { userShouldProvideTokens, getTenantIdFromCache } = usePublishApi();
    if (!userShouldProvideTokens()) {
      return getTenantIdFromCache();
    } else return '';
  },
});
