// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useState } from 'react';

import { useLocation } from '../utils/hooks';

export const useBotControllerBar = () => {
  const [isShow, setIsShow] = useState(true);
  const {
    location: { pathname },
  } = useLocation();

  useEffect(() => {
    // hide it on the /home page, but make sure not to hide on /bot/stuff/home in case someone names a dialog "home"
    if (pathname.includes('/bot/')) {
      setIsShow(true);
    } else if (pathname.includes('/projects/') || pathname.endsWith('/home')) {
      setIsShow(false);
    }
  }, [pathname]);

  return isShow;
};
