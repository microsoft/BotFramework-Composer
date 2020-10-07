// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selector } from 'recoil';

import { extensionsState } from '../atoms/appState';

export const enabledExtensionsSelector = selector({
  key: 'enabledExtensionsSelector',
  get: ({ get }) => {
    const extensions = get(extensionsState);

    return extensions.filter((e) => e.enabled);
  },
});
