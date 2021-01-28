// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import StatusCodes from 'http-status-codes';
import * as express from 'express';

import { WebSocketServer } from './websocketServer';

export async function getWebSocketPort(
  req: express.Request,
  res: express.Response,
  next?: express.NextFunction
): Promise<any> {
  try {
    res.send(StatusCodes.OK, WebSocketServer.port || (await WebSocketServer.init()));
  } catch (e) {
    res.send(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
  res.end();
  next?.();
}
