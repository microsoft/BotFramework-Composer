// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useState, useEffect } from 'react';
import { parseLgTemplateString } from 'shared';

import { NodeRendererContext } from '../store/NodeRendererContext';

export const useLgTemplate = (str?: string, dialogId?: string) => {
  const { getLgTemplates } = useContext(NodeRendererContext);
  const [templateText, setTemplateText] = useState('');
  let cancelled = false;

  const updateTemplateText = async () => {
    const lg = parseLgTemplateString(str || '');
    const templateId = lg ? lg.lgId : '';

    if (templateId && dialogId) {
      // this is an LG template, go get it's content
      if (!getLgTemplates || typeof getLgTemplates !== 'function') {
        setTemplateText(str || '');
      }

      const templates = getLgTemplates ? await getLgTemplates('common', `${templateId}`) : [];
      const [template] = templates.filter(template => {
        return template.Name === templateId;
      });

      if (cancelled) {
        return;
      }

      if (template && template.Body) {
        const [firstLine] = template.Body.split('\n');
        setTemplateText(firstLine.startsWith('-') ? firstLine.substring(1) : firstLine);
      } else {
        setTemplateText('');
      }
    } else if (!templateId) {
      // fallback to str passed in
      setTemplateText(str || '');
    }
  };

  useEffect(() => {
    updateTemplateText();

    return () => {
      cancelled = true;
    };
  });

  return templateText;
};
