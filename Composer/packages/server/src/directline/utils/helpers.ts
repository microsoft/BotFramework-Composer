// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { v4 as uuid } from 'uuid';

import { LogItem, LogItemType, LoggerLevel } from '../store/types';

export const getBotDataKey = (channelId: string, conversationId: string, userId: string) => {
  return `$${channelId || '*'}!${conversationId || '*'}!${userId || '*'}`;
};

export const generateUniqueId = () => {
  return uuid().toString();
};

export function textItem(level: LoggerLevel, text: string): LogItem {
  return {
    type: LogItemType.Text,
    payload: {
      level,
      text,
    },
  };
}

export function statusCodeFamily(statusCode: number | string, expectedFamily: number) {
  if (typeof statusCode === 'string') {
    statusCode = +statusCode;
  }

  return Math.floor(statusCode / 100) === Math.floor(expectedFamily / 100);
}
