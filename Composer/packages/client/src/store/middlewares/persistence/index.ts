// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import filePersistence from './FilePersistence';
import { ActionType } from './../../action/types';
import { Store } from './../../types';

export const filePersistenceMiddleware = (store: Store) => next => {
  return async (action: ActionType) => {
    if (action.payload?.changeType) {
      filePersistence.notify(action.payload, store.getState().projectId);
    }
    return next(action);
  };
};
