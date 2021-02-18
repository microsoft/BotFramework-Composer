// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { StatusCodes } from 'http-status-codes';

import { createNewConversationHandler } from '../createNewConversationHandler';

describe('startConversation handler', () => {
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

  beforeEach(() => {
    mockJsonResponse.mockClear();
    mockStatus.mockClear();
    res = {
      send: mockSend,
      status: mockStatus,
    };
  });

  it('should send a 201 with a create conversation response when the conversation does not exist', () => {
    const mockNewConversation = {
      id: 'convo1',
      conversationId: 'convo1',
      members: [],
      normalize: jest.fn(),
      botEndpoint: { botId: 'bot1', id: 'someEndpointId' },
    };

    const context: any = {
      state: {
        conversations: {
          conversationById: jest.fn(() => undefined),
          newConversation: jest.fn(() => mockNewConversation),
        },
        users: {
          currentUserId: 'user1',
        },
        endpoints: {
          set: jest.fn(),
        },
      },
    };
    const createConversation = createNewConversationHandler(context.state);
    const req: any = {
      body: {
        bot: {},
        conversationId: 'convo1',
        members: [{ id: 'member1', role: 'user' }],
        mode: 'livechat',
      },
      botEndpoint: { botId: 'bot1', id: 'someEndpointId' },
    };

    createConversation(req, res);

    expect(mockStatus).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(mockJsonResponse).toHaveBeenCalledWith({
      conversationId: mockNewConversation.conversationId,
      endpointId: req.botEndpoint.id,
      members: mockNewConversation.members,
      id: mockNewConversation.conversationId,
    });
  });
  it('should send an error response if the request is invalid (missing botEndpoint)', () => {
    const createConversation = createNewConversationHandler({} as any);
    const req: any = {
      body: {
        bot: {},
      },
    };
    createConversation(req, res);
    expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(mockSend).toHaveBeenCalledWith(new Error('Missing botEndpoint object in request.'));
    expect(mockEnd).toHaveBeenCalled();
  });

  it('should send an error response if the request is invalid (missing user)', () => {
    const createConversation = createNewConversationHandler({} as any);
    const req: any = {
      body: {
        bot: {},
        members: [],
      },
      botEndpoint: {},
    };

    createConversation(req, res);

    expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(mockSend).toHaveBeenCalledWith(new Error('Missing user inside of members array in request.'));
    expect(mockEnd).toHaveBeenCalled();
  });
});
