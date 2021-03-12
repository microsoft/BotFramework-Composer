// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplate } from '@bfc/shared';
import React from 'react';

import { ArrayBasedStructuredResponseItem, PartialStructuredResponse } from '../types';
import { getTemplateId } from '../../utils/structuredResponse';
import { LGOption } from '../../utils/types';

const multiLineBlockSymbol = '```';

const getInitialItems = <T extends ArrayBasedStructuredResponseItem>(
  response: T,
  lgTemplates?: readonly LgTemplate[],
  focusOnMount?: boolean
): string[] => {
  const templateId = getTemplateId(response);
  const template = lgTemplates?.find(({ name }) => name === templateId);
  return response?.value && template?.body
    ? template?.body
        // Split by non-escaped -
        // eslint-disable-next-line security/detect-unsafe-regex
        ?.split(/(?<!\\)- /g)
        // Ignore empty or newline strings
        .filter((s) => s !== '' && s !== '\n')
        .map((s) => s.replace(/\r?\n$/g, ''))
        // Remove LG template multiline block symbol
        .map((s) => s.replace(/```/g, '')) || []
    : response?.value || (focusOnMount ? [''] : []);
};

const fixMultilineItems = (items: string[]) => {
  return items.map((item) => {
    if (/\r?\n/g.test(item)) {
      // Escape all un-escaped -
      // eslint-disable-next-line security/detect-unsafe-regex
      return `${multiLineBlockSymbol}${item.replace(/(?<!\\)-/g, '\\-')}${multiLineBlockSymbol}`;
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
  const [items, setItems] = React.useState<string[]>(getInitialItems(structuredResponse, lgTemplates, focusOnMount));

  const onChange = React.useCallback(
    (newItems: string[]) => {
      setItems(newItems);
      // Fix variations that are multiline
      // If only one item but it's multiline, still use helper LG template
      const fixedNewItems = fixMultilineItems(newItems);
      const id = templateId || `${lgOption?.templateId}_${newTemplateNameSuffix}`;
      if (!fixedNewItems.length) {
        setTemplateId(id);
        onUpdateResponseTemplate({ [kind]: { kind, value: [], valueType: 'direct' } });
        onRemoveTemplate(id);
      } else if (fixedNewItems.length === 1 && !/\r?\n/g.test(fixedNewItems[0]) && lgOption?.templateId) {
        onUpdateResponseTemplate({ [kind]: { kind, value: fixedNewItems, valueType: 'direct' } });
        onTemplateChange(id, '');
      } else {
        setTemplateId(id);
        onUpdateResponseTemplate({ [kind]: { kind, value: [`\${${id}()}`], valueType: 'template' } });
        onTemplateChange(id, fixedNewItems.map((item) => `- ${item}`).join('\n'));
      }
    },
    [kind, newTemplateNameSuffix, lgOption, templateId, onRemoveTemplate, onTemplateChange, onUpdateResponseTemplate]
  );

  return { items, onChange };
};
