// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { v4 as uuid } from 'uuid';

import { LogItem, LogItemType, LoggerLevel } from '../store/types';

export function getBotDataKey(channelId: string, conversationId: string, userId: string): string {
  return `$${channelId || '*'}!${conversationId || '*'}!${userId || '*'}`;
}

export function generateUniqueId(): string {
  return uuid().toString();
}

export function textItem(level: LoggerLevel, text: string): LogItem {
  return {
    type: LogItemType.Text,
    payload: {
      level,
      text,
    },
  };
}

export function statusCodeFamily(statusCode: number | string, expectedFamily: number): boolean {
  if (typeof statusCode === 'string') {
    statusCode = +statusCode;
  }
  return Math.floor(statusCode / 100) === Math.floor(expectedFamily / 100);
}

export function validateRequest(payload): Error | undefined {
  if (!payload.bot) {
    return new Error('Missing bot object in request.');
  } else if (!payload.botEndpoint) {
    return new Error('Missing botEndpoint object in request.');
  } else if (payload.members.length !== 1 || payload.members[0].role !== 'user') {
    return new Error('Missing user inside of members array in request.');
  }
}
