// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotTemplate } from '@bfc/shared';
import { selector } from 'recoil';

import { featureFlagsState, templateProjectsState } from '../atoms/appState';

export const filteredTemplatesSelector = selector({
  key: 'filteredTemplatesSelector',
  get: ({ get }) => {
    const templates = get(templateProjectsState);
    const featureFlags = get(featureFlagsState);

    let filteredTemplates = [...templates];
    if (!featureFlags?.REMOTE_TEMPLATE_CREATION_EXPERIENCE?.enabled) {
      filteredTemplates = filteredTemplates.filter((template: BotTemplate) => {
        if (template.path) {
          return template;
        }
      });
    }
    return filteredTemplates;
  },
});
