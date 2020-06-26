// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRef, useEffect } from 'react';
import { atom, useRecoilState } from 'recoil';
import once from 'lodash/once';

import { prepareAxios } from '../utils/auth';

import createDispatchers, { Dispatcher } from './dispatchers';

export const dispatcherState = atom<Dispatcher>({
  key: 'dispatcherState',
  default: {} as Dispatcher,
});

const prepareAxiosWithRecoil = once(prepareAxios);

export const DispatcherWraper = () => {
  // Use a ref to ensure the dispatcher is only created once
  const dispatcherRef = useRef(createDispatchers());

  const [currentDispatcherState, setDispatcher] = useRecoilState(dispatcherState);

  useEffect(() => {
    setDispatcher(dispatcherRef.current);
    prepareAxiosWithRecoil(currentDispatcherState);
  });

  return null;
};
