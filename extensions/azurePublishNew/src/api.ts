// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

//TODO: Delete this file when the api layer is ready

import { Subscription } from '@botframework-composer/types';

export const getSubscriptions = (accessToken: string): Promise<Subscription[]> => {
  return new Promise((resolve) => {
    resolve([]);
  });
};
