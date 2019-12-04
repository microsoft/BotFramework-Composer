// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { initialStore } from '../store/store';

export const RESET_STORE = 'VISUAL/RESET_STORE';

export default function resetStore(initialStates) {
  return {
    type: RESET_STORE,
    payload: {
      ...initialStore,
      ...initialStates,
    },
  };
}
