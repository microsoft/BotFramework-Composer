// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRef } from 'react';

import createDispatchers, { Dispatcher } from '../recoilModel/dispatchers';
export const useDispatcher = (): Dispatcher => {
  const dispatcherRef = useRef<Dispatcher>(createDispatchers());
  return dispatcherRef.current;
};
