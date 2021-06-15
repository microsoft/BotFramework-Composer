// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { atom } from 'recoil';

import { ImportConfiguration } from '../../types';

export const importConfigurationState = atom<ImportConfiguration>({
  key: 'import_configuration',
  default: { isValidConfiguration: false, config: '' },
});
