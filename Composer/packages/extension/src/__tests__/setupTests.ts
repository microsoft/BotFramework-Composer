// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { writeJsonSync } from 'fs-extra';

const mockManifest = {
  extension1: {
    id: 'extension1',
  },
  extension2: {
    id: 'extension2',
  },
};

beforeEach(() => {
  writeJsonSync(process.env.COMPOSER_EXTENSION_DATA as string, mockManifest);
});
