// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRef, useEffect } from 'react';
import { useSetRecoilState, atom } from 'recoil';

import dispatchers from './dispatchers';

export const dispatcherState = atom<any | undefined>({
  key: 'dispatcherState',
  default: undefined,
});

export const DispatcherWraper = () => {
  const combinedDispatchers = dispatchers.reduce((result, dispatcher) => ({ ...result, ...dispatcher() }), {});
  // Use a ref to ensure the dispatcher is only created once
  const dispatcherRef = useRef(combinedDispatchers);

  const setDispatcher = useSetRecoilState(dispatcherState);

  useEffect(() => {
    setDispatcher(dispatcherRef.current);
  });

  return null;
};
