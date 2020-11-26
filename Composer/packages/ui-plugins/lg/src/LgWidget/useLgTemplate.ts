// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplateRef } from '@bfc/shared';
import { useShellApi } from '@bfc/extension-client';

import { locateLgTemplatePosition } from '../locateLgTemplatePosition';

export const useLgTemplate = (rawText = ''): string => {
  const { lgFiles, locale } = useShellApi();

  const lgTemplateRef = LgTemplateRef.parse(rawText || '');
  const templateId = lgTemplateRef ? lgTemplateRef.name : '';

  // fallback to input string
  if (!templateId) return rawText;

  const relatedLgFile = locateLgTemplatePosition(lgFiles, templateId, locale);
  if (!relatedLgFile) return rawText;

  const lgTemplate = relatedLgFile.templates.find((t) => t.name === templateId);
  if (!lgTemplate) return rawText;

  return lgTemplate.body;
};
