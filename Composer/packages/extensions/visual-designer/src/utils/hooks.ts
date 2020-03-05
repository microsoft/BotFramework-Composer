// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useState, useEffect } from 'react';
import { LgTemplateRef } from '@bfc/shared';

import { NodeRendererContext } from '../store/NodeRendererContext';

export const useLgTemplate = (str?: string, dialogId?: string) => {
  const { getLgTemplates } = useContext(NodeRendererContext);
  const [templateText, setTemplateText] = useState('');
  let cancelled = false;

  const updateTemplateText = async () => {
    const lgTemplateRef = LgTemplateRef.parse(str || '');
    const templateId = lgTemplateRef ? lgTemplateRef.name : '';

    if (templateId && dialogId) {
      // this is an LG template, go get it's content
      if (!getLgTemplates || typeof getLgTemplates !== 'function') {
        setTemplateText(str || '');
        return;
      }

      const templates = getLgTemplates ? await getLgTemplates('common') : [];
      const [template] = templates.filter(({ name }) => {
        return name === templateId;
      });

      if (cancelled) {
        return;
      }

      if (template && template.body) {
        const [firstLine] = template.body.split('\n');
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
