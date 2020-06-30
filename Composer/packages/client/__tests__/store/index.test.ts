// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ActionTypes } from '../../src/constants';

import { applyMiddleware } from './../../src/store';
import { Store, State } from './../../src/store/types';

describe('applyMiddleware', () => {
  it('warns when dispatching during middleware setup', () => {
    const store: Store = {
      dispatch: jest.fn(),
      getState: () => {
        return {} as State;
      },
    };
    const mockFunction1 = jest.fn();
    const mockFunction2 = jest.fn();

    const middleWare1 = (store: Store) => (next) => {
      return () => {
        mockFunction1();
        return next();
      };
    };

    const middleWare2 = (store: Store) => (next) => {
      return () => {
        mockFunction2();
        return next();
      };
    };
    const dispatch = applyMiddleware(store, middleWare1, middleWare2);
    dispatch({
      type: ActionTypes.UPDATE_BOTSTATUS,
      payload: { a: 'a' },
    });
    expect(mockFunction1).toBeCalledTimes(1);
    expect(mockFunction2).toBeCalledTimes(1);
    expect(store.dispatch).toBeCalledTimes(1);
  });
});
