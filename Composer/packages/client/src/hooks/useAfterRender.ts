// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useCallback, useLayoutEffect, useRef } from 'react';

/**
 * Run a callback function not earlier than immediate re-renders happen
 * @returns onAfterRender
 */
export const useAfterRender = () => {
  const timeout = useRef<NodeJS.Timeout>();
  const callback = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    callback.current?.();
  });

  return useCallback((fn: () => unknown) => {
    callback.current = () => {
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        callback.current = null;
        fn();
      }, 0);
    };

    callback.current?.();
  }, []);
};
