// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionTypes } from '@src/constants';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeDispatchedWith(type: ActionTypes, payload?: any, error?: any);
    }
  }
}
