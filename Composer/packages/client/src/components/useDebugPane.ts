// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useState } from 'react';

import { useLocation } from '../utils/hooks';

const pagesToShow = [
  'dialogs',
  'language-generation',
  'language-understanding',
  'knowledge-base',
  'botProjectsSettings',
];

export const useDebugPane = () => {
  const { location: currentLocation } = useLocation();
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  useEffect(() => {
    if (currentLocation?.pathname) {
      let isShow = false;
      // URL Patterns we parse are /bot/1234.123/dialogs or /bot/1234.123/skill/3434.34/dialogs. Removing the leading slash in pathname to avoid an empty item at the start of the list.
      const result = currentLocation.pathname.replace(/^\/|\/$/g, '').split('/');
      let pageName = result[2];

      if (result[2] === 'skill') {
        pageName = result[4];
      }

      if (pageName) {
        isShow = pagesToShow.some((pattern: string) => {
          return pageName.includes(pattern);
        });
      }

      setShowDebugPanel(isShow);
    }
  }, [currentLocation]);

  return showDebugPanel;
};
