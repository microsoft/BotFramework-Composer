// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRef, useEffect } from 'react';
import { useSetRecoilState, atom } from 'recoil';

import { assetsDispatcher } from './assets';
import { projectDispatcher } from './project';

export const dispatcherState = atom<any | undefined>({
  key: 'dispatcherState',
  default: undefined,
});

export const DispatcherWraper = () => {
  // Use a ref to ensure the dispatcher is only created once
  const dispatcherRef = useRef({ ...projectDispatcher(), ...assetsDispatcher() });

  const setDispatcher = useSetRecoilState(dispatcherState);

  useEffect(() => {
    setDispatcher(dispatcherRef.current);
  });

  return null;
};
