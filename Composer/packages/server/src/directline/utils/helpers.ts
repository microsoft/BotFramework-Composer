// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { v4 as uuid } from 'uuid';

export function getBotDataKey(channelId: string, conversationId: string, userId: string): string {
  return `$${channelId || '*'}!${conversationId || '*'}!${userId || '*'}`;
}

export const generateUniqueId = (): string => {
  return uuid().toString();
};

export const statusCodeFamily = (statusCode: number, expectedFamily: number): boolean => {
  return Math.floor(statusCode / 100) === Math.floor(expectedFamily / 100);
};

export const validateRequest = (payload): Error | undefined => {
  if (!payload.bot) {
    return new Error('Missing bot object in request.');
  } else if (!payload.botEndpoint) {
    return new Error('Missing botEndpoint object in request.');
  } else if (payload.members.length !== 1 || payload.members[0].role !== 'user') {
    return new Error('Missing user inside of members array in request.');
  }
};
