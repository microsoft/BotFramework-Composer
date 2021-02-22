// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as express from 'express';
import { StatusCodes } from 'http-status-codes';
import moment from 'moment';
import { DirectLineError, DirectLineLog } from '@botframework-composer/types';

import { WebSocketServer } from './webSocketServer';

export enum BotErrorCodes {
  /// unknown service error
  ServiceError = 'ServiceError',

  /// Bad argument
  BadArgument = 'BadArgument',

  /// Error parsing request
  BadSyntax = 'BadSyntax',

  /// Mandatory property was not specified
  MissingProperty = 'MissingProperty',

  /// Message exceeded size limits
  MessageSizeTooBig = 'MessageSizeTooBig',
}

const generateGenericError = (code: BotErrorCodes, exception: any, status?: number): DirectLineError => {
  const apiException = {
    message: JSON.stringify({
      code,
      exception,
    }),
    status: status ?? StatusCodes.BAD_REQUEST,
  };
  return apiException;
};

export const createDirectLineErrorLog = (req: express.Request, errorObject: DirectLineError): DirectLineLog => {
  return {
    timestamp: moment().local().format('YYYY-MM-DD HH:mm:ss'),
    route: `${req.method} ${req.path}`,
    logType: 'Error',
    ...errorObject,
  };
};

export const handleDirectLineErrors = (req: express.Request, res: express.Response, err) => {
  let item: DirectLineLog;
  if (err.status && err.message) {
    item = createDirectLineErrorLog(req, err);
  } else {
    const error = generateGenericError(err.code ?? BotErrorCodes.ServiceError, err);
    item = createDirectLineErrorLog(req, error);
  }
  WebSocketServer.sendDLErrorsToSubscribers(item);
  res.status(item.status).json(item).end();
};
