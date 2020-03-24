// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext } from 'react';
import { LGTemplate } from 'botbuilder-lg';
import { LgTemplateRef } from '@bfc/shared';
import get from 'lodash/get';

import { NodeRendererContext } from '../store/NodeRendererContext';
import { normalizeLgTemplate } from '../utils/normalizeLgTemplate';

export const queryLgTemplateFromFiles = (lgTemplateName: string, lgFiles: any): LGTemplate | undefined => {
  if (!Array.isArray(lgFiles)) return;

  const allTemplates: LGTemplate[] = [];
  for (const file of lgFiles) {
    const templates = get(file, 'templates');
    if (Array.isArray(templates)) {
      allTemplates.push(...templates);
    }
  }

  const result = allTemplates.find(x => get(x, 'name') === lgTemplateName);
  return result;
};

export const useLgTemplate = (str?: string) => {
  const { getLgTemplateSync } = useContext(NodeRendererContext);

  const lgTemplateRef = LgTemplateRef.parse(str || '');
  const templateId = lgTemplateRef ? lgTemplateRef.name : '';

  // fallback to input string
  if (!templateId) return str;

  const lgTemplate = getLgTemplateSync(templateId);
  return lgTemplate ? normalizeLgTemplate(lgTemplate) : '';
};
