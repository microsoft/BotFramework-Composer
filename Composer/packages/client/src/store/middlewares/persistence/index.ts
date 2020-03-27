// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import filePersistence from './FilePersistence';
import { ActionType } from './../../action/types';
import { Store } from './../../types';

export const filePersistenceMiddleware = (store: Store) => next => {
  return async (action: ActionType) => {
    filePersistence.notify(store, action);
    return next(action);
  };
};
