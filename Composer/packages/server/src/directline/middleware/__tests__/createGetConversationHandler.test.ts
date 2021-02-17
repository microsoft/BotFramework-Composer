// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as HttpStatus from 'http-status-codes';

import { BotErrorCodes, createAPIException } from '../../utils/apiErrorException';
import { createGetConversationHandler } from '../createGetConversationHandler';

describe('getConversation handler', () => {
  it('should get a conversation and attach it to the conversation', () => {
    const state: any = {
      conversations: {
        conversationById: jest.fn(() => 'some conversation'),
      },
    };
    const req: any = {
      params: {
        conversationId: 'convo1',
      },
    };
    const res: any = {};
    const next = jest.fn();
    const getConversation = createGetConversationHandler(state);
    getConversation(req, res, next);

    expect(req.conversation).toEqual('some conversation');
    expect(next).toHaveBeenCalled();
  });

  it('should throw an exception if the conversation is not found', () => {
    const state: any = {
      conversations: {
        conversationById: jest.fn(() => undefined),
      },
    };
    const req: any = {
      params: {
        conversationId: 'convo1',
      },
    };
    const res: any = {};
    const next = jest.fn();
    const getConversation = createGetConversationHandler(state);

    try {
      getConversation(req, res, next);
      expect(true).toBe(false); // ensure that catch is hit
    } catch (e) {
      expect(e).toEqual(createAPIException(HttpStatus.NOT_FOUND, BotErrorCodes.BadArgument, 'conversation not found'));
    }
  });
});
