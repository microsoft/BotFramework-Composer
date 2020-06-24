// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRef, useEffect } from 'react';
import { useSetRecoilState, atom } from 'recoil';

import createDispatchers, { Dispatcher } from './dispatchers';

export const dispatcherState = atom<Dispatcher>({
  key: 'dispatcherState',
  default: {} as Dispatcher,
});

export const DispatcherWraper = () => {
  // Use a ref to ensure the dispatcher is only created once
  const dispatcherRef = useRef(createDispatchers());

  const setDispatcher = useSetRecoilState(dispatcherState);

  useEffect(() => {
    setDispatcher(dispatcherRef.current);
  });

  return null;
};
