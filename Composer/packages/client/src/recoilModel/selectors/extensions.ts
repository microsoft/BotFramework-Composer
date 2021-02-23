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
        // TODO: This code is present to enable the package manager to be behind a feature flag.
        // When this is no longer necessary, we should remove this conditional!
        if (p.id !== 'package-manager' || featureFlags?.NEW_CREATION_FLOW?.enabled === true) {
          pages.push(...pagesConfig.map((page) => ({ ...page, id: p.id })));
        }
      }
      return pages;
    }, [] as ExtensionPageConfig[]);
  },
});
