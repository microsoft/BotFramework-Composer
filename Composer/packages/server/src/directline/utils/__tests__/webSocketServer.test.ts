// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Activity } from 'botframework-schema';

import { WebSocketServer } from '../webSocketServer';

const mockOnConnection = jest.fn();
const mockWSServer = {
  handleUpgrade: jest.fn(),
  on: mockOnConnection,
  close: jest.fn(),
};
jest.mock('ws', () => ({
  Server: jest.fn().mockImplementation(() => mockWSServer),
}));

jest.mock('portfinder', () => ({
  getPortPromise: () =>
    new Promise((resolve) => {
      resolve(4000);
    }),
}));

const mockCreateServer = jest.fn();
jest.mock('http', () => ({
  createServer: (...args) => {
    return mockCreateServer(...args);
  },
}));

const mockUse = jest.fn();
jest.mock('express', () => {
  return () => {
    return {
      use: mockUse,
    };
  };
});

describe('WebSocketServer', () => {
  beforeEach(() => {
    mockCreateServer.mockClear();
    mockWSServer.handleUpgrade.mockClear();
    mockWSServer.on.mockClear();
    (WebSocketServer as any).restServer = undefined;
    (WebSocketServer as any).sockets = {};
    (WebSocketServer as any).servers = {};
  });

  it('should return the corresponding socket for a conversation id', () => {
    const conversationId = 'convoId1';
    const mockSocket = {};
    (WebSocketServer as any).sockets = {
      [conversationId]: mockSocket,
    };
    const socket = WebSocketServer.getSocketByConversationId(conversationId);
    expect(socket).toEqual(mockSocket);
  });

  it('should throw an error if no upgrade can be claimed', async () => {
    mockUse.mockImplementationOnce((path, callFn) => {
      expect(path).toBe('/ws/conversation/:conversationId');
      const req = {
        params: {
          conversationId: '123213-123',
        },
      };

      const mockResStatus = jest.fn(() => {
        return {
          send: jest.fn(),
        };
      });
      const res = {
        status: mockResStatus,
      };
      callFn.call(null, req, res);
      expect(mockResStatus).toHaveBeenCalledWith(426);
    });

    mockCreateServer.mockImplementationOnce((app) => {
      return {
        on: jest.fn(),
        listen: jest.fn(),
      };
    });
    await WebSocketServer.init();
  });

  it('should not create a socket connection for an existing connection', async () => {
    (WebSocketServer as any).servers = {
      '123213-123': {},
    };
    mockUse.mockImplementationOnce((path, callFn) => {
      expect(path).toBe('/ws/conversation/:conversationId');
      const req = {
        params: {
          conversationId: '123213-123',
        },
        claimUpgrade: jest.fn(),
      };

      const mockResStatus = jest.fn(() => {
        return {
          send: jest.fn(),
        };
      });
      const res = {
        status: mockResStatus,
      };
      callFn.call(null, req, res);
      expect(mockResStatus).toHaveBeenCalledTimes(0);
    });

    mockCreateServer.mockImplementationOnce(() => {
      return {
        on: jest.fn(),
        listen: jest.fn(),
      };
    });
    await WebSocketServer.init();
  });

  it('should create a socket connection if a new conversation id comes and send the queued messages to the user from bot', async () => {
    const conversationId = '123213-123';
    const mocksSend = jest.fn();
    mockOnConnection.mockImplementationOnce((type: string, callFn) => {
      if (type === 'connection') {
        callFn.call(null, {
          send: mocksSend,
          on: jest.fn(),
        });
      }
    });

    mockUse.mockImplementationOnce((path, callFn) => {
      expect(path).toBe('/ws/conversation/:conversationId');
      const req = {
        params: {
          conversationId,
        },
        claimUpgrade: () => {
          return {
            head: jest.fn(),
            socket: jest.fn(),
          };
        },
      };

      const mockResStatus = jest.fn(() => {
        return {
          send: jest.fn(),
        };
      });
      const res = {
        status: mockResStatus,
      };
      callFn.call(null, req, res);
      expect(mockResStatus).toHaveBeenCalledTimes(0);
    });

    mockCreateServer.mockImplementationOnce((app) => {
      return {
        on: jest.fn(),
        listen: jest.fn(),
        close: jest.fn(),
      };
    });
    // The bot has sent back activities before the connection has completed.
    WebSocketServer.queueActivities(conversationId, {
      id: 'a',
    } as Activity);

    WebSocketServer.queueActivities(conversationId, {
      id: 'b',
    } as Activity);

    WebSocketServer.queueActivities(conversationId, {
      id: 'c',
    } as Activity);

    await WebSocketServer.init();
    expect(mocksSend).toHaveBeenCalledTimes(3);
    expect(mocksSend).toHaveBeenNthCalledWith(
      1,
      JSON.stringify({
        activities: [
          {
            id: 'a',
          },
        ],
      })
    );
    expect(mocksSend).toHaveBeenNthCalledWith(
      3,
      JSON.stringify({
        activities: [
          {
            id: 'c',
          },
        ],
      })
    );
  });
});
