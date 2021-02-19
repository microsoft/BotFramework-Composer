// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { StatusCodes } from 'http-status-codes';

import { BotErrorCodes, createAPIException } from '../../utils/apiErrorException';
import { createGetAttachmentHandler } from '../attachmentHandler';

const mockSendErrorResponse = jest.fn();

jest.mock('../../utils/apiErrorException', () => {
  return {
    sendErrorResponse: (...args) => mockSendErrorResponse(...args),
    BotErrorCodes: {
      ServiceError: 'ServiceError',
      BadArgument: 'BadArgument',
      BadSyntax: 'BadSyntax',
      MissingProperty: 'MissingProperty',
      MessageSizeTooBig: 'MessageSizeTooBig',
    },
    createAPIException: jest.fn(),
  };
});

describe('getAttachment handler', () => {
  let state;

  beforeEach(() => {
    state = {};
    mockSendErrorResponse.mockClear();
  });

  it('should return the attachment content uploaded via Web Chat', () => {
    const mockAttachmentData = new Uint8Array(Buffer.from('aGk='));
    state.attachments = {
      getAttachmentData: jest.fn(() => ({
        originalBase64: mockAttachmentData,
        type: 'text/plain',
      })),
    };
    const getAttachmentHandler = createGetAttachmentHandler(state);
    const req: any = {
      params: { viewId: 'original' },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
      type: jest.fn(),
    };

    getAttachmentHandler(req, res);

    expect(res.send).toHaveBeenCalledWith(StatusCodes.OK, Buffer.from(mockAttachmentData));
  });

  it('should return the attachment content uploaded via the bot', () => {
    const mockAttachmentData = Buffer.from('some data', 'base64').toString();
    state.attachments = {
      getAttachmentData: jest.fn(() => ({
        originalBase64: mockAttachmentData,
        type: 'text/plain',
      })),
    };
    const getAttachmentHandler = createGetAttachmentHandler(state);
    const req: any = {
      params: { viewId: 'original' },
    };
    const res: any = {
      end: jest.fn(),
      type: jest.fn(),
      send: jest.fn(),
    };

    getAttachmentHandler(req, res);

    expect(res.send).toHaveBeenCalledWith(StatusCodes.OK, Buffer.from(mockAttachmentData.toString(), 'base64'));
  });

  it('should send an error message if the original view is requested, but missing', () => {
    state.attachments = {
      getAttachmentData: jest.fn(() => ({ originalBase64: undefined })),
    };
    const getAttachmentHandler = createGetAttachmentHandler(state);
    const req: any = {
      params: { viewId: 'original' },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
      type: jest.fn(),
    };

    getAttachmentHandler(req, res);

    expect(mockSendErrorResponse).toHaveBeenCalledWith(
      req,
      res,
      createAPIException(StatusCodes.NOT_FOUND, BotErrorCodes.BadArgument, 'There is no original view')
    );
  });

  it('should send an error message if the thumbnail view is requested, but missing', () => {
    state.attachments = {
      getAttachmentData: jest.fn(() => ({ thumbnailBase64: undefined })),
    };
    const getAttachmentHandler = createGetAttachmentHandler(state);
    const req: any = {
      params: { viewId: 'thumbnail' },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    getAttachmentHandler(req, res);

    expect(mockSendErrorResponse).toHaveBeenCalledWith(
      req,
      res,
      createAPIException(StatusCodes.NOT_FOUND, BotErrorCodes.BadArgument, 'There is no thumbnail view')
    );
  });

  it('should send an error message the attachment can not be found', () => {
    state.attachments = {
      getAttachmentData: jest.fn(() => undefined),
    };
    const getAttachmentHandler = createGetAttachmentHandler(state);
    const req: any = {
      params: { attachmentId: 'attach1' },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    getAttachmentHandler(req, res);

    expect(mockSendErrorResponse).toHaveBeenCalledWith(
      req,
      res,
      createAPIException(
        StatusCodes.NOT_FOUND,
        BotErrorCodes.BadArgument,
        `attachment[${req.params.attachmentId}] not found`
      )
    );
  });

  it('should send an error message if an error is thrown', () => {
    state.attachments = {
      getAttachmentData: jest.fn(() => {
        throw new Error('Something went wrong.');
      }),
    };
    const getAttachmentHandler = createGetAttachmentHandler(state);
    const req: any = {
      params: {},
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };

    getAttachmentHandler(req, res);

    expect(mockSendErrorResponse).toHaveBeenCalledWith(
      req,
      res,
      createAPIException(StatusCodes.INTERNAL_SERVER_ERROR, BotErrorCodes.ServiceError, 'Something went wrong.')
    );
  });
});
