// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplate } from '@bfc/shared';

import { activityTemplateType } from '../lg/constants';
import {
  acceptedAttachmentLayout,
  acceptedInputHintValues,
  ArrayBasedStructuredResponseItem,
  AttachmentLayoutStructuredResponseItem,
  AttachmentsStructuredResponseItem,
  InputHintStructuredResponseItem,
  PartialStructuredResponse,
  SpeechStructuredResponseItem,
  StructuredResponseItem,
  SuggestedActionsStructuredResponseItem,
  TextStructuredResponseItem,
} from '../lg/types';

const subTemplateNameRegex = /\${(.*)}/;
const templateNameExtractRegex = /\${(.*)(\(.*\))\s*}/;
const defaultIndent = '    ';

const getStructuredResponseHelper = (value: unknown, kind: 'Text' | 'Speak' | 'Attachments') => {
  if (typeof value === 'string') {
    const valueAsString = value as string;
    const valueType = subTemplateNameRegex.test(valueAsString) ? 'template' : 'direct';

    return { kind, value: [valueAsString.trim()], valueType };
  }

  if (Array.isArray(value) && kind === 'Attachments') {
    const valueAsArray = (value as string[]).map((v) => v.trim());

    return { kind, value: valueAsArray, valueType: 'direct' };
  }

  return undefined;
};

const getStructuredResponseByKind = (
  template: LgTemplate,
  kind: StructuredResponseItem['kind']
): StructuredResponseItem | undefined => {
  const value = template.properties?.[kind];
  if (value === undefined) {
    return undefined;
  }

  switch (kind) {
    case 'Text':
      return getStructuredResponseHelper(value, 'Text') as TextStructuredResponseItem;
    case 'Speak':
      return getStructuredResponseHelper(value, 'Speak') as SpeechStructuredResponseItem;
    case 'Attachments':
      return getStructuredResponseHelper(value, 'Attachments') as AttachmentsStructuredResponseItem;
    case 'SuggestedActions': {
      if (Array.isArray(value)) {
        const responseValue = (value as string[]).map((v) => v.trim());
        return { kind: 'SuggestedActions', value: responseValue } as SuggestedActionsStructuredResponseItem;
      }
      break;
    }
    case 'AttachmentLayout':
      if (acceptedAttachmentLayout.includes(value as typeof acceptedAttachmentLayout[number])) {
        return {
          kind: 'AttachmentLayout',
          value: value as typeof acceptedAttachmentLayout[number],
        } as AttachmentLayoutStructuredResponseItem;
      }
      break;
    case 'InputHint':
      if (acceptedInputHintValues.includes(value as typeof acceptedInputHintValues[number])) {
        return {
          kind: 'InputHint',
          value: value as typeof acceptedInputHintValues[number],
        } as InputHintStructuredResponseItem;
      }
      break;
  }

  return undefined;
};

/**
 * Converts template properties to structured response.
 * @param lgTemplate LgTemplate to convert.
 */
export const getStructuredResponseFromTemplate = (lgTemplate?: LgTemplate): PartialStructuredResponse | undefined => {
  if (!lgTemplate) {
    return undefined;
  }
  if (!lgTemplate.body) {
    return undefined;
  }

  if (lgTemplate.properties?.$type !== activityTemplateType) {
    return undefined;
  }

  if (!Object.keys(lgTemplate.properties).length) {
    return undefined;
  }

  const structuredResponse: PartialStructuredResponse = Object.keys(lgTemplate.properties).reduce((response, kind) => {
    const value = getStructuredResponseByKind(lgTemplate, kind as StructuredResponseItem['kind']);
    if (value !== undefined) {
      response[kind] = value;
    }

    return response;
  }, {} as PartialStructuredResponse);

  return Object.keys(structuredResponse).length ? structuredResponse : undefined;
};

/**
 * Extracts template name from an LG expression
 * ${templateName(params)} => templateName
 * @param expression Expression to extract template name from.
 */
export const extractTemplateNameFromExpression = (expression: string): string | undefined =>
  expression.match(templateNameExtractRegex)?.[1]?.trim();

export const structuredResponseToString = (structuredResponse: PartialStructuredResponse): string => {
  const keys = Object.keys(structuredResponse);

  if (!keys.length) {
    return '';
  }

  const getValue = (kind: StructuredResponseItem['kind']): string | undefined => {
    switch (kind) {
      case 'Speak': {
        const item = structuredResponse.Speak as SpeechStructuredResponseItem;
        return item.value[0];
      }
      case 'Text': {
        const item = structuredResponse.Text as TextStructuredResponseItem;
        return item.value[0];
      }
      case 'InputHint': {
        const item = structuredResponse.InputHint as InputHintStructuredResponseItem;
        return item?.value;
      }
      case 'AttachmentLayout': {
        const item = structuredResponse.AttachmentLayout as AttachmentLayoutStructuredResponseItem;
        return item?.value;
      }
      case 'SuggestedActions': {
        const item = structuredResponse.SuggestedActions as SuggestedActionsStructuredResponseItem;
        return item.value.join(' | ');
      }
      case 'Attachments': {
        const item = structuredResponse.Attachments as AttachmentsStructuredResponseItem;
        return item.value.join(' | ');
      }
    }
  };

  const body = keys.reduce((text, kind) => {
    const value = getValue(kind as StructuredResponseItem['kind']);

    if (value) {
      text += `\t${kind} = ${value}\n`;
    }
    return text;
  }, '');

  return body ? `[${activityTemplateType}\n${body}]\n`.replace(/\t/gm, defaultIndent) : '';
};

export const getTemplateId = <T extends ArrayBasedStructuredResponseItem>(response: T): string | undefined => {
  if (response?.value[0]) {
    return extractTemplateNameFromExpression(response.value[0]);
  }
};
