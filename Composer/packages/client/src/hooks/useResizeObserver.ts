/* eslint-disable @typescript-eslint/ban-ts-ignore */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

/*
 * TODO: remove ts-ignore after updating typescript to v4.
 * current typescript version does not have definitions for ResizeObserver.
 */

/**
 * Observes size changes of a given element and runs the provided callback.
 * @param element Element to observe size changes.
 * @param resizeCallback Callback to call when resize happens.
 * @param options Optional options for resize observer.
 */
export const useResizeObserver = <T extends HTMLElement>(
  element: T | null,
  // @ts-ignore
  resizeCallback: (entries: ResizeObserverEntry[]) => void,
  // @ts-ignore
  options?: ResizeObserverOptions
) => {
  // @ts-ignore
  const resizeObserver = React.useRef(new ResizeObserver(resizeCallback));

  React.useEffect(() => {
    if (element) {
      resizeObserver.current.observe(element, options);
    }

    return () => {
      if (element) {
        resizeObserver.current.unobserve(element);
      }
    };
  }, [element]);
};
