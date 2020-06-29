// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRef, useEffect, useState, Fragment } from 'react';
import { atom, useRecoilState } from 'recoil';
import once from 'lodash/once';
import React from 'react';

import { prepareAxios } from '../utils/auth';

import createDispatchers, { Dispatcher } from './dispatchers';

export const dispatcherState = atom<Dispatcher>({
  key: 'dispatcherState',
  default: {} as Dispatcher,
});

export const DispatcherWrapper = ({ children }) => {
  const [init, setInit] = useState(false);
  const prepareAxiosWithRecoil = once(prepareAxios);

  // Use a ref to ensure the dispatcher is only created once
  const dispatcherRef = useRef(createDispatchers());

  const [currentDispatcherState, setDispatcher] = useRecoilState(dispatcherState);

  useEffect(() => {
    setDispatcher(dispatcherRef.current);
    prepareAxiosWithRecoil(currentDispatcherState);
    setInit(true);
  }, []);

  return <Fragment>{init ? children : null}</Fragment>;
};
