// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { StatusCodes } from 'http-status-codes';

import { textItem } from '../../utils/helpers';
import { createUploadAttachmentHandler, createUploadHandler } from '../createUploadHandler';

const mockSendErrorResponse = jest.fn();
jest.mock('../../utils/apiErrorException.ts', () => ({
  sendErrorResponse: (...args) => mockSendErrorResponse(...args),
}));

let res;
const mockEnd = jest.fn();
const mockJsonResponse = jest.fn();
const mockSend = jest.fn(() => ({
  end: mockEnd,
}));

const mockStatus = jest.fn(() => ({
  json: mockJsonResponse,
  send: mockSend,
}));

describe('uploadAttachment handler', () => {
  beforeEach(() => {
    mockEnd.mockClear();
    mockJsonResponse.mockClear();
    mockStatus.mockClear();
    res = {
      send: mockSend,
      status: mockStatus,
    };
  });

  it('should upload the attachment and return a resource response with a 200', () => {
    const state: any = {
      attachments: {
        uploadAttachment: jest.fn(() => 'resourceId'),
      },
    };
    const req: any = {
      body: 'someData',
    };

    const uploadAttachment = createUploadAttachmentHandler(state);
    uploadAttachment(req, res);

    expect(state.attachments.uploadAttachment).toHaveBeenCalledWith('someData');
    expect(mockStatus).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockJsonResponse).toHaveBeenCalledWith({ id: 'resourceId' });
  });

  it('should send an error response if something goes wrong', () => {
    const state: any = {
      attachments: {
        uploadAttachment: jest.fn(() => {
          throw new Error('Something went wrong.');
        }),
      },
    };
    const req: any = { body: {} };
    const uploadAttachment = createUploadAttachmentHandler(state);
    uploadAttachment(req, res);
    expect(mockSendErrorResponse).toHaveBeenCalledWith(req, res, new Error('Something went wrong.'));
  });
});

describe('upload handler', () => {
  beforeEach(() => {
    mockEnd.mockClear();
    mockJsonResponse.mockClear();
    mockStatus.mockClear();
    res = {
      send: mockSend,
      status: mockStatus,
    };
  });

  it('should send a 404 if there is no conversation attached to the request', () => {
    const mockLogToDoc = jest.fn();
    const serverContext: any = {
      state: {
        dispatchers: {
          logToDocument: mockLogToDoc,
        },
      },
    };
    const req: any = {
      params: {
        conversationId: 'conversation1',
      },
    };
    const upload = createUploadHandler(serverContext.state);
    upload(req, res);

    expect(mockStatus).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(mockSend).toHaveBeenCalledWith('conversation not found');
    expect(mockEnd).toHaveBeenCalled();
    const logItem = textItem('Error', 'Cannot upload file. Conversation not found.');
    expect(mockLogToDoc).toHaveBeenCalledWith('conversation1', logItem);
  });

  it('should short circuit if the request content is not form data', () => {
    const serverContext: any = {
      state: {},
    };

    const req: any = {
      is: jest.fn(() => false),
      conversation: {},
      getContentType: jest.fn(() => 'text/plain'),
      params: {
        conversationId: 'conversation1',
      },
    };

    const upload = createUploadHandler(serverContext.state);
    upload(req, res);

    expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(mockSend).toHaveBeenCalledWith('Cannot parse attachment.');
    expect(mockEnd).toHaveBeenCalled();

    const requestWithNoContent: any = {
      is: jest.fn(() => true),
      headers: {
        'content-length': 0,
      },
      conversation: {},
      getContentType: jest.fn(() => 'text/plain'),
      params: {
        conversationId: 'conversation1',
      },
    };

    upload(requestWithNoContent, res);

    expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(mockSend).toHaveBeenCalledWith('Cannot parse attachment.');
    expect(mockEnd).toHaveBeenCalled();
  });

  it('should short circuit if there is no request content', () => {
    const mockEmulatorServer: any = {
      logger: {
        logMessage: jest.fn(),
      },
      state: {},
    };
    const req: any = {
      conversation: {},
      getContentLength: jest.fn(() => 0),
      getContentType: jest.fn(() => 'multipart/form-data'),
      isChunked: jest.fn(() => false),
      params: {
        conversationId: 'conversation1',
      },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const upload = createUploadHandler(mockEmulatorServer);
    upload(req, res);

    expect(res.send).not.toHaveBeenCalled();
    expect(res.end).not.toHaveBeenCalled();
  });
});
