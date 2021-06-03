// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

export const useTraceProps = <T extends Record<any, any>>(props: T, prefix?: string) => {
  const prev = React.useRef(props);
  React.useEffect(() => {
    const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
      if (prev.current[k] !== v) {
        ps[k] = [prev.current[k], v];
      }
      return ps;
    }, {} as Record<any, any>);
    if (Object.keys(changedProps).length > 0) {
      // eslint-disable-next-line no-console
      console.log(`${prefix || ''}: changed props:`, changedProps);
    }
    prev.current = props;
  });
};
