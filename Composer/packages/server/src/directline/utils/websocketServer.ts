// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import http from 'http';

import express, { Response } from 'express';
import { Activity } from 'botframework-schema';
import { Server as WSServer } from 'ws';
// can't import WebSocket type from ws types :|
interface WebSocket {
  close(): void;
  send(data: any, cb?: (err?: Error) => void): void;
}

export class WebSocketServer {
  private static restServer;
  private static servers: { [conversationId: string]: WSServer } = {};
  private static sockets: { [conversationId: string]: WebSocket } = {};
  private static queuedMessages: { [conversationId: string]: Activity[] } = {};

  private static sendBackedUpMessages(conversationId: string, socket: WebSocket) {
    if (this.queuedMessages[conversationId]) {
      while (this.queuedMessages[conversationId].length > 0) {
        const activity: Activity | undefined = this.queuedMessages[conversationId].shift();
        const payload = { activities: [activity] };
        socket.send(JSON.stringify(payload));
      }
    }
  }

  public static port;

  public static getSocketByConversationId(conversationId: string): WebSocket {
    return this.sockets[conversationId];
  }

  public static queueActivities(conversationId: string, activity: Activity): void {
    if (!this.queuedMessages[conversationId]) {
      this.queuedMessages[conversationId] = [];
    }
    this.queuedMessages[conversationId].push(activity);
  }

  public static sendToSubscribers(conversationId: string, activity: Activity): void {
    const socket = this.sockets[conversationId];
    if (socket) {
      const payload = { activities: [activity] };
      this.sendBackedUpMessages(conversationId, socket);
      socket.send(JSON.stringify(payload));
    } else {
      this.queueActivities(conversationId, activity);
    }
  }

  /** Initializes the server and returns the port it is listening on, or if already initialized,
   *  is a no-op.
   */
  public static async init(): Promise<number | void> {
    if (!this.restServer) {
      const app = express();
      const server = http.createServer(app);

      server.on('upgrade', (req, socket, head) => {
        req.claimUpgrade = () => ({
          head,
          socket,
        });
        const res = new http.ServerResponse(req);
        return app(req, res as Response);
      });

      server.listen(5001);
      this.port = 5001;

      app.use('/ws/:conversationId', (req: express.Request, res: express.Response) => {
        if (!(req as any).claimUpgrade) {
          return res.status(426).send('Connection must upgrade for web sockets.');
        }
        const conversationId = req.params.conversationId;
        // initialize a new web socket server for each new conversation
        if (conversationId && !this.servers[conversationId]) {
          const { head, socket } = (req as any).claimUpgrade();
          const wsServer = new WSServer({
            noServer: true,
          });
          wsServer.on('connection', (socket, req) => {
            this.sendBackedUpMessages(conversationId, socket);
            this.sockets[conversationId] = socket;
            socket.on('close', () => {
              delete this.servers[conversationId];
              delete this.sockets[conversationId];
              delete this.queuedMessages[conversationId];
            });
          });
          // upgrade the connection to a ws connection
          wsServer.handleUpgrade(req as any, socket, head, (socket) => {
            wsServer.emit('connection', socket, req);
          });
          this.servers[conversationId] = wsServer;
        }
      });

      // eslint-disable-next-line no-console
      console.log(`Web Socket host server listening on ${this.port}...`);
      return this.port;
    }
  }

  public static cleanup(): void {
    for (const conversationId in this.sockets) {
      this.sockets[conversationId].close();
    }
    for (const conversationId in this.servers) {
      this.servers[conversationId].close();
    }
    this.restServer.close();
  }
}
