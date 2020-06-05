// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext } from 'react';

import { StoreContext } from '../store';

export function useStoreContext() {
  const { state, actions, resolvers } = useContext(StoreContext);

  return { state, actions, resolvers };
}
