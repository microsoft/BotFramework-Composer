// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as http from 'http';
import * as url from 'url';
import * as net from 'net';

import * as ws from 'ws';
import * as rpc from 'vscode-ws-jsonrpc';

import { start as startLGServer } from './LGServer';

function createSocketHandler(webSocket: any): rpc.IWebSocket {
  const socket: rpc.IWebSocket = {
    send: content =>
      webSocket.send(content, error => {
        if (error) {
          throw error;
        }
      }),
    onMessage: cb => webSocket.on('message', cb),
    onError: cb => webSocket.on('error', cb),
    onClose: cb => webSocket.on('close', cb),
    dispose: () => webSocket.close(),
  };
  return socket;
}

function bindWStoHTTP(wss: ws.Server, server: http.Server, path: string, handler: (webSocket) => void) {
  server.on('upgrade', (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
    const pathname = request.url ? url.parse(request.url).pathname : undefined;
    if (pathname === path) {
      wss.handleUpgrade(request, socket, head, handler);
    }
  });
}

function launchLanguageServer(socket: rpc.IWebSocket) {
  const reader = new rpc.WebSocketMessageReader(socket);
  const writer = new rpc.WebSocketMessageWriter(socket);
  startLGServer(reader, writer);
}

function createWebSocketServer(): ws.Server {
  return new ws.Server({
    noServer: true,
    perMessageDeflate: false,
  });
}

export function attachLSPServer(server: http.Server, path: string) {
  const wss = createWebSocketServer();
  bindWStoHTTP(wss, server, path, webSocket => {
    const socketHandler = createSocketHandler(webSocket);
    // launch language server when the web socket is opened
    if (webSocket.readyState === webSocket.OPEN) {
      launchLanguageServer(socketHandler);
    } else {
      webSocket.on('open', () => launchLanguageServer(socketHandler));
    }
  });
}
