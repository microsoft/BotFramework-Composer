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
  status: number;
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
  if (exception?.data && exception?.status) {
    return {
      error: exception.data,
      status: exception?.status,
    };
  } else {
    return {
      error: createErrorResponse(BotErrorCodes.ServiceError, exception.message),
      status: StatusCodes.BAD_REQUEST,
    };
  }
}

export function createAPIException(statusCode: number, code: string, message: string): APIException {
  return {
    status: statusCode,
    error: createErrorResponse(code, message),
  };
}

export function sendErrorResponse(req: express.Request, res: express.Response, exceptionObj: any): ErrorResponse {
  const apiException = exceptionToAPIException(exceptionObj);
  res.status(apiException.status).json(apiException.error);
  return apiException.error;
}
