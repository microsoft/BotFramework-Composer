// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as express from 'express';
import { StatusCodes } from 'http-status-codes';
import { DirectLineError } from '@botframework-composer/types';

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

export const handleDirectLineErrors = (req: express.Request, res: express.Response, err) => {
  let item: { error: DirectLineError };
  if (err.status && err.message) {
    item = { error: err };
  } else {
    const error = generateGenericError(err.code ?? BotErrorCodes.ServiceError, err);
    item = { error };
  }
  // send error through Express and let logNetworkTraffic middleware handle the logging
  res.status(item.error.status).json(item).end();
};
