// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';

import { WebSocketServer } from './webSocketServer';

export async function getWebSocketPort(req: Request, res: Response): Promise<void> {
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
