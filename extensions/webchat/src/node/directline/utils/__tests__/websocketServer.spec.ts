// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WebSocketServer } from '../websocketServer';

const mockWSServer = {
  handleUpgrade: jest.fn(),
  on: jest.fn(),
};
jest.mock('ws', () => ({
  Server: jest.fn().mockImplementation(() => mockWSServer),
}));

const mockCreateServer = jest.fn();
jest.mock('http', () => ({
  createServer: (...args) => mockCreateServer(...args),
}));

jest.mock('express', () => {
  return () => {
    () => {
      return {
        use: (routerPath, handler) => {
          handler();
        },
      };
    };
  };
});

describe('WebSocketServer', () => {
  beforeEach(() => {
    mockCreateServer.mockClear();
    mockWSServer.handleUpgrade.mockClear();
    mockWSServer.on.mockClear();
    (WebSocketServer as any).restServer = undefined;
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

  // it('should initialize the server', async () => {
  //   (WebSocketServer as any).servers = {};
  //   (WebSocketServer as any).sockets = {};
  //   const mockRestServer = {
  //     address: () => ({ port: 56273 }),
  //     get: jest.fn(),
  //     listen: jest.fn((_port, cb) => {
  //       cb();
  //     }),
  //     once: jest.fn(),
  //   };
  //   mockCreateServer.mockReturnValueOnce(mockRestServer);
  //   const port = await WebSocketServer.init();

  //   expect(port).toBe(56273);
  //   expect(mockRestServer.get).toHaveBeenCalledWith('/ws/:conversationId', jasmine.any(Function));
  //   expect((WebSocketServer as any).restServer).toEqual(mockRestServer);
  // });

  // it('should not re-initialize if already initialized', async () => {
  //   (WebSocketServer as any).restServer = {}; // server initialized
  //   await WebSocketServer.init();

  //   expect(mockCreateServer).not.toHaveBeenCalled();
  // });

  // it('should clean up the rest server, web sockets, and web socket servers', () => {
  //   const conversationId = 'convoId1';
  //   const mockRestServer = {
  //     close: jest.fn(),
  //   };
  //   const mockServer = {
  //     close: jest.fn(),
  //   };
  //   const mockSocket = {
  //     close: jest.fn(),
  //   };
  //   (WebSocketServer as any).restServer = mockRestServer;
  //   (WebSocketServer as any).servers = {
  //     [conversationId]: mockServer,
  //   };
  //   (WebSocketServer as any).sockets = {
  //     [conversationId]: mockSocket,
  //   };
  //   WebSocketServer.cleanup();

  //   expect(mockRestServer.close).toHaveBeenCalled();
  //   expect(mockServer.close).toHaveBeenCalled();
  //   expect(mockSocket.close).toHaveBeenCalled();
  // });

  // it('should make sure that only a single WebSocket is created per conversation id', async () => {
  //   const registeredRoutes = {};
  //   const mockRestServer = {
  //     address: () => ({ port: 55523 }),
  //     get: (route, handler) => {
  //       registeredRoutes[route] = handler;
  //     },
  //     listen: jest.fn((_port, cb) => {
  //       cb();
  //     }),
  //     once: jest.fn(),
  //   };
  //   (WebSocketServer as any).restServer = undefined;
  //   (WebSocketServer as any).servers = {};
  //   (WebSocketServer as any).sockets = {};
  //   mockCreateServer.mockReturnValueOnce(mockRestServer);
  //   await WebSocketServer.init();

  //   const mockConversationId = 'convo1';
  //   const getHandler = registeredRoutes['/ws/:conversationId'];
  //   const req = {
  //     params: {
  //       conversationId: mockConversationId,
  //     },
  //   };
  //   const res = {
  //     claimUpgrade: () => ({ head: {}, socket: {} }),
  //   };
  //   const next = jest.fn();

  //   // first request to generate a new WS connection
  //   getHandler(req, res, next);

  //   expect(Object.keys((WebSocketServer as any).servers)).toEqual([mockConversationId]);

  //   // second request to generate a new WS connection
  //   getHandler(req, res, next);

  //   expect(Object.keys((WebSocketServer as any).servers)).toEqual([mockConversationId]);
  //   expect(mockWSServer.handleUpgrade).toHaveBeenCalledTimes(1);
  // });

  // it('should clear the messages backed up before websocket connection is started', async () => {
  //   let onConnectionFunction: any = null;
  //   let websocketHandler: any = null;

  //   (WebSocketServer as any).restServer = undefined;
  //   (WebSocketServer as any).servers = {};
  //   (WebSocketServer as any).sockets = {};

  //   mockWSServer.on.mockImplementation((event, implementation) => {
  //     if (event === 'connection') {
  //       onConnectionFunction = implementation;
  //     }
  //   });

  //   mockCreateServer.mockReturnValueOnce({
  //     address: () => ({ port: 55523 }),
  //     get: (route, handler) => {
  //       websocketHandler = handler;
  //     },
  //     listen: jest.fn((_port, cb) => {
  //       cb();
  //     }),
  //     once: jest.fn(),
  //   });
  //   await WebSocketServer.init();

  //   WebSocketServer.queueActivities('conv-123', { id: 'activity-1' } as Activity);
  //   WebSocketServer.queueActivities('conv-234', { id: 'activity-1' } as Activity);
  //   WebSocketServer.queueActivities('conv-123', { id: 'activity-2' } as Activity);
  //   WebSocketServer.queueActivities('conv-234', { id: 'activity-2' } as Activity);

  //   websocketHandler(
  //     {
  //       params: {
  //         conversationId: 'conv-234',
  //       },
  //     },
  //     {
  //       claimUpgrade: jest.fn(() => {
  //         return {
  //           head: jest.fn(),
  //           socket: jest.fn(),
  //         };
  //       }),
  //     }
  //   );
  //   const socketSendMock = jest.fn();
  //   onConnectionFunction({
  //     send: socketSendMock,
  //     on: jest.fn(),
  //   });
  //   expect(socketSendMock).toHaveBeenCalledTimes(2);
  //   expect(socketSendMock).toHaveBeenNthCalledWith(1, JSON.stringify({ activities: [{ id: 'activity-1' }] }));
  //   expect(socketSendMock).toHaveBeenNthCalledWith(2, JSON.stringify({ activities: [{ id: 'activity-2' }] }));
  //   socketSendMock.mockClear();

  //   websocketHandler(
  //     {
  //       params: {
  //         conversationId: 'conv-123',
  //       },
  //     },
  //     {
  //       claimUpgrade: jest.fn(() => {
  //         return {
  //           head: jest.fn(),
  //           socket: jest.fn(),
  //         };
  //       }),
  //     }
  //   );
  //   onConnectionFunction({
  //     send: socketSendMock,
  //     on: jest.fn(),
  //   });
  //   expect(socketSendMock).toHaveBeenCalledTimes(2);
  //   expect(socketSendMock).toHaveBeenNthCalledWith(1, JSON.stringify({ activities: [{ id: 'activity-1' }] }));
  //   expect(socketSendMock).toHaveBeenNthCalledWith(2, JSON.stringify({ activities: [{ id: 'activity-2' }] }));
  // });
});
