// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selector } from 'recoil';

import { extensionsState, featureFlagsState } from '../atoms/appState';
import { ExtensionPageConfig } from '../../utils/pageLinks';

export const enabledExtensionsSelector = selector({
  key: 'enabledExtensionsSelector',
  get: ({ get }) => {
    const extensions = get(extensionsState);

    return extensions.filter((e) => e.enabled);
  },
});

export const pluginPagesSelector = selector({
  key: 'pluginPagesSelector',
  get: ({ get }) => {
    const extensions = get(enabledExtensionsSelector);
    const featureFlags = get(featureFlagsState);

    return extensions.reduce((pages, p) => {
      const pagesConfig = p.contributes?.views?.pages;
      if (Array.isArray(pagesConfig) && pagesConfig.length > 0) {
        pages.push(...pagesConfig.map((page) => ({ ...page, id: p.id })));
      }
      return pages;
    }, [] as ExtensionPageConfig[]);
  },
});
