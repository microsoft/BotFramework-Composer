// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { StatusCodes } from 'http-status-codes';

import { BotEndpoint } from '../../store/entities/botEndpoint';
import { Conversation } from '../../store/entities/conversation';
import {
  createReplyToActivityHandler,
  createPostActivityHandler,
  createUpdateConversationHandler,
} from '../conversationHandler';

const mockSendToSubscribers = jest.fn();
const mockSendErrorToSubscribers = jest.fn();

jest.mock('moment', () => {
  return () => jest.requireActual('moment')('2021-02-19T00:00:00.000');
});

jest.mock('../../utils/webSocketServer.ts', () => {
  return {
    WebSocketServer: {
      sendToSubscribers: (...args) => mockSendToSubscribers(...args),
      sendDLErrorsToSubscribers: (...args) => mockSendErrorToSubscribers(...args),
    },
  };
});

let res;
const mockEnd = jest.fn();

const createMockEnd = () => ({
  end: mockEnd,
});

const mockJsonResponse = jest.fn(() => ({
  ...createMockEnd(),
}));

const mockSend = jest.fn(() => ({
  ...createMockEnd(),
}));

const mockStatus = jest.fn(() => ({
  json: mockJsonResponse,
  send: mockSend,
}));

describe('sendActivityToConversation handler', () => {
  beforeEach(() => {
    mockJsonResponse.mockClear();
    mockStatus.mockClear();
    res = {
      send: mockSend,
      status: mockStatus,
    };
  });

  it('should send the activity to the user through socket', () => {
    const req: any = {
      params: {
        activityId: 'id-1',
      },
      body: {
        id: 'test-activity',
      },
      conversation: {
        user: {
          id: 'user-1',
        },
        prepActivityToBeSentToUser: jest.fn((userId, activity) => {
          return {
            ...activity,
          };
        }),
      },
    };

    createReplyToActivityHandler(req, res);
    expect(mockStatus).toHaveBeenLastCalledWith(StatusCodes.OK);
    expect(mockJsonResponse).toHaveBeenLastCalledWith({ id: 'test-activity' });
  });
});

describe('postActivityToBot handler', () => {
  beforeEach(() => {
    mockSend.mockClear();
    mockJsonResponse.mockClear();
    mockStatus.mockClear();
    res = {
      send: mockSend,
      status: mockStatus,
    };
  });

  it('should throw an error if no conversation present while posting to bot', () => {
    const state: any = {
      dispatchers: {
        logToDocument: jest.fn(),
      },
    };

    const req: any = {};

    const postActivityHandler = createPostActivityHandler(state);
    postActivityHandler(req, res);
    expect(mockSend).toHaveBeenCalledWith('Conversation not found.');
    expect(mockStatus).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(mockEnd).toHaveBeenCalled();
  });

  it('should post activity to bot', async () => {
    const state: any = {
      dispatchers: {
        logToDocument: jest.fn(),
      },
    };
    const mockPostToBot = jest.fn();

    const req: any = {
      params: {
        activityId: 'id-1',
      },
      body: {
        id: 'test-activity',
      },
      conversation: {
        user: {
          id: 'user-1',
        },
        conversationId: 'conversation-1',
        postActivityToBot: mockPostToBot,
      },
    };
    mockPostToBot.mockResolvedValueOnce({
      sendActivity: {
        id: 'test-activity',
      },
      status: 201,
    });

    const postActivityHandler = createPostActivityHandler(state);
    await postActivityHandler(req, res);

    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJsonResponse).toHaveBeenCalledWith({
      id: 'test-activity',
    });
  });

  it('should handle errors while posting activity to bot', async () => {
    const state: any = {
      dispatchers: {
        logToDocument: jest.fn(),
      },
    };
    const mockPostToBot = jest.fn();

    const req: any = {
      method: 'POST',
      path: 'v3/directine/conv-123',
      params: {
        activityId: 'id-1',
      },
      body: {
        id: 'test-activity',
      },
      conversation: {
        user: {
          id: 'user-1',
        },
        conversationId: 'conversation-1',
        postActivityToBot: mockPostToBot,
      },
    };
    mockPostToBot.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          error: 'The bot cannot accept messages at this time',
          errorCode: ['123Z-4', '989-Az'],
        },
      },
    });
    const postActivityHandler = createPostActivityHandler(state);
    await postActivityHandler(req, res);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJsonResponse).toHaveBeenCalledWith({
      logType: 'Error',
      message:
        '{"code":"ServiceError","exception":{"response":{"status":400,"data":{"error":"The bot cannot accept messages at this time","errorCode":["123Z-4","989-Az"]}}}}',
      route: 'POST v3/directine/conv-123',
      status: 400,
      timestamp: '2021-02-19 00:00:00',
    });
  });
});

describe('updateConversation handler', () => {
  beforeEach(() => {
    mockJsonResponse.mockClear();
    mockStatus.mockClear();
    res = {
      send: mockSend,
      status: mockStatus,
    };
  });

  it('should update conversation', () => {
    const mockDeleteConversation = jest.fn();
    const mockUpdateConversation = jest.fn();
    const botEndpoint = new BotEndpoint('endpoint-1', 'bot-1', 'http://localhost:3978/api/message');
    const oldConversation = new Conversation(
      botEndpoint,
      'conversation-old',
      {
        name: 'user-old',
        id: 'user-old',
      },
      'livechat',
      'en-us'
    );

    const state: any = {
      dispatchers: {
        logToDocument: jest.fn(),
        updateConversation: mockUpdateConversation,
      },
      conversations: {
        conversationById: (conversationId: string) => oldConversation,
        deleteConversation: mockDeleteConversation,
      },
    };

    const req: any = {
      params: {
        conversationId: 'conversation-old',
      },
      body: {
        conversationId: 'conversation-new',
        userId: 'user-new',
      },
    };

    const updateConversationHandler = createUpdateConversationHandler(state);
    updateConversationHandler(req, res);

    expect(mockDeleteConversation).toHaveBeenCalledWith('conversation-old');
    expect(mockUpdateConversation).toHaveBeenCalledWith('conversation-new', {
      botEndpoint: {
        id: 'endpoint-1',
        botId: 'bot-1',
        botUrl: 'http://localhost:3978/api/message',
        msaAppId: undefined,
        msaPassword: undefined,
        accessToken: undefined,
        accessTokenExpires: undefined,
      },
      locale: 'en-us',
      conversationId: 'conversation-new',
      members: [
        { id: 'bot-1', name: 'Bot' },
        { id: 'user-old', name: 'user-old' },
      ],
      chatMode: 'livechat',
      user: { name: 'user-old', id: 'user-new' },
      nextWatermark: 0,
      codeVerifier: undefined,
      transcript: [],
      activities: [],
    });
  });
});
