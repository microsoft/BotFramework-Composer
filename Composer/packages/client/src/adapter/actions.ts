// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as protocol from './protocol';

export type Request = <C extends protocol.Command>(
  command: C,
  args: protocol.Arguments<C>
) => protocol.RequestAction<C>;

// TODO: inject this state, possibly through redux thunk or redux sagas
// https://stackoverflow.com/questions/35667249/accessing-redux-state-in-an-action-creator
let seq = 0;
export const nextSeq = () => ++seq;

export const request: Request = (command, args) => ({
  type: 'request',
  from: 'client',
  message: { type: 'request', command, arguments: args, seq: nextSeq() },
});

export const threads = () => request('threads', {});

export const stackTrace = (threadId: number) => request('stackTrace', { threadId });

export const scopes = (frameId: number) => request('scopes', { frameId });

export const variables = (variablesReference: number) => request('variables', { variablesReference });

export const pause = (threadId: number) => request('pause', { threadId });

export const next = (threadId: number) => request('next', { threadId });

export const resume = (threadId: number) => request('continue', { threadId });
