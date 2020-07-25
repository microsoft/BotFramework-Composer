// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Lifetime } from 'src/app/utils/base';
import * as React from 'react';

export const useKeyBinding = (kind: 'keydown' | 'keyup', cb: (e: KeyboardEvent) => void) => {
  const callback = React.useCallback(cb, [cb]);
  React.useEffect(() => {
    const lifetime = new Lifetime();

    document.body.addEventListener(kind, callback);
    lifetime.add(() => {
      document.body.removeEventListener(kind, callback);
    });

    return () => lifetime.dispose();
  }, []);
};
