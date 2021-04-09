// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useRef, useState } from 'react';
import { LgTemplate } from '@botframework-composer/types';

import { useLgApi } from '@bfc/extension-client';

type TemplateStatus = 'loading' | 'loaded';

export const useLgTemplates = () => {
  const { getLgTemplates } = useLgApi();

  const [templateStatus, setTemplateStatus] = useState<TemplateStatus>('loading');
  const [lgTemplates, setLgTemplates] = useState<LgTemplate[]>([]);

  // Poll lg templates
  const start = useRef(Date.now());
  useEffect(() => {
    let interval;
    if (templateStatus === 'loading') {
      // Poll getLgTemplates every 500ms
      interval = setInterval(() => {
        const templates = getLgTemplates('common');
        if (templates.length) {
          setTemplateStatus('loaded');
          setLgTemplates(templates);
          clearInterval(interval);
        } else if (Date.now() - start.current > 3000) {
          // Stop polling after 3000ms
          setTemplateStatus('loaded');
          clearInterval(interval);
        }
      }, 300);
    }

    return () => {
      clearInterval(interval);
    };
  }, []);

  return { status: templateStatus, lgTemplates };
};
