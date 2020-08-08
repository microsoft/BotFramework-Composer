// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplateRef, LgFile, LgTemplate } from '@bfc/shared';
import { useShellApi } from '@bfc/extension';

export const queryLgTemplate = (templateId: string, lgFileId: string, lgFiles: LgFile[]): LgTemplate | undefined => {
  return lgFiles.find(({ id }) => id === lgFileId)?.templates?.find(({ name }) => name === templateId);
};

export const useLgTemplate = (str?: string) => {
  const { currentDialog, lgFiles, locale } = useShellApi();
  const lgFileId = `${currentDialog.lgFile}.${locale}`;

  const lgTemplateRef = LgTemplateRef.parse(str || '');
  const templateId = lgTemplateRef ? lgTemplateRef.name : '';

  // fallback to input string
  if (!templateId) return str || '';

  const lgTemplate = queryLgTemplate(templateId, lgFileId, lgFiles);
  return lgTemplate ? lgTemplate.body : '';
};
