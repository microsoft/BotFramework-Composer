// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { StatusCodes } from 'http-status-codes';

import { BotErrorCodes } from '../../utils/apiErrorException';
import { textItem } from '../../utils/helpers';
import { createUploadAttachmentHandler, createUploadHandler } from '../createUploadHandler';

let res;

const mockEnd = jest.fn();

jest.mock('moment', () => {
  return () => jest.requireActual('moment')('2021-02-19T00:00:00.000');
});

const mockJsonResponse = jest.fn(() => ({
  end: mockEnd,
}));

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
          throw {
            status: StatusCodes.BAD_REQUEST,
            message: `'You must specify type property for the attachment'. ${BotErrorCodes.MissingProperty}`,
          };
        }),
      },
    };
    const req: any = { path: 'v3/uploads', method: 'POST' };
    const uploadAttachment = createUploadAttachmentHandler(state);
    uploadAttachment(req, res);
    expect(mockJsonResponse).toHaveBeenCalledWith({
      logType: 'Error',
      message: "'You must specify type property for the attachment'. MissingProperty",
      route: 'POST v3/uploads',
      status: StatusCodes.BAD_REQUEST,
      timestamp: '2021-02-19 00:00:00',
    });
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
      is: jest.fn(),
    };
  });

  it('should send a 404 if there is no conversation attached to the request', async () => {
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
    await upload(req, res);

    expect(mockStatus).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(mockSend).toHaveBeenCalledWith('Cannot upload file. Conversation not found.');
    expect(mockEnd).toHaveBeenCalled();
    const logItem = textItem('Error', 'Cannot upload file. Conversation not found.');
    expect(mockLogToDoc).toHaveBeenCalledWith('conversation1', logItem);
  });

  it('should short circuit if the request content is not form data', async () => {
    const serverContext: any = {
      state: {
        dispatchers: {
          logToDocument: jest.fn(),
        },
      },
    };

    const req: any = {
      is: jest.fn(() => false),
      conversation: {
        postActivityToBot: jest.fn(),
      },
      getContentType: jest.fn(() => 'text/plain'),
      params: {
        conversationId: 'conversation1',
      },
    };

    const upload = createUploadHandler(serverContext.state);
    await upload(req, res);

    expect(mockStatus).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
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

    expect(mockStatus).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(mockSend).toHaveBeenCalledWith('Cannot parse attachment.');
    expect(mockEnd).toHaveBeenCalled();
  });

  it('should short circuit if there is no request content', async () => {
    const mockEmulatorServer: any = {
      logger: {
        logMessage: jest.fn(),
      },
      dispatchers: {
        logToDocument: jest.fn(),
      },
    };
    const req: any = {
      conversation: {
        postActivityToBot: jest.fn(),
      },
      headers: {
        'content-length': 0,
      },
      getContentLength: jest.fn(() => 0),
      getContentType: jest.fn(() => 'multipart/form-data'),
      isChunked: jest.fn(() => false),
      params: {
        conversationId: 'conversation1',
      },
      is: () => true,
    };
    const res: any = {
      end: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    const upload = createUploadHandler(mockEmulatorServer);
    await upload(req, res);

    expect(res.send).toHaveBeenCalledWith('Cannot parse attachment.');
    expect(res.end).toHaveBeenCalled();
  });
});
