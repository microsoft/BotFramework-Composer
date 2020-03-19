// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as effects from 'redux-saga/effects';
import { DebugProtocol as DP } from 'vscode-debugprotocol';

import * as protocol from './protocol';
import * as actions from './actions';

export type Send = <T extends DP.ProtocolMessage>(message: T) => effects.CallEffect<DP.ProtocolMessage>;

export interface Context {
  send: Send;
}

const takeEvent = function*<E extends protocol.Event>(
  event: E
): Generator<effects.TakeEffect, protocol.EventAction<E>, protocol.Action> {
  const action = yield effects.take(a => protocol.isEventAction(a, 'server', event));
  if (!protocol.isEventAction(action, 'server', event)) {
    throw new Error();
  }

  return action;
};

const requestResponse = function*<C extends protocol.Command>(
  command: C,
  args: protocol.Arguments<C>
): Generator<effects.Effect, protocol.ResponseAction<C>, protocol.Action> {
  const request = actions.request(command, args);
  yield effects.put(request);

  const response = yield effects.take(
    a => protocol.isResponseAction(a, 'server', command) && a.message.request_seq === request.message.seq
  );

  if (!protocol.isResponseAction(response, 'server', command)) {
    throw new Error();
  }

  if (!response.message.success) {
    throw new Error();
  }

  return response;
};

const sagaThreadName = function*() {
  while (true) {
    const thread = yield* takeEvent('thread');
    if (thread.message.body.reason === 'started') {
      const request = actions.request('threads', {});
      yield effects.put(request);
    }
  }
};

const sagaSend = function*(context: Context) {
  while (true) {
    const action = yield effects.take(a => protocol.isSendAction(a));
    if (!protocol.isSendAction(action)) {
      throw new Error();
    }

    yield context.send(action.message);
  }
};

const sagaOpen = function*() {
  const initialize = yield* requestResponse('initialize', {
    adapterID: 'will',
  });

  yield* takeEvent('initialized');

  const {
    message: { body },
  } = initialize;

  if (body !== undefined) {
    const { exceptionBreakpointFilters } = body;

    if (exceptionBreakpointFilters !== undefined) {
      const filters = exceptionBreakpointFilters.map(f => f.filter);
      yield* requestResponse('setExceptionBreakpoints', { filters });
    }
  }

  yield* requestResponse('configurationDone', {});

  yield* requestResponse('attach', ({
    breakOnStart: true,
  } as unknown) as DP.AttachRequestArguments);

  const threads = yield* requestResponse('threads', {});
  threads;
};

export type ProtocolSaga = Generator<effects.Effect, void, protocol.Action>;

// TODO: consider removing type ProtocolSaga
export const sagaRoot = function*(context: Context): ProtocolSaga {
  yield effects.fork(sagaSend, context);

  yield effects.fork(sagaThreadName);

  yield effects.takeLatest(a => protocol.isOpenAction(a), sagaOpen);
};
