// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as express from 'express';
import { StatusCodes } from 'http-status-codes';

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

type ErrorResponse = {
  error: {
    code?: string;
    message?: string;
  };
};

type APIException = {
  error: ErrorResponse;
  statusCode: number;
};

const createErrorResponse = (code: string, message: string): ErrorResponse => {
  return {
    error: {
      code,
      message,
    },
  };
};

function exceptionToAPIException(exception: any): APIException {
  if (exception.error && exception.statusCode) {
    return exception;
  } else {
    return {
      error: createErrorResponse(BotErrorCodes.ServiceError, exception.message),
      statusCode: StatusCodes.BAD_REQUEST,
    };
  }
}

export function createAPIException(statusCode: number, code: string, message: string): APIException {
  return {
    statusCode,
    error: createErrorResponse(code, message),
  };
}

export function sendErrorResponse(req: express.Request, res: express.Response, exception: any): ErrorResponse {
  const apiException = exceptionToAPIException(exception);
  res.send(apiException.statusCode, apiException.error);
  res.end();
  return apiException.error;
}
