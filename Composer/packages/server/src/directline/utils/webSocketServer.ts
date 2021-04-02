// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import http from 'http';

import portfinder from 'portfinder';
import express, { Response } from 'express';
import { Activity } from 'botframework-schema';
import { Server as WSServer } from 'ws';
import {
  ConversationActivityTraffic,
  ConversationNetworkErrorItem,
  ConversationNetworkTrafficItem,
} from '@botframework-composer/types';

import log from './logger';

const socketTrafficChannelKey = 'DL_TRAFFIC_SOCKET';
interface WebSocket {
  close(): void;
  send(data: any, cb?: (err?: Error) => void): void;
}

export class WebSocketServer {
  private static restServer: http.Server;
  private static servers: Record<string, WSServer> = {};
  private static trafficServer: WSServer | null = null;
  private static sockets: Record<string, WebSocket> = {};

  private static queuedMessages: { [conversationId: string]: Activity[] } = {};

  private static sendBackedUpMessages(conversationId: string, socket: WebSocket) {
    if (this.queuedMessages[conversationId]) {
      while (this.queuedMessages[conversationId].length > 0) {
        const activity: Activity | undefined = this.queuedMessages[conversationId].shift();
        if (activity) {
          const payload = { activities: [activity] };
          socket.send(JSON.stringify(payload));
          this.sendTrafficToSubscribers({ ...payload, trafficType: 'activity' });
        }
      }
    }
  }

  public static port: number;

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
      this.sendTrafficToSubscribers({ ...payload, trafficType: 'activity' });
    } else {
      this.queueActivities(conversationId, activity);
    }
  }

  public static async init(): Promise<number | void> {
    if (!this.restServer) {
      const app = express();
      this.restServer = http.createServer(app);

      this.restServer.on('upgrade', (req, socket, head) => {
        req.claimUpgrade = () => ({
          head,
          socket,
        });
        const res = new http.ServerResponse(req);
        return app(req, res as Response);
      });
      const port = await portfinder.getPortPromise();
      this.port = port;
      this.restServer.listen(port);

      app.use('/ws/conversation/:conversationId', (req: express.Request, res: express.Response) => {
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

      app.use('/ws/traffic', (req: express.Request, res: express.Response) => {
        if (!(req as any).claimUpgrade) {
          return res.status(426).send('Connection must upgrade for web sockets.');
        }

        if (!this.trafficServer) {
          const { head, socket } = (req as any).claimUpgrade();

          const wsServer = new WSServer({
            noServer: true,
          });

          wsServer.on('connection', (socket, req) => {
            this.sockets[socketTrafficChannelKey] = socket;

            socket.on('close', () => {
              this.trafficServer = null;
              delete this.sockets[socketTrafficChannelKey];
            });
          });

          wsServer.handleUpgrade(req as any, socket, head, (socket) => {
            wsServer.emit('connection', socket, req);
          });
          this.trafficServer = wsServer;
        }
      });

      log(`Web Socket host server listening on ${this.port}...`);
      return this.port;
    }
  }

  public static sendTrafficToSubscribers(
    data: Partial<ConversationActivityTraffic> | ConversationNetworkTrafficItem | ConversationNetworkErrorItem
  ): void {
    this.sockets[socketTrafficChannelKey]?.send(JSON.stringify(data));
  }

  public static cleanUpConversation(conversationId: string): void {
    if (this.sockets[conversationId]) {
      this.sockets[conversationId]?.close();
    }

    if (this.servers[conversationId]) {
      this.servers[conversationId]?.close();
    }
  }

  public static cleanUpAll(): void {
    for (const conversationId in this.sockets) {
      this.cleanUpConversation(conversationId);
    }

    if (this.trafficServer) {
      this.trafficServer.close();
    }

    if (this.restServer) {
      this.restServer.close();
    }
  }
}
