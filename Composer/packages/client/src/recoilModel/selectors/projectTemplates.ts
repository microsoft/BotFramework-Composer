// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selector } from 'recoil';

import { featureFlagsState, templateProjectsState } from '../atoms/appState';

export const filteredTemplatesSelector = selector({
  key: 'filteredTemplatesSelector',
  get: ({ get }) => {
    const templates = get(templateProjectsState);
    const featureFlags = get(featureFlagsState);

    const filteredTemplates = [...templates];
    if (!featureFlags?.VA_CREATION?.enabled) {
      const vaTemplateIndex = filteredTemplates.findIndex((template) => template.id === 'va-core');
      if (vaTemplateIndex !== -1) {
        filteredTemplates.splice(vaTemplateIndex, 1);
      }
    }
    if (!featureFlags?.REMOTE_TEMPLATE_CREATION_EXPERIENCE?.enabled) {
      let index = filteredTemplates.length - 1;

      while (index >= 0) {
        if (!filteredTemplates[index].path) {
          filteredTemplates.splice(index, 1);
        }
        index -= 1;
      }
    }
    return filteredTemplates;
  },
});
