// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { atomFamily } from 'recoil';
import { WebchatLog } from '@botframework-composer/types';

const getFullyQualifiedKey = (value: string) => {
  return `Webchat_${value}_State`;
};

export const webchatLogsState = atomFamily<WebchatLog[], string>({
  key: getFullyQualifiedKey('logs'),
  default: [],
});
