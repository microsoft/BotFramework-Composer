// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useRef, useState } from 'react';
import { useProjectApi } from '@bfc/extension-client';

type TemplateStatus = 'loading' | 'loaded';

export const useLgFiles = () => {
  const { lgFiles } = useProjectApi();
  const [lgFilesStatus, setLgFilesStatus] = useState<TemplateStatus>('loading');

  // Poll lg templates
  const start = useRef(Date.now());
  useEffect(() => {
    let interval;
    if (lgFilesStatus === 'loading') {
      // Poll getLgTemplates every 500ms
      interval = setInterval(() => {
        // Stop polling when the files are loaded or after 5000ms
        if (lgFiles.length || Date.now() - start.current > 5000) {
          console.log('acd', 'setLoaded');
          setLgFilesStatus('loaded');
          clearInterval(interval);
        }
      }, 300);
    }

    return () => {
      clearInterval(interval);
    };
  }, [lgFiles]);

  return { lgFilesStatus, lgFiles };
};
