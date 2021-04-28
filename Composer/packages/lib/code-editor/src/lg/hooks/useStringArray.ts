/* eslint-disable security/detect-unsafe-regex */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplate } from '@bfc/shared';
import React from 'react';
import { TemplateBodyItem, parseTemplateBody, templateBodyItemsToString } from '@bfc/shared';

import { ArrayBasedStructuredResponseItem, PartialStructuredResponse } from '../types';
import { getTemplateId } from '../../utils/structuredResponse';
import { LGOption } from '../../utils/types';

const multiLineBlockSymbol = '```';

const getInitialItems = <T extends ArrayBasedStructuredResponseItem>(
  response: T,
  lgTemplates?: readonly LgTemplate[],
  focusOnMount?: boolean
): TemplateBodyItem[] => {
  const templateId = getTemplateId(response);
  const template = lgTemplates?.find(({ name }) => name === templateId);
  return response?.value && template?.body
    ? parseTemplateBody(template?.body)
        // Remove LG template multiline block symbol
        .map((s) => ({ ...s, value: s.value.replace(/```/g, '') })) ?? []
    : response?.value.map((v) => ({ kind: 'variation', value: v })) ||
        (focusOnMount ? [{ kind: 'variation', value: '' }] : []);
};

const fixMultilineItems = (items: TemplateBodyItem[]) => {
  return items.map((item) => {
    if (item.kind === 'variation' && /\r?\n/g.test(item.value)) {
      return {
        ...item,
        // Escape all un-escaped -
        value: `${multiLineBlockSymbol}${item.value.replace(/(?<!\\)-/g, '\\-')}${multiLineBlockSymbol}`,
      };
    }

    return item;
  });
};

export const useStringArray = <T extends ArrayBasedStructuredResponseItem>(
  kind: 'Text' | 'Speak',
  structuredResponse: T,
  callbacks: {
    onRemoveTemplate: (templateId: string) => void;
    onTemplateChange: (templateId: string, body?: string) => void;
    onUpdateResponseTemplate: (response: PartialStructuredResponse) => void;
  },
  options?: {
    focusOnMount?: boolean;
    lgOption?: LGOption;
    lgTemplates?: readonly LgTemplate[];
  }
) => {
  const newTemplateNameSuffix = React.useMemo(() => kind.toLowerCase(), [kind]);

  const { onRemoveTemplate, onTemplateChange, onUpdateResponseTemplate } = callbacks;
  const { lgOption, lgTemplates, focusOnMount } = options || {};

  const [templateId, setTemplateId] = React.useState(getTemplateId(structuredResponse));
  const [items, setItems] = React.useState<TemplateBodyItem[]>(
    getInitialItems(structuredResponse, lgTemplates, focusOnMount)
  );

  const onChange = React.useCallback(
    (newItems: TemplateBodyItem[]) => {
      setItems(newItems);
      // Fix variations that are multiline
      // If only one item but it's multiline, still use helper LG template
      const fixedNewItems = fixMultilineItems(newItems);
      const id = templateId || `${lgOption?.templateId}_${newTemplateNameSuffix}`;
      if (!fixedNewItems.length) {
        setTemplateId(id);
        onUpdateResponseTemplate({ [kind]: { kind, value: [], valueType: 'direct' } });
        onRemoveTemplate(id);
      } else if (fixedNewItems.length === 1 && !/\r?\n/g.test(fixedNewItems[0].value) && lgOption?.templateId) {
        onUpdateResponseTemplate({ [kind]: { kind, value: [fixedNewItems[0].value], valueType: 'direct' } });
        onTemplateChange(id, '');
      } else {
        setTemplateId(id);
        onUpdateResponseTemplate({ [kind]: { kind, value: [`\${${id}()}`], valueType: 'template' } });
        onTemplateChange(id, templateBodyItemsToString(fixedNewItems));
      }
    },
    [kind, newTemplateNameSuffix, lgOption, templateId, onRemoveTemplate, onTemplateChange, onUpdateResponseTemplate]
  );

  return { items, onChange };
};
