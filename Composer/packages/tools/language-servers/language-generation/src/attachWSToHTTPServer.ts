import * as ws from 'ws';
import * as http from 'http';
import * as url from 'url';
import * as net from 'net';
import * as rpc from 'vscode-ws-jsonrpc';
import { launch } from './adapter';

export function attachLSPServer(server: http.Server, path: string) {
  const wss = new ws.Server({
    noServer: true,
    perMessageDeflate: false,
  });
  server.on('upgrade', (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
    const pathname = request.url ? url.parse(request.url).pathname : undefined;
    if (pathname === path) {
      wss.handleUpgrade(request, socket, head, webSocket => {
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
        // launch the server when the web socket is opened
        if (webSocket.readyState === webSocket.OPEN) {
          launch(socket);
        } else {
          webSocket.on('open', () => launch(socket));
        }
      });
    }
  });
}
