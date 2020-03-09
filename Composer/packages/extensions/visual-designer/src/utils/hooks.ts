// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useState, useEffect, useRef } from 'react';
import debounce from 'lodash/debounce';
import { LgTemplateRef } from '@bfc/shared';

import { NodeRendererContext } from '../store/NodeRendererContext';

import { normalizeLgTemplate } from './normalizeLgTemplate';

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
        setTemplateText(normalizeLgTemplate(template));
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
