// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { atom } from 'recoil';
import { WebchatLog } from '@botframework-composer/types';

const getFullyQualifiedKey = (value: string) => {
  return `Webchat_${value}_State`;
};
export const webchatLogsState = atom<WebchatLog[]>({
  key: getFullyQualifiedKey('logs'),
  default: [],
});
