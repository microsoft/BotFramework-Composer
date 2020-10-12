// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Dispatch } from 'react';
import merge from 'lodash/merge';
import { Shell } from '@bfc/types';

import { ComposerGlobalName } from './common/constants';

const STORAGE_KEY = '__internal__';

export type State = Shell;

export type Store = {
  getState: () => State;
  setState: (newState: Partial<State>) => void;
};

class ExtensionStore implements Store {
  private state: State = {} as Shell;
  private listeners: Dispatch<Partial<State>>[] = [];

  constructor(initialState = {}) {
    const windowState = window[ComposerGlobalName]?.[STORAGE_KEY] ?? {};

    if (window[ComposerGlobalName]?.[STORAGE_KEY]) {
      this.setState(merge({}, windowState, initialState));
    } else {
      this.setState(initialState);
    }
  }

  getState() {
    return this.state;
  }

  setState(newState: Partial<State>) {
    this.state = { ...this.state, ...newState };

    this.syncWindow();

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

  private syncWindow() {
    // ensure composer namespace is present before writing state
    if (!window[ComposerGlobalName]) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      window[ComposerGlobalName] = {};
    }

    window[ComposerGlobalName][STORAGE_KEY] = this.state;
  }
}

// eslint-disable-next-line no-underscore-dangle
const __store__ = new ExtensionStore();

export function syncStore(data = {}) {
  __store__.setState(data);
}

export { __store__ };
