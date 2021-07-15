// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useState } from 'react';

import { useLocation } from '../utils/hooks';

export const useDebugPane = () => {
  const { location: currentLocation } = useLocation();
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  useEffect(() => {
    if (currentLocation?.pathname) {
      const result = currentLocation.pathname.replace(/^\/|\/$/g, '').split('/');
      setShowDebugPanel(result?.[2] !== 'home');
    }
  }, [currentLocation]);

  return showDebugPanel;
};
