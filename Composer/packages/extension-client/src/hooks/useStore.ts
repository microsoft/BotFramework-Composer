// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useState, useEffect } from 'react';

import { State, __store__, Store } from '../store';

export function useStore() {
  const [, dispatch] = useState<Partial<State>>(__store__.getState());

  useEffect(() => {
    __store__.addListener(dispatch);

    return () => {
      __store__.removeListener(dispatch);
    };
  }, []);

  const store: Store = {
    getState: __store__.getState.bind(__store__),
    setState: __store__.setState.bind(__store__),
  };

  return store.getState();
}
