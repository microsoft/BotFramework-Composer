// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import nanoid from 'nanoid';

export function generateUniqueId(size = 6) {
  return nanoid(size);
}
