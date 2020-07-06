// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';
import mapValues from 'lodash/mapValues';

import { State } from '../../src/recoilModel/types';
import * as initialActions from '../../src/store/action';
import { initialState, StoreContext, StoreContextValue } from '../../src/store';

export function renderWithStore(subject, state: Partial<State> = {}, actions = {}) {
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
    },
  };

  return render(<StoreContext.Provider value={store}>{subject}</StoreContext.Provider>);
}
