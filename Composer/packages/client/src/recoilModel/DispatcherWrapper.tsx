// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useRef, useEffect, Fragment, useState } from 'react';
import { useSetRecoilState, atom } from 'recoil';

import dispatchers from './dispatchers';

export const dispatcherState = atom<any | undefined>({
  key: 'dispatcherState',
  default: undefined,
});

export const DispatcherWrapper = ({ children }) => {
  const [init, setInit] = useState(false);
  const combinedDispatchers = dispatchers.reduce((result, dispatcher) => ({ ...result, ...dispatcher() }), {});
  // Use a ref to ensure the dispatcher is only created once
  const dispatcherRef = useRef(combinedDispatchers);

  const setDispatcher = useSetRecoilState(dispatcherState);

  useEffect(() => {
    setDispatcher(dispatcherRef.current);
    setInit(true);
  }, []);

  return <Fragment>{init ? children : null}</Fragment>;
};
