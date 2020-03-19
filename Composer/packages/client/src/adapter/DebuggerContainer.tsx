// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useRef } from 'react';
import * as redux from 'redux';
import createSagaMiddleware, * as saga from 'redux-saga';
import * as effects from 'redux-saga/effects';
import { connect, Provider } from 'react-redux';
import { DebugProtocol as DP } from 'vscode-debugprotocol';

import * as actions from './actions';
import * as model from './model';
import * as protocol from './protocol';
import * as presenter from './DebuggerPresenter';
import * as reducers from './reducers';
import * as sagas from './sagas';

const middleware = createSagaMiddleware();
const store = redux.createStore(reducers.state, redux.applyMiddleware(middleware));

const useWebSocket = () => {
  const ws = useRef<WebSocket | undefined>(undefined);

  useEffect(() => {
    const requestBySeq = new Map<number, DP.Request>();

    const sendReal = (message: DP.ProtocolMessage): DP.ProtocolMessage => {
      if (ws.current !== undefined) {
        const json = JSON.stringify(message, null, 0);
        ws.current.send(json);

        if (protocol.isType(message, 'request')) {
          requestBySeq.set(message.seq, message);
        }
      }

      return message;
    };

    const send: sagas.Send = message => effects.call(sendReal, message);
    // TODO: figure out whether to use saga context
    const context: sagas.Context = { send };
    // TODO: would prefer to run earlier and use takeLatest on 'open'
    middleware.run(sagas.sagaRoot as saga.Saga, context);

    const { hostname, port } = location;

    ws.current = new WebSocket(`ws://${hostname}:${port}/debug-server`);

    ws.current.onopen = () => {
      store.dispatch({ type: 'open' });
    };

    ws.current.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data) as DP.ProtocolMessage;
      const action = protocol.actionFrom('server', message, requestBySeq);
      store.dispatch(action);
    };

    return () => {
      if (ws.current !== undefined) {
        ws.current.close();
      }
    };
  }, []);

  return ws;
};

// TODO: probably need to memoize selector
const mapStateToProps = (debuggee: model.Debuggee) => ({
  debuggee,
});

const mapDispatchToProps = (dispatch: redux.Dispatch<protocol.Action>): presenter.Actions => ({
  actions: redux.bindActionCreators(actions, dispatch),
});

const Presenter = connect(mapStateToProps, mapDispatchToProps)(presenter.DebuggerPresenter);

export type DebuggerContainerProps = {
  onAbort: () => void;
};

export const DebuggerContainer: React.FC<DebuggerContainerProps> = props => {
  const ws = useWebSocket();
  ws;

  return (
    <Provider store={store}>
      <Presenter onAbort={props.onAbort} />
    </Provider>
  );
};
