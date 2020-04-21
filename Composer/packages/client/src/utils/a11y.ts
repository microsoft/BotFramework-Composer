// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useRef } from 'react';
import { Async } from 'office-ui-fabric-react/lib/Utilities';
import debounce from 'lodash/debounce';

import { StoreContext } from '../store';

export function announce(message: string) {
  const { actions } = useContext(StoreContext);
  const _async = new Async();

  const setMessage = useRef(debounce(actions.setMessage, 500)).current;

  setMessage(message);
  _async.setTimeout(() => {
    setMessage(undefined);
  }, 2000);
}
