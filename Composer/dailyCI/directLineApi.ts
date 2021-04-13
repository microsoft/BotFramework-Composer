// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as axios from 'axios';

import { isSuccessful } from './uitils';
const host = 'https://directline.botframework.com/v3/directline/conversations';

/**
 * Create a conversation with bot.
 * @param token Directline token.
 * @returns Conversation id.
 */
export async function createConversation(token: string) {
  const response = await axios.default({
    url: host,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!isSuccessful(response.status)) {
    throw new Error('createConversation failed.');
  }

  return response.data;
}

/**
 * Send message by directline.
 * @param content Message to send.
 * @param conversationId conversation id.
 * @param token directline token.
 */
export async function directLineSendMessage(content: string, conversationId: string, token: string) {
  const endpoint = `${host}/${conversationId}/activities`;
  const response = await axios.default({
    url: endpoint,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      locale: 'en-us',
      type: 'message',
      from: {
        id: 'test_user',
      },
      text: content,
    },
  });

  if (!isSuccessful(response.status)) {
    throw new Error('createConversation failed.');
  }
  return response.data;
}

/**
 * Get response by conversation id.
 * @param conversationId conversation id.
 * @param token Directline token.
 * @returns Response.
 */
export async function directLineGetLastResponse(conversationId: string, token: string) {
  const endpoint = `${host}/${conversationId}/activities`;
  const response = await axios.default({
    url: endpoint,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!isSuccessful(response.status)) {
    throw new Error('directLineGetLastResponse failed.');
  }

  return response.data;
}
