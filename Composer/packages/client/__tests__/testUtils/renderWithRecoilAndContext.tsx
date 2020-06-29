// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';
import mapValues from 'lodash/mapValues';
import { RecoilRoot } from 'recoil';

import { State } from '../../src/store/types';
import * as initialActions from '../../src/store/action';
import { initialState, StoreContext, StoreContextValue } from '../../src/store';
import { DispatcherWraper } from '../../src/recoilModel/DispatcherWraper';

export function renderWithRecoilAndContext(subject, state: Partial<State> = {}, actions = {}) {
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

  return render(
    <RecoilRoot>
      <DispatcherWraper />
      <StoreContext.Provider value={store}>{subject}</StoreContext.Provider>
    </RecoilRoot>
  );
}
