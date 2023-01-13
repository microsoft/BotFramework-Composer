// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import http from 'http';

import portfinder from 'portfinder';
import express, { Request, Response } from 'express';
import { Server as WSServer } from 'ws';
import { Debugger } from 'debug';

interface WebSocket {
  close(): void;
  send(data: string, cb?: (err?: Error) => void): void;
}

export class RuntimeLogServer {
  private static restServer: http.Server;
  private static servers: WSServer = {};
  private static sockets: Record<string, WebSocket> = {};
  private static port: number;
  private static hostname: string;

  public static getRuntimeLogStreamingUrl(projectId: string): string {
    return `ws://${this.hostname}:${this.port}/ws/runtimeLog/${projectId}`;
  }

  public static async init({
    log,
    boundHost = 'localhost',
    hostname = 'localhost',
  }: {
    log: Debugger;
    boundHost?: string;
    hostname?: string;
  }): Promise<number | void> {
    if (!this.restServer) {
      const app = express();
      this.restServer = http.createServer(app);

      this.restServer.on('upgrade', (req, socket, head) => {
        req.claimUpgrade = () => ({
          head,
          socket,
        });
        const res: any = new http.ServerResponse(req);
        return app(req, res);
      });
      const preferredPort = 8001;
      const port = await portfinder.getPortPromise({ port: preferredPort }).catch((err) => {
        log(`Unable to find an open port for runtime-log (wanted ${preferredPort}): ${err}`);
        return preferredPort;
      });
      log(`Using ${port} port for runtime-log`);
      this.restServer.listen(port, boundHost);

      app.use('/ws/runtimeLog/:projectId', (req: Request, res: Response) => {
        if (!(req as any).claimUpgrade) {
          return (res as any).status(426).send('Connection must upgrade for web sockets.');
        }

        const projectId = (req as any).params.projectId;
        // initialize a new web socket server for each new projectId
        if (projectId && !this.servers[projectId]) {
          const { head, socket } = (req as any).claimUpgrade();

          const wsServer = new WSServer({
            noServer: true,
          });

          wsServer.on('connection', (socket, req) => {
            this.sockets[projectId] = socket;
            socket.on('close', () => {
              delete this.servers[projectId];
              delete this.sockets[projectId];
            });
          });

          // upgrade the connection to a ws connection
          wsServer.handleUpgrade(req as any, socket, head, (socket) => {
            wsServer.emit('connection', socket, req);
          });
          this.servers[projectId] = wsServer;
        }
      });
      this.port = port;
      this.hostname = hostname;
      return this.port;
    }
  }

  public static sendRuntimeLogToSubscribers(projectId: string, standardOutput: string, standardError: string): void {
    this.sockets[projectId]?.send(
      JSON.stringify({
        standardOutput,
        standardError,
      })
    );
  }
}
