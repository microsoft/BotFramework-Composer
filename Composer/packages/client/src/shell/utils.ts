// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgMetaData, LgTemplateRef, LgType } from '@bfc/shared';
import { LgTemplate, MicrosoftIDialog, ShellApi } from '@botframework-composer/types';

type SerializableLg = {
  originalId: string;
  mainTemplateBody?: string;
  relatedLgTemplateBodies?: Record<string, string>;
};

/**
 * Serializes Lg template to JSON format.
 * @param templateName Name of the template to be serialized.
 * @param fromId Original id of the wrapper template.
 * @param lgText Body of the template.
 * @param lgTemplates List of all available Lg templates
 * @returns A serialized string representing the Lg template.
 */
export const serializeLgTemplate = (
  templateName: string,
  fromId: string,
  lgText: string,
  lgTemplates: LgTemplate[]
) => {
  const lgTemplate = lgTemplates.find((x) => x.name === templateName);

  if (!lgTemplate) {
    return '';
  }

  const exprRegex = /^\${(.*)\(\)}$/;
  const serializableLg: SerializableLg = {
    originalId: fromId,
    mainTemplateBody: lgTemplate?.body,
  };

  // This section serializes structured responses.
  if (lgTemplate?.properties?.$type === 'Activity') {
    for (const responseType of ['Text', 'Speak', 'Attachments']) {
      if (lgTemplate.properties[responseType]) {
        const subTemplateItems = Array.isArray(lgTemplate.properties[responseType])
          ? (lgTemplate.properties[responseType] as string[])
          : ([lgTemplate.properties[responseType]] as string[]);
        for (const subTemplateItem of subTemplateItems) {
          const matched = subTemplateItem.trim().match(exprRegex);
          if (matched && matched.length > 1) {
            const subTemplateId = matched[1];
            const subTemplate = lgTemplates.find((x) => x.name === subTemplateId);
            if (subTemplate) {
              if (!serializableLg.relatedLgTemplateBodies) {
                serializableLg.relatedLgTemplateBodies = {};
              }
              serializableLg.relatedLgTemplateBodies[subTemplateId] = subTemplate.body;
            }
          }
        }
      }
    }
  }

  return lgTemplate ? JSON.stringify(serializableLg) : lgText;
};

/**
 * Deserialize serialized Lg template and create all required templates.
 * @param lgFileId Lg file id that hosts the template.
 * @param toId New wrapper if for the Lg template.
 * @param lgText Serialized body of the template.
 * @param hostActionData Hosting dialog data.
 * @param hostFieldName Hosting field name.
 * @param addLgTemplate Api for creating a new template.
 * @returns Deserialized template expression.
 */
export const deserializeLgTemplate = async (
  lgFileId: string,
  toId: string,
  lgText: string,
  hostActionData: MicrosoftIDialog,
  hostFieldName: string,
  addLgTemplate: ShellApi['addLgTemplate']
) => {
  const newLgType = new LgType(hostActionData.$kind, hostFieldName).toString();
  const newLgTemplateName = new LgMetaData(newLgType, toId).toString();
  const newLgTemplateRefStr = new LgTemplateRef(newLgTemplateName).toString();

  try {
    const serializableLg = JSON.parse(lgText) as SerializableLg;
    // It's a serialized JSON string
    const { originalId, mainTemplateBody, relatedLgTemplateBodies } = serializableLg;

    const pattern = `${originalId}`;
    // eslint-disable-next-line security/detect-non-literal-regexp
    const regex = new RegExp(pattern, 'g');

    // Re-create related Lg templates
    if (relatedLgTemplateBodies) {
      for (const subTemplateId of Object.keys(relatedLgTemplateBodies)) {
        const subTemplateBody = relatedLgTemplateBodies[subTemplateId];
        await addLgTemplate(lgFileId, subTemplateId.replace(regex, toId), subTemplateBody);
      }
    }

    // Create the target Lg template
    await addLgTemplate(lgFileId, newLgTemplateName, mainTemplateBody?.replace(regex, toId) ?? '');
  } catch {
    // It's a normal string, just create the target Lg template
    await addLgTemplate(lgFileId, newLgTemplateName, lgText);
  }
  return newLgTemplateRefStr;
};
