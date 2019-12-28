// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// import { attachLSPServer } from '../../src/attachWSToHTTPServer';
import * as ws from 'ws';
import * as rpc from 'vscode-ws-jsonrpc';
import { IConnection, createConnection } from 'vscode-languageserver';

import { LUServer } from '../../src';

import { attachLSPServer } from './attach';

const express = require('express');

// create the express application
const app = express();
// server the static content, i.e. index.html
app.use(express.static(__dirname));
// start the server
const server = app.listen(5003);

const wss: ws.Server = new ws.Server({
  noServer: true,
  perMessageDeflate: false,
});

function launchLanguageServer(socket: rpc.IWebSocket) {
  const reader = new rpc.WebSocketMessageReader(socket);
  const writer = new rpc.WebSocketMessageWriter(socket);
  const connection: IConnection = createConnection(reader, writer);
  const server = new LUServer(connection);
  server.start();
  return server;
}

attachLSPServer(wss, server, '/lu-language-server', webSocket => {
  if (webSocket.readyState === webSocket.OPEN) {
    launchLanguageServer(webSocket);
  } else {
    webSocket.on('open', () => {
      launchLanguageServer(webSocket);
    });
  }
});
