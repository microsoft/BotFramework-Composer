// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type WebchatLogType = 'Error' | 'Warn' | 'Info';

export type WebchatLog = {
  logType: WebchatLogType;
  status: number;
  timestamp: string;
  route: string;
  message: string;
  details?: string;
};
