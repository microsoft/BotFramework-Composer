// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplate } from '@bfc/shared';
import React from 'react';

import { ArrayBasedStructuredResponseItem, PartialStructuredResponse } from '../types';
import { getTemplateId } from '../../utils/structuredResponse';
import { LGOption } from '../../utils/types';

const getInitialItems = <T extends ArrayBasedStructuredResponseItem>(
  response: T,
  lgTemplates?: readonly LgTemplate[]
): string[] => {
  const templateId = getTemplateId(response);
  const template = lgTemplates?.find(({ name }) => name === templateId);
  return response?.value && template?.body
    ? template?.body?.replace(/- /g, '').split(/\r?\n/g) || []
    : response?.value || [];
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
    lgOption?: LGOption;
    lgTemplates?: readonly LgTemplate[];
  }
) => {
  const newTemplateNameSuffix = React.useMemo(() => kind.toLowerCase(), [kind]);

  const { onRemoveTemplate, onTemplateChange, onUpdateResponseTemplate } = callbacks;
  const { lgOption, lgTemplates } = options || {};

  const [templateId, setTemplateId] = React.useState(getTemplateId(structuredResponse));
  const [items, setItems] = React.useState<string[]>(getInitialItems(structuredResponse, lgTemplates));

  const onChange = React.useCallback(
    (newItems: string[]) => {
      setItems(newItems);
      const id = templateId || `${lgOption?.templateId}_${newTemplateNameSuffix}`;
      if (!newItems.length) {
        setTemplateId(id);
        onUpdateResponseTemplate({ [kind]: { kind, value: [], valueType: 'direct' } });
        onRemoveTemplate(id);
      } else if (newItems.length === 1 && lgOption?.templateId) {
        onUpdateResponseTemplate({ [kind]: { kind, value: newItems, valueType: 'direct' } });
        onTemplateChange(id, '');
      } else {
        setTemplateId(id);
        onUpdateResponseTemplate({ [kind]: { kind, value: [`\${${id}()}`], valueType: 'template' } });
        onTemplateChange(id, newItems.map((item) => `- ${item}`).join('\n'));
      }
    },
    [kind, newTemplateNameSuffix, lgOption, templateId, onRemoveTemplate, onTemplateChange, onUpdateResponseTemplate]
  );

  return { items, onChange };
};
