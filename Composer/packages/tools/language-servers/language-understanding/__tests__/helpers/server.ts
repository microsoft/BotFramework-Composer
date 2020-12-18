// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import fs from 'fs';
import path from 'path';
import * as http from 'http';
import * as url from 'url';
import * as net from 'net';

import * as ws from 'ws';
import * as rpc from 'vscode-ws-jsonrpc';
import { IConnection, createConnection } from 'vscode-languageserver';
import express from 'express';

import { LUServer } from '../../src';

// eslint-disable-next-line security/detect-non-literal-fs-filename
const luFile = fs.readFileSync(path.join(__dirname, '../mocks/greeting.lu'), 'utf-8');

const luImportResolver = (_source, id) => {
  return {
    id,
    content: luFile,
  };
};

function createSocketHandler(webSocket): rpc.IWebSocket {
  const socket: rpc.IWebSocket = {
    send: (content) =>
      webSocket.send(content, (error) => {
        if (error) {
          throw error;
        }
      }),
    onMessage: (cb) => webSocket.on('message', cb),
    onError: (cb) => webSocket.on('error', cb),
    onClose: (cb) => webSocket.on('close', cb),
    dispose: () => webSocket.close(),
  };
  return socket;
}

function attachLSPServer(wss: ws.Server, server: http.Server, path: string, handler: (webSocket) => void) {
  server.on('upgrade', (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
    const pathname = request.url ? url.parse(request.url).pathname : undefined;
    if (pathname === path) {
      wss.handleUpgrade(request, socket, head, (webSocket) => {
        const socketHandler = createSocketHandler(webSocket);
        handler(socketHandler);
      });
    }
  });
}

function launchLanguageServer(socket: rpc.IWebSocket) {
  const reader = new rpc.WebSocketMessageReader(socket);
  const writer = new rpc.WebSocketMessageWriter(socket);
  const connection: IConnection = createConnection(reader, writer);
  return new LUServer(connection, luImportResolver);
}

export function startServer() {
  // create the express application
  const app = express();
  // server the static content, i.e. index.html
  app.use(express.static(__dirname));
  // start the server
  const server = app.listen(50003);

  const wss: ws.Server = new ws.Server({
    noServer: true,
    perMessageDeflate: false,
  });
  attachLSPServer(wss, server, '/lu-language-server', (webSocket) => {
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
  return server;
}
