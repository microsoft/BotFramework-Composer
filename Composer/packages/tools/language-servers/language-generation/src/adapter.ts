// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as rpc from 'vscode-ws-jsonrpc';

import { start } from './LGServer';

export function launch(socket: rpc.IWebSocket) {
  const reader = new rpc.WebSocketMessageReader(socket);
  const writer = new rpc.WebSocketMessageWriter(socket);
  start(reader, writer);
}
