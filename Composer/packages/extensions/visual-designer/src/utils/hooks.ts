// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useState, useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';

import { NodeRendererContext } from '../store/NodeRendererContext';

// matches [bfd<someName>-123456]
const TEMPLATE_PATTERN = /^\[(bfd.+-\d{6})\]$/;

const getTemplateId = (str?: string): string | null => {
  if (!str) {
    return null;
  }

  const match = TEMPLATE_PATTERN.exec(str);

  if (!match || !match[1]) {
    return null;
  }

  return match[1];
};

export const useLgTemplate = (str?: string, dialogId?: string) => {
  const { getLgTemplates } = useContext(NodeRendererContext);
  const [templateText, setTemplateText] = useState('');
  let cancelled = false;

  const updateTemplateText = async () => {
    const templateId = getTemplateId(str);

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

const getWindowDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
};

export const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
  const handleResize = useRef(debounce(() => setWindowDimensions(getWindowDimensions()), 200)).current;

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
};
