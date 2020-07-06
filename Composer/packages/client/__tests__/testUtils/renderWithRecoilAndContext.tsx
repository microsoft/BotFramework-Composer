// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';
import mapValues from 'lodash/mapValues';
import { RecoilRoot, MutableSnapshot } from 'recoil';
import noop from 'lodash/noop';

import { State } from '../../src/recoilModel/types';
import * as initialActions from '../../src/store/action';
import { initialState, StoreContext, StoreContextValue } from '../../src/store';
import { DispatcherWrapper } from '../../src/recoilModel';

export function renderWithRecoilAndContext(
  subject,
  state: Partial<State> = {},
  actions = {},
  initRecoilState: (mutableSnapshot: MutableSnapshot) => void = noop
) {
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
    <RecoilRoot initializeState={initRecoilState}>
      <DispatcherWrapper>
        <StoreContext.Provider value={store}>{subject}</StoreContext.Provider>
      </DispatcherWrapper>
    </RecoilRoot>
  );
}
