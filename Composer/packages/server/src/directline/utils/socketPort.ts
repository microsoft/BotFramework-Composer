// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import StatusCodes from 'http-status-codes';
import * as express from 'express';

import { WebSocketServer } from './webSocketServer';

export async function getWebSocketPort(req: express.Request, res: express.Response): Promise<void> {
  try {
    let socketPort: any = WebSocketServer.port;
    let newRestServerSetup = false;
    if (!socketPort) {
      socketPort = await WebSocketServer.init();
      newRestServerSetup = true;
    }
    res.status(StatusCodes.OK).json({ port: socketPort, newRestServerSetup });
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
  }
}

export function cleanUpAllConversations(): void {
  WebSocketServer.cleanUpAll();
}
