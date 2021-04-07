// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { logNetworkTraffic } from '../logNetworkTraffic';

const mockSendTrafficToSubscribers = jest.fn();
jest.mock('../../directline/utils/webSocketServer', () => ({
  WebSocketServer: {
    sendTrafficToSubscribers: (data) => mockSendTrafficToSubscribers(data),
  },
}));

describe('logNetworkTraffic middleware', () => {
  beforeEach(() => {
    mockSendTrafficToSubscribers.mockClear();
  });

  const mockReq: any = {
    method: 'POST',
    originalUrl:
      'http://localhost:5000/v3/directline/conversations/36842e12-3ac5-446a-bafd-d073c2d8cb1d%7Clivechat/activities',
    body: { data: 123 },
  };

  it('should log a successful network response to the client', () => {
    const mockData = { data: 'some data' };
    const mockSend = (data) => data;
    const mockRes: any = {
      once: jest.fn((ev, cb) => {
        // call send() then invoke the event handler
        mockRes.send(JSON.stringify(mockData));
        cb();
      }),
      send: mockSend,
      statusCode: 200,
    };
    const mockNext = jest.fn();
    logNetworkTraffic(mockReq, mockRes, mockNext);

    expect(mockSendTrafficToSubscribers).toHaveBeenCalled();
    const sentTraffic = mockSendTrafficToSubscribers.mock.calls[0][0];
    expect(sentTraffic.request).toEqual({ method: mockReq.method, payload: mockReq.body, route: mockReq.originalUrl });
    expect(sentTraffic.response.statusCode).toBe(mockRes.statusCode);
    expect(sentTraffic.response.payload).toEqual(JSON.parse(JSON.stringify(mockData)));
    expect(sentTraffic.trafficType).toBe('network');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should log an error to the client', () => {
    const mockData = {
      error: { message: 'Bad request', details: 'Missing parameter "importantThing" in request. Please try again.' },
    };
    const mockSend = (data) => data;
    const mockRes: any = {
      once: jest.fn((ev, cb) => {
        // call send() then invoke the event handler
        mockRes.send(JSON.stringify(mockData));
        cb();
      }),
      send: mockSend,
      statusCode: 400,
    };
    const mockNext = jest.fn();
    logNetworkTraffic(mockReq, mockRes, mockNext);

    expect(mockSendTrafficToSubscribers).toHaveBeenCalled();
    const sentTraffic = mockSendTrafficToSubscribers.mock.calls[0][0];
    expect(sentTraffic.request).toEqual({ method: mockReq.method, payload: mockReq.body, route: mockReq.originalUrl });
    expect(sentTraffic.response.statusCode).toBe(mockRes.statusCode);
    expect(sentTraffic.response.payload).toEqual(JSON.parse(JSON.stringify(mockData)));
    expect(sentTraffic.error).toEqual(mockData.error);
    expect(sentTraffic.trafficType).toBe('networkError');
    expect(mockNext).toHaveBeenCalled();
  });
});
