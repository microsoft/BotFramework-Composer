// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgType, LgTemplateRef, LgMetaData } from '@bfc/shared';
import { BaseSchema, ShellApi } from '@bfc/types';

/**
 * LG CRUD lib
 */
export const useLgApi = (shellApi: ShellApi) => {
  const { removeLgTemplates, getLgTemplates, addLgTemplate } = shellApi;

  const deleteLgTemplates = (lgFileId: string, lgTemplates: string[]) => {
    const normalizedLgTemplates = lgTemplates
      .map((x) => {
        const lgTemplateRef = LgTemplateRef.parse(x);
        return lgTemplateRef ? lgTemplateRef.name : '';
      })
      .filter((x) => !!x);
    return removeLgTemplates(lgFileId, normalizedLgTemplates);
  };

  const readLgTemplate = (lgFileId: string, lgText: string) => {
    if (!lgText) return '';

    const inputLgRef = LgTemplateRef.parse(lgText);
    if (!inputLgRef) return lgText;

    const lgTemplates = getLgTemplates(inputLgRef.name);
    if (!Array.isArray(lgTemplates) || !lgTemplates.length) return lgText;

    const targetTemplate = lgTemplates.find((x) => x.name === inputLgRef.name);
    return targetTemplate ? targetTemplate.body : lgText;
  };

  const createLgTemplate = async (
    lgFileId: string,
    lgText: string,
    hostActionId: string,
    hostActionData: BaseSchema,
    hostFieldName: string
  ): Promise<string> => {
    if (!lgText) return '';
    const newLgType = new LgType(hostActionData.$kind, hostFieldName).toString();
    const newLgTemplateName = new LgMetaData(newLgType, hostActionId).toString();
    const newLgTemplateRefStr = new LgTemplateRef(newLgTemplateName).toString();
    await addLgTemplate(lgFileId, newLgTemplateName, lgText);
    return newLgTemplateRefStr;
  };

  return {
    createLgTemplate,
    readLgTemplate,
    deleteLgTemplate: (lgFileId: string, lgTemplate: string) => deleteLgTemplates(lgFileId, [lgTemplate]),
    deleteLgTemplates,
  };
};
