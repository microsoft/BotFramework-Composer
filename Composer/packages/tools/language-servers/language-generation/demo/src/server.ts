// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// import { attachLSPServer } from '../../src/attachWSToHTTPServer';
import * as ws from 'ws';
import * as rpc from 'vscode-ws-jsonrpc';
import { IConnection, createConnection } from 'vscode-languageserver';

import { LGServer } from '../../src';

import { attachLSPServer } from './attach';

const express = require('express');

// create the express application
const app = express();
// server the static content, i.e. index.html
app.use(express.static(__dirname));
// start the server
const server = app.listen(5002);

const wss: ws.Server = new ws.Server({
  noServer: true,
  perMessageDeflate: false,
});

function launchLanguageServer(socket: rpc.IWebSocket) {
  const reader = new rpc.WebSocketMessageReader(socket);
  const writer = new rpc.WebSocketMessageWriter(socket);
  const connection: IConnection = createConnection(reader, writer);
  return new LGServer(connection);
}

attachLSPServer(wss, server, '/lgServer', webSocket => {
  // const socketHandler = createSocketHandler(webSocket);

  // launch language server when the web socket is opened
  if (webSocket.readyState === webSocket.OPEN) {
    const server = launchLanguageServer(webSocket);
    server.start();
  } else {
    webSocket.on('open', () => {
      const server = launchLanguageServer(webSocket);
      server.start();
    });
  }
});
