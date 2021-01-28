// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import StatusCodes from 'http-status-codes';
import * as express from 'express';

import { WebSocketServer } from './websocketServer';

export async function getWebSocketPort(
  req: express.Request,
  res: express.Response
): Promise<any> {
  try {
    let socketPort = WebSocketServer.port;
    if(!socketPort) {
      socketPort = await WebSocketServer.init()
    }
    res.status(StatusCodes.OK).json(socketPort);
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
  }
}
