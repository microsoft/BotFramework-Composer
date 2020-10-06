// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-type-assertions */

import * as React from 'react';

export const useTraceProps = <T extends Record<any, any>>(props: T, prefix?: string) => {
  const prev = React.useRef(props);
  React.useEffect(() => {
    const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
      if (prev.current[k] !== v) {
        ps[k] = [prev.current[k], v];
      }
      return ps;
    }, <Record<any, any>>{});
    if (Object.keys(changedProps).length > 0) {
      // eslint-disable-next-line no-console
      console.log(`${prefix || ''}: changed props:`, changedProps);
    }
    prev.current = props;
  });
};
