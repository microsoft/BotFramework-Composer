// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as protocol from './protocol';
import * as immutable from './immutable';
import * as lazy from './lazy';
import * as model from './model';

type Action = protocol.Action;

export interface HasChildVariables {
  variablesReference: number;
}

export const hasChildVariables = <S extends model.Thing<HasChildVariables> & model.Variables>(
  state: S | undefined,
  action: Action
): S => {
  if (state === undefined) {
    throw new Error();
  }

  const lazyVariables = lazy.recurse(
    state.lazyVariables,
    action,
    'variables',
    request => state.remote.variablesReference === request.arguments.variablesReference,
    (state, action) => {
      const {
        message: { body },
      } = action;

      return body.variables.map<model.Variable>(remote => {
        const existing = model.bindVariable(state, remote);
        return existing !== undefined ? { ...existing, remote } : { remote, lazyVariables: lazy.pending() };
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    variables
  );

  if (lazyVariables !== state.lazyVariables) {
    return { ...state, lazyVariables };
  } else {
    return state;
  }
};

export const variable: protocol.Reducer<model.Variable, Action> = (state, action) =>
  hasChildVariables<model.Variable>(state, action);

export const variables: protocol.Reducer<ReadonlyArray<model.Variable>, Action> = immutable.map(variable);

export const scope: protocol.Reducer<model.Scope, Action> = (state, action) =>
  hasChildVariables<model.Scope>(state, action);

export const scopes: protocol.Reducer<ReadonlyArray<model.Scope>, Action> = immutable.map(scope);

export const stackFrame: protocol.Reducer<model.StackFrame, Action> = (state, action) => {
  if (state === undefined) {
    throw new Error();
  }

  const { remote } = state;

  const lazyScopes: protocol.Reducer<lazy.Lazy<ReadonlyArray<model.Scope>>, Action> = (state, action) =>
    lazy.recurse(
      state,
      action,
      'scopes',
      request => request.arguments.frameId === remote.id,
      (state, action) => {
        const {
          message: { body },
        } = action;

        return body.scopes.map<model.Scope>(remote => {
          const existing = model.bindScope(state, remote);
          return existing !== undefined ? { ...existing, remote } : { remote, lazyVariables: lazy.pending() };
        });
      },
      scopes
    );

  return immutable.combineFull<model.StackFrame, Action>({
    lazyScopes,
  })(state, action);
};

export const stackFrames = immutable.map(stackFrame);

const threadEvent: protocol.Reducer<model.Thread, Action> = (state, action) => {
  if (state === undefined) {
    throw new Error();
  }

  if (protocol.isEventAction(action, 'server', 'stopped') || protocol.isEventAction(action, 'server', 'continued')) {
    const {
      message: {
        event,
        body: { threadId },
      },
    } = action;

    if (state.remote.id === threadId) {
      const stopped = event === 'stopped';
      if (stopped !== state.stopped) {
        const lazyStackFrames = stopped ? state.lazyStackFrames : lazy.pending();
        return { ...state, stopped, lazyStackFrames };
      }
    }
  }

  return state;
};

export const thread: protocol.Reducer<model.Thread, Action> = (state, action) => {
  if (state === undefined) {
    throw new Error();
  }

  const { remote } = state;

  const lazyStackFrames: protocol.Reducer<lazy.Lazy<ReadonlyArray<model.StackFrame>>, Action> = (state, action) =>
    lazy.recurse(
      state,
      action,
      'stackTrace',
      request => request.arguments.threadId === remote.id,
      (state, action) => {
        const {
          message: { body },
        } = action;

        return body.stackFrames.map<model.StackFrame>(remote => {
          const existing = model.bindStackFrame(state, remote);
          return existing !== undefined ? { ...existing, remote } : { remote, lazyScopes: lazy.pending() };
        });
      },
      stackFrames
    );

  const reducer = immutable.combineSeries(
    threadEvent,
    immutable.combineFull<model.Thread, Action>({
      lazyStackFrames,
    })
  );

  return reducer(state, action);
};

export const threads: protocol.Reducer<ReadonlyArray<model.Thread>, Action> = (state, action) => {
  if (state === undefined) {
    return [];
  }

  if (protocol.isEventAction(action, 'server', 'thread')) {
    const {
      message: {
        body: { reason, threadId },
      },
    } = action;

    switch (reason) {
      case 'started': {
        const thread: model.Thread = {
          remote: { id: threadId, name: '' },
          lazyStackFrames: lazy.pending(),
          stopped: false,
        };
        return [...state, thread];
      }
      case 'exited': {
        return state.filter(t => t.remote.id !== threadId);
      }
      default:
        throw new Error(reason);
    }
  }

  return immutable.map(thread)(state, action);
};

export const lazyThreads: protocol.Reducer<lazy.Lazy<ReadonlyArray<model.Thread>>, Action> = (state, action) =>
  lazy.recurse(
    state,
    action,
    'threads',
    () => true,
    (state, action) => {
      if (state === undefined) {
        state = [];
      }

      const {
        message: { body },
      } = action;

      // TODO: move to immutable.map, but need to add/remove threads as needed and preserve existing lazy stack trace trees
      return body.threads.map<model.Thread>(remote => {
        const existing = model.bindThread(state, remote);
        if (existing !== undefined) {
          return { ...existing, remote };
        } else {
          return { remote, lazyStackFrames: lazy.pending(), stopped: false };
        }
      });
    },
    threads
  );

export const outputs: protocol.Reducer<ReadonlyArray<model.Output>, Action> = (state, action) => {
  if (state === undefined) {
    return [];
  }

  if (protocol.isEventAction(action, 'server', 'output')) {
    const { message } = action;
    return [...state, { remote: message }];
  }

  return state;
};

export const state: protocol.Reducer<model.Debuggee, Action> = immutable.combine<model.Debuggee, Action>({
  lazyThreads,
  outputs,
});
