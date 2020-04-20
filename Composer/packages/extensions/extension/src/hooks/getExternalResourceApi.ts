// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplateRef, LgMetaData, ShellApi } from '@bfc/shared';

/**
 * External resources (LU, LG) CRUD lib with shell context bound
 */
export const getExternalResourceApi = (shellApi: ShellApi) => {
  const { removeLgTemplates, removeLuIntent, getLgTemplates, updateLgTemplate } = shellApi;

  const deleteLgTemplates = (lgFileId: string, lgTemplates: string[]) => {
    const normalizedLgTemplates = lgTemplates
      .map(x => {
        const lgTemplateRef = LgTemplateRef.parse(x);
        return lgTemplateRef ? lgTemplateRef.name : '';
      })
      .filter(x => !!x);
    return removeLgTemplates(lgFileId, normalizedLgTemplates);
  };

  const deleteLuIntents = (luFileId: string, luIntents: string[]) => {
    return Promise.all(luIntents.map(intent => removeLuIntent(luFileId, intent)));
  };

  const readLgTemplate = async (lgFileId: string, lgText: string): Promise<string> => {
    if (!lgText) return '';

    const inputLgRef = LgTemplateRef.parse(lgText);
    if (!inputLgRef) return lgText;

    const lgTemplates = await getLgTemplates(inputLgRef.name);
    if (!Array.isArray(lgTemplates) || !lgTemplates.length) return lgText;

    const targetTemplate = lgTemplates.find(x => x.name === inputLgRef.name);
    return targetTemplate ? targetTemplate.body : lgText;
  };

  const createLgTemplate = async (
    lgFileId: string,
    nodeId: string,
    lgType: string,
    lgText: string
  ): Promise<string> => {
    if (!lgText) return '';
    const newLgTemplateName = new LgMetaData(lgType, nodeId).toString();
    const newLgTemplateRefStr = new LgTemplateRef(newLgTemplateName).toString();
    await updateLgTemplate(lgFileId, newLgTemplateName, lgText);
    return newLgTemplateRefStr;
  };

  return {
    createLgTemplate,
    readLgTemplate,
    deleteLgTemplate: (lgFileId: string, lgTemplate: string) => deleteLgTemplates(lgFileId, [lgTemplate]),
    deleteLgTemplates,
    deleteLuIntent: (luFileId: string, luIntent: string) => deleteLuIntents(luFileId, [luIntent]),
    deleteLuIntents,
  };
};
