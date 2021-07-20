// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { usePublishApi } from '@bfc/extension-client';

import { importConfigurationState } from '../atoms/importConfigurationState';

export const importConfigurationDispatcher = () => {
  const setImportConfiguration = useRecoilCallback(({ set }: CallbackInterface) => (config: string) => {
    const { getSchema } = usePublishApi();
    set(importConfigurationState, () => {
      try {
        const parsedConfig = JSON.parse(config);

        return {
          config: JSON.stringify({ ...getSchema().default, ...parsedConfig }, null, 2),
          isValidConfiguration: true,
        };
      } catch {
        return {
          config,
          isValidConfiguration: false,
        };
      }
    });
  });
  return {
    setImportConfiguration,
  };
};
