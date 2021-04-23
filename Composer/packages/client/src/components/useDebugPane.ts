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
  const [showDebugPane, setVisibilityOfPane] = useState(false);

  useEffect(() => {
    if (currentLocation?.pathname) {
      let isShow = false;
      const result = currentLocation.pathname.replace(/^\/|\/$/g, '').split('/');

      // URL Patterns /bot/1234.123/dialogs or /bot/1234.123/skill/3434.34/dialogs
      let pageName = result[2];
      if (currentLocation.pathname.includes('skill')) {
        pageName = result[4];
      }

      if (pageName) {
        isShow = !!pagesToShow.some((pattern: string) => {
          return pageName.includes(pattern);
        });
      }

      setVisibilityOfPane(isShow);
    }
  }, [currentLocation]);

  return showDebugPane;
};
