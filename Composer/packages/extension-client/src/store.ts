// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Dispatch } from 'react';
import { Shell } from '@botframework-composer/types';

export type State = Shell;

export type Store = {
  getState: () => State;
  setState: (newState: Partial<State>) => void;
};

class ExtensionStore implements Store {
  private state: State = {} as Shell;
  private listeners: Dispatch<Partial<State>>[] = [];

  constructor(initialState = {}) {
    this.setState(initialState);
  }

  getState() {
    return this.state;
  }

  setState(newState: Partial<State>) {
    this.state = { ...this.state, ...newState };

    this.listeners.forEach((dispatch) => {
      dispatch(this.state);
    });
  }

  addListener(listener: Dispatch<Partial<State>>) {
    this.listeners.push(listener);
  }

  removeListener(listener: Dispatch<Partial<State>>) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }
}

// eslint-disable-next-line no-underscore-dangle
const __store__ = new ExtensionStore();

export function syncStore(data = {}) {
  __store__.setState(data);
}

export { __store__ };
