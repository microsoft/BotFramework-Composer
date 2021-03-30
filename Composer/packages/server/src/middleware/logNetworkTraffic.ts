// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { NextFunction, Request, Response } from 'express';

import { WebSocketServer } from '../directline/utils/webSocketServer';

export function logNetworkTraffic(req: Request, res: Response, next?: NextFunction) {
  const data = {
    request: { method: req.method, payload: req.body, route: req.originalUrl },
    response: {
      payload: { status: res.statusCode /* TODO: plumb actual response into this */ },
      statusCode: res.statusCode,
    },
    timestamp: new Date().toISOString(),
    trafficType: 'network' as 'network',
  };
  WebSocketServer.sendNetworkTrafficToSubscribers(data);
  next?.();
}
