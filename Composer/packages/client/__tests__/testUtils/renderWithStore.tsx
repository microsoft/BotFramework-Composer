// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';
import mapValues from 'lodash/mapValues';

import { State } from '../../src/store/types';
import * as initialActions from '../../src/store/action';
import { initialState, StoreContext, StoreContextValue } from '../../src/store';

export const StoreContextProvider = ({ children, state, actions, resolvers = {} }) => {
  const store: StoreContextValue = {
    actions: {
      ...mapValues(initialActions, () => jest.fn()),
      ...actions,
    },
    state: {
      ...initialState,
      ...state,
    },
    dispatch: jest.fn(),
    resolvers: {
      lgImportresolver: jest.fn(),
      lgFileResolver: jest.fn(),
      luFileResolver: jest.fn(),
      ...resolvers,
    },
  };

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

export function renderWithStore(subject, state: Partial<State> = {}, actions = {}) {
  return render(
    <StoreContextProvider actions={actions} state={state}>
      {subject}
    </StoreContextProvider>
  );
}
