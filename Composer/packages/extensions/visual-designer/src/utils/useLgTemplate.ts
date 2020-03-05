// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext } from 'react';
import { LgTemplateRef } from '@bfc/shared';
import get from 'lodash/get';

import { NodeRendererContext } from '../store/NodeRendererContext';

export const queryLgTemplateFromFiles = (lgTemplateName: string, lgFiles: any): string | undefined => {
  if (!Array.isArray(lgFiles)) return;

  const allTemplates: any[] = [];
  for (const file of lgFiles) {
    const templates = get(file, 'templates');
    if (Array.isArray(templates)) {
      allTemplates.push(...templates);
    }
  }

  const result = allTemplates.find(x => get(x, 'name') === lgTemplateName);
  return result ? get(result, 'body') : undefined;
};

const normalizeLgBody = (body: string): string => {
  if (!body) return '';
  const [firstLine] = body.split('\n');
  return firstLine.startsWith('-') ? firstLine.substring(1) : firstLine;
};

export const useLgTemplate = (str?: string) => {
  const { getLgBodySync } = useContext(NodeRendererContext);

  const lgTemplateRef = LgTemplateRef.parse(str || '');
  const templateId = lgTemplateRef ? lgTemplateRef.name : '';

  // fallback to input string
  if (!templateId) return str;

  const lgBody = getLgBodySync(templateId) || '';
  return normalizeLgBody(lgBody);
};
