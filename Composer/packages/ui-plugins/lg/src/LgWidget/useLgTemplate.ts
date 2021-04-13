// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplateRef } from '@bfc/shared';
import { LgTemplate, useShellApi } from '@bfc/extension-client';

import { locateLgTemplatePosition } from '../locateLgTemplatePosition';

const exprRegex = /^\${(.*)\(\)}$/;

const getAttachmentDisplayText = (template: LgTemplate) => {
  const cardType = template.properties?.$type as string;
  const title = (template.properties?.title as string) ?? '';
  return cardType ? `[${cardType}] ${title}` : template.body;
};

/**
 * Converts lg template to text or rich data if it has structured response to be displayed.
 * @param template Lg template to be converted.
 * @param templates List of all Lg templates.
 * @returns Either string or rich data to be consumed by LgWidget.
 */
const getLgTemplateTextData = (
  template: LgTemplate,
  templates: readonly LgTemplate[]
): string | Record<string, { value: string; moreCount?: number }> => {
  // If template has structured response
  if (template.properties?.$type === 'Activity') {
    const response = ['Text', 'Speak', 'Attachments', 'SuggestedActions'].reduce((acc, responseType) => {
      if (template.properties?.[responseType]) {
        if (responseType === 'Text' || responseType === 'Speak') {
          const subTemplateItem = template.properties[responseType];
          if (subTemplateItem && typeof subTemplateItem === 'string') {
            const matched = subTemplateItem.trim().match(exprRegex);
            //If it's a template
            if (matched && matched.length > 1) {
              const subTemplateId = matched[1];
              const subTemplate = templates.find((x) => x.name === subTemplateId);
              // If found template and it matches auto-generated names
              if (subTemplate) {
                const lines =
                  subTemplate.body
                    // eslint-disable-next-line security/detect-unsafe-regex
                    .split(/(?<!\\)- /g)
                    // Ignore empty or newline strings
                    .filter((s) => s !== '' && s !== '\n')
                    .map((s) => s.replace(/\r?\n$/g, ''))
                    // Remove LG template multiline block symbol
                    .map((s) => s.replace(/```/g, '')) || [];
                if (lines.length) {
                  acc[responseType] = { value: lines[0].replace(/\r?\n/g, '↵'), moreCount: lines.length - 1 };
                }
              }
            } else {
              acc[responseType] = { value: subTemplateItem, moreCount: 0 };
            }
          }
        } else if (responseType === 'Attachments' || responseType === 'SuggestedActions') {
          const subTemplateItems = (Array.isArray(template.properties[responseType])
            ? template.properties[responseType]
            : [template.properties[responseType]]) as string[];
          const subTemplateItem = subTemplateItems[0];
          if (subTemplateItem && typeof subTemplateItem === 'string') {
            const matched = subTemplateItem.trim().match(exprRegex);
            //If it's a template
            if (matched && matched.length > 1) {
              const subTemplateId = matched[1];
              const subTemplate = templates.find((x) => x.name === subTemplateId);
              if (subTemplate) {
                acc[responseType] = {
                  value: getAttachmentDisplayText(subTemplate),
                  moreCount: subTemplateItems.length - 1,
                };
              }
            } else {
              acc[responseType] = { value: subTemplateItem, moreCount: subTemplateItems.length - 1 };
            }
          }
        }
      }
      return acc;
    }, {} as Record<string, { value: string; moreCount?: number }>);

    if (Object.keys(response).length === 0) {
      return template.body;
    }

    return response;
  }

  return template.body;
};

export const useLgTemplate = (rawText = ''): string | Record<string, { value: string; moreCount?: number }> => {
  const { lgFiles, locale } = useShellApi();

  const lgTemplateRef = LgTemplateRef.parse(rawText || '');
  const templateId = lgTemplateRef ? lgTemplateRef.name : '';

  // fallback to input string
  if (!templateId) return rawText;

  const relatedLgFile = locateLgTemplatePosition(lgFiles, templateId, locale);
  if (!relatedLgFile) return rawText;

  const lgTemplate = relatedLgFile.templates.find((t) => t.name === templateId);
  if (!lgTemplate) return rawText;

  return getLgTemplateTextData(lgTemplate, relatedLgFile.allTemplates);
};
