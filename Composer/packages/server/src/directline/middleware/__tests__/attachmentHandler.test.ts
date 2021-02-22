// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { StatusCodes } from 'http-status-codes';

import { createGetAttachmentHandler } from '../attachmentHandler';

let res;

jest.mock('moment', () => {
  return () => jest.requireActual('moment')('2021-02-19T00:00:00.000');
});

const mockEnd = jest.fn();
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

describe('getAttachment handler', () => {
  const state: any = {};

  beforeEach(() => {
    mockEnd.mockClear();
    mockJsonResponse.mockClear();
    mockStatus.mockClear();
    res = {
      send: mockSend,
      status: mockStatus,
    };
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
      json: mockJsonResponse,
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
      status: jest.fn(),
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
      method: 'GET',
      path: '/v3/attachments/:attachmentId/views/:viewId',
      params: { viewId: 'original' },
    };

    getAttachmentHandler(req, res);

    expect(mockJsonResponse).toHaveBeenCalledWith({
      errorDetails: 'There is no original view',
      logType: 'Error',
      message: 'Unable to fetch attachment data. BadArgument',
      route: 'GET /v3/attachments/:attachmentId/views/:viewId',
      status: 404,
      timestamp: '2021-02-19 00:00:00',
    });
  });

  it('should send an error message if the thumbnail view is requested, but missing', () => {
    state.attachments = {
      getAttachmentData: jest.fn(() => ({ thumbnailBase64: undefined })),
    };
    const getAttachmentHandler = createGetAttachmentHandler(state);
    const req: any = {
      params: { viewId: 'thumbnail' },
      method: 'GET',
      path: '/v3/attachments/:attachmentId/views/:viewId',
    };

    getAttachmentHandler(req, res);

    expect(mockJsonResponse).toHaveBeenCalledWith({
      errorDetails: 'There is no thumbnail view',
      logType: 'Error',
      message: 'Unable to fetch attachment data. BadArgument',
      route: 'GET /v3/attachments/:attachmentId/views/:viewId',
      status: 404,
      timestamp: '2021-02-19 00:00:00',
    });
  });

  it('should send an error message the attachment can not be found', () => {
    state.attachments = {
      getAttachmentData: jest.fn(() => undefined),
    };
    const getAttachmentHandler = createGetAttachmentHandler(state);
    const req: any = {
      params: { attachmentId: 'attach1' },
      method: 'GET',
      path: '/v3/attachments/:attachmentId/views/:viewId',
    };

    getAttachmentHandler(req, res);

    expect(mockJsonResponse).toHaveBeenCalledWith({
      logType: 'Error',
      message: 'attachment[attach1] not found. BadArgument',
      status: 404,
      route: 'GET /v3/attachments/:attachmentId/views/:viewId',
      timestamp: '2021-02-19 00:00:00',
    });
  });

  it('should send an error message if an error is thrown', () => {
    state.attachments = {
      getAttachmentData: jest.fn(() => undefined),
    };
    const getAttachmentHandler = createGetAttachmentHandler(state);
    const req: any = {
      params: {},
      method: 'GET',
      path: '/v3/attachments/:attachmentId/views/:viewId',
    };

    getAttachmentHandler(req, res);

    expect(mockJsonResponse).toHaveBeenCalledWith({
      logType: 'Error',
      message: 'attachment[undefined] not found. BadArgument',
      status: 404,
      route: 'GET /v3/attachments/:attachmentId/views/:viewId',
      timestamp: '2021-02-19 00:00:00',
    });
  });
});
