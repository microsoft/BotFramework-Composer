// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { v4 as uuid } from 'uuid';

export function getSessionId(): string {
  return uuid();
}
