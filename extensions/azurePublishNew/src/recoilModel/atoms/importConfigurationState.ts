// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { atom } from 'recoil';

import { ImportConfiguration } from '../../types';

export const importConfigurationState = atom<ImportConfiguration>({
  key: 'importConfiguration',
  default: { isValidConfiguration: true, config: '{}' },
});
