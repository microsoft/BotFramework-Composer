// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useState } from 'react';
import { ProjectTemplate } from '@bfc/shared';

import { useFeatureFlag } from './useFeatureFlag';

export const useFilteredTemplates = (templates: ProjectTemplate[]): ProjectTemplate[] => {
  const [filteredTemplates, setFilteredTemplates] = useState([] as ProjectTemplate[]);
  const showVaCreation = useFeatureFlag('VA_CREATION');
  useEffect(() => {
    if (templates.length > 1) {
      setFilteredTemplates([...templates]);
    }
  }, [templates]);

  useEffect(() => {
    if (filteredTemplates.length > 0) {
      const vaTemplateIndex = filteredTemplates.findIndex((template) => template.id === 'va-core');
      if (vaTemplateIndex === -1 && showVaCreation) {
        setFilteredTemplates([...templates]);
      } else if (vaTemplateIndex !== -1 && !showVaCreation) {
        filteredTemplates.splice(vaTemplateIndex, 1);
      }
    }
  }, [templates]);

  return filteredTemplates;
};
