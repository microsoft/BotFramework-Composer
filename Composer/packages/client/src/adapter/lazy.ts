// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DebugProtocol as DP } from 'vscode-debugprotocol';
import * as redux from 'redux';

import * as protocol from './protocol';

export interface LazyBase<Local> {
  readonly local: Local;
}

export interface LazyRequest<Local> extends LazyBase<Local> {
  readonly request: DP.Request;
}

export interface LazyResponse<Local> extends LazyRequest<Local> {
  readonly response: DP.Response;
}

export interface LazyResponseItem<Local, T> extends LazyResponse<Local> {
  readonly item: T;
}

export type LazyPending = LazyBase<'pending'>;

export type LazyStarted = LazyRequest<'started'>;

export type LazyFailure = LazyResponse<'failure'>;

export type LazySuccess<T> = LazyResponseItem<'success', T>;

export type Lazy<T> = LazyPending | LazyStarted | LazySuccess<T> | LazyFailure;

export const pending = (): LazyPending => ({ local: 'pending' });

const handleMissing = <S>(state: Lazy<S> | undefined): Lazy<S> => (state === undefined ? { local: 'pending' } : state);

const handleRequest = <S, C extends protocol.Command>(
  state: Lazy<S>,
  action: protocol.Action,
  command: C,
  filter: (request: protocol.Request<C>) => boolean
): Lazy<S> => {
  if (protocol.isRequestAction(action, 'client', command)) {
    const { message } = action;
    if (filter(message)) {
      switch (state.local) {
        case 'pending':
          return { ...state, local: 'started', request: message };
        case 'started':
        case 'success':
        case 'failure':
          return { ...state, request: message };
      }
    }
  }

  return state;
};

const handleResponse = <S, C extends protocol.Command>(
  state: Lazy<S>,
  action: protocol.Action,
  command: C,
  filter: (request: protocol.Request<C>) => boolean,
  typed: redux.Reducer<S, protocol.ResponseAction<C>>
): Lazy<S> => {
  if (protocol.isResponseAction(action, 'server', command)) {
    const { request, message: response } = action;
    if (filter(request)) {
      if (!response.success) {
        return { local: 'failure', request, response };
      }

      if (state.local === 'success') {
        const item = typed(state.item, action);
        return { local: 'success', request, response, item };
      } else {
        const item = typed(undefined, action);
        return { local: 'success', request, response, item };
      }
    }
  }

  return state;
};

const handleSuccess = <S, C extends protocol.Command>(
  state: Lazy<S>,
  action: protocol.Action,
  other: redux.Reducer<S, protocol.Action>
): Lazy<S> => {
  if (state.local === 'success') {
    const item = other(state.item, action);
    if (item !== state.item) {
      return { ...state, item };
    }
  }

  return state;
};

export const recurse = <S, C extends protocol.Command>(
  state: Lazy<S> | undefined,
  action: protocol.Action,
  command: C,
  filter: (request: protocol.Request<C>) => boolean,
  typed: redux.Reducer<S, protocol.ResponseAction<C>>,
  other: redux.Reducer<S, protocol.Action>
): Lazy<S> => {
  state = handleMissing(state);
  state = handleRequest(state, action, command, filter);
  state = handleResponse(state, action, command, filter, typed);
  state = handleSuccess(state, action, other);
  return state;
};
